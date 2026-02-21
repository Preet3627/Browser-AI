const { screen, dialog, BrowserWindow } = require('electron');

const ACTION_TYPES = ['click', 'type', 'key', 'scroll'];
const BUTTONS = ['left', 'right', 'middle'];
const MODIFIERS = ['command', 'control', 'alt', 'shift'];
const SCROLL_DIRS = ['up', 'down', 'left', 'right'];

const ALWAYS_CONFIRM_ACTIONS = ['click', 'type', 'key'];

class RobotService {
  constructor(permissionStore) {
    this.perms = permissionStore;
    this.lastAction = 0;
    this.MIN_DELAY_MS = 300;
    this.killFlag = false;
    this.robot = null;

    try {
      this.robot = require('robotjs');
    } catch (e) {
      try {
        this.robot = require('@jitsi/robotjs');
      } catch (e2) {
        console.warn('[RobotService] robotjs not available:', e.message);
      }
    }
  }

  get isAvailable() {
    return this.robot !== null;
  }

  kill() {
    this.killFlag = true;
    this.perms.revoke('robot');
    this.perms.logAudit('robot.kill: Emergency kill switch activated');
    console.log('[RobotService] KILL SWITCH activated — all robot permissions revoked');
  }

  resetKill() {
    this.killFlag = false;
  }

  _validateAction(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Action must be an object');
    }
    if (!ACTION_TYPES.includes(raw.type)) {
      throw new Error(`Invalid action type: ${raw.type}`);
    }

    const action = { type: raw.type, reason: String(raw.reason || 'No reason provided') };

    switch (raw.type) {
      case 'click': {
        action.x = Math.round(Number(raw.x));
        action.y = Math.round(Number(raw.y));
        if (!Number.isFinite(action.x) || !Number.isFinite(action.y) || action.x < 0 || action.y < 0) {
          throw new Error(`Invalid coordinates: (${raw.x}, ${raw.y})`);
        }
        action.button = BUTTONS.includes(raw.button) ? raw.button : 'left';
        action.double = Boolean(raw.double);
        break;
      }
      case 'type': {
        action.text = String(raw.text || '');
        if (action.text.length === 0) throw new Error('Type action requires non-empty text');
        if (action.text.length > 2000) throw new Error('Type text exceeds 2000 char limit');
        break;
      }
      case 'key': {
        action.key = String(raw.key || '');
        if (!action.key) throw new Error('Key action requires a key');
        action.modifiers = (raw.modifiers || []).filter(m => MODIFIERS.includes(m));
        break;
      }
      case 'scroll': {
        action.x = Math.round(Number(raw.x || 0));
        action.y = Math.round(Number(raw.y || 0));
        if (!SCROLL_DIRS.includes(raw.direction)) {
          throw new Error(`Invalid scroll direction: ${raw.direction}`);
        }
        action.direction = raw.direction;
        action.amount = Math.min(20, Math.max(1, Number(raw.amount) || 3));
        break;
      }
    }
    return action;
  }

  _validateCoords(x, y) {
    const displays = screen.getAllDisplays();
    const valid = displays.some(d =>
      x >= d.bounds.x && x < d.bounds.x + d.bounds.width &&
      y >= d.bounds.y && y < d.bounds.y + d.bounds.height
    );
    if (!valid) {
      throw new Error(`Coordinates (${x}, ${y}) are outside all display bounds`);
    }
  }

  async _showConfirmDialog(action) {
    let message;
    switch (action.type) {
      case 'click':
        message = `Click "${action.button}" at (${action.x}, ${action.y})${action.double ? ' (double-click)' : ''}`;
        break;
      case 'type':
        message = `Type text: "${action.text.slice(0, 100)}${action.text.length > 100 ? '...' : ''}"`;
        break;
      case 'key':
        message = `Press key: ${action.modifiers?.length ? action.modifiers.join('+') + '+' : ''}${action.key}`;
        break;
      case 'scroll':
        message = `Scroll ${action.direction} (${action.amount}x) at (${action.x}, ${action.y})`;
        break;
    }

    const focusedWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!focusedWindow) return true;

    const result = await dialog.showMessageBox(focusedWindow, {
      type: 'question',
      buttons: ['Allow', 'Deny'],
      defaultId: 1,
      cancelId: 1,
      title: 'Comet-AI Robot Action',
      message: `AI wants to perform a desktop action:`,
      detail: `${message}\n\nReason: ${action.reason}`,
    });

    return result.response === 0;
  }

  async execute(raw, opts = {}) {
    if (!this.robot) {
      throw new Error('robotjs not available. Install with: npm install robotjs');
    }

    if (this.killFlag) {
      throw new Error('Robot actions are disabled (kill switch active)');
    }

    const action = this._validateAction(raw);

    if (!this.perms.isGranted('robot')) {
      throw new Error('Robot permission not granted. Enable in Settings > Permissions.');
    }

    if (action.type === 'click' || action.type === 'scroll') {
      this._validateCoords(action.x, action.y);
    }

    if (ALWAYS_CONFIRM_ACTIONS.includes(action.type) && !opts.skipConfirm) {
      const allowed = await this._showConfirmDialog(action);
      if (!allowed) {
        this.perms.logAudit(`robot.denied: ${action.type} — ${action.reason}`);
        throw new Error('User denied the robot action');
      }
    }

    this.perms.logAudit(`robot.execute: ${action.type} — ${action.reason}`);

    const now = Date.now();
    if (now - this.lastAction < this.MIN_DELAY_MS) {
      await new Promise(r => setTimeout(r, this.MIN_DELAY_MS));
    }

    if (this.killFlag) {
      throw new Error('Robot actions aborted (kill switch activated during delay)');
    }

    switch (action.type) {
      case 'click':
        this.robot.moveMouse(action.x, action.y);
        await sleep(80);
        this.robot.mouseClick(action.button, action.double);
        break;
      case 'type':
        this.robot.typeString(action.text);
        break;
      case 'key':
        this.robot.keyTap(action.key, action.modifiers || []);
        break;
      case 'scroll':
        this.robot.moveMouse(action.x, action.y);
        this.robot.scrollMouse(action.amount, action.direction);
        break;
    }

    this.lastAction = Date.now();
    return { success: true, action: action.type, reason: action.reason };
  }

  async executeSequence(actions, opts = {}) {
    const results = [];
    for (const raw of actions) {
      if (this.killFlag) {
        results.push({ success: false, error: 'Aborted by kill switch' });
        break;
      }
      try {
        const result = await this.execute(raw, opts);
        results.push(result);
      } catch (e) {
        results.push({ success: false, error: e.message });
        if (opts.stopOnError !== false) break;
      }
    }
    return results;
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = { RobotService };

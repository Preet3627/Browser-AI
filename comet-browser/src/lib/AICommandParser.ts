/**
 * Robust AI Command Parser
 * Handles extraction and validation of AI commands from LLM responses
 */

export interface ParsedCommand {
    type: string;
    value: string;
    originalMatch: string;
    index: number;
}

export interface CommandParseResult {
    commands: ParsedCommand[];
    textWithoutCommands: string;
    hasCommands: boolean;
}

// All supported command types
export const SUPPORTED_COMMANDS = [
    'NAVIGATE',
    'SEARCH',
    'SET_THEME',
    'OPEN_VIEW',
    'RELOAD',
    'GO_BACK',
    'GO_FORWARD',
    'SCREENSHOT_AND_ANALYZE',
    'WEB_SEARCH',
    'READ_PAGE_CONTENT',
    'LIST_OPEN_TABS',
    'GENERATE_PDF',
    'GENERATE_DIAGRAM',
    'SHELL_COMMAND',
    'SET_BRIGHTNESS',
    'SET_VOLUME',
    'OPEN_APP',
    'FILL_FORM',
    'SCROLL_TO',
    'EXTRACT_DATA',
    'CREATE_NEW_TAB_GROUP',
    'OCR_COORDINATES',
    'OCR_SCREEN',
    'CLICK_ELEMENT',
    'FIND_AND_CLICK',
    'GMAIL_AUTHORIZE',
    'GMAIL_LIST_MESSAGES',
    'GMAIL_GET_MESSAGE',
    'GMAIL_SEND_MESSAGE',
    'GMAIL_ADD_LABEL',
    'WAIT',
    'GUIDE_CLICK',
    'EXPLAIN_CAPABILITIES',
] as const;

export type CommandType = typeof SUPPORTED_COMMANDS[number];

/**
 * Parse AI response and extract commands
 * More robust than regex - handles edge cases and malformed commands
 */
export function parseAICommands(content: string): CommandParseResult {
    const commands: ParsedCommand[] = [];
    const commandsSet = new Set(SUPPORTED_COMMANDS);

    // Build regex dynamically from supported commands
    const commandPattern = SUPPORTED_COMMANDS.join('|');
    const commandRegex = new RegExp(`\\[(${commandPattern})(?::\\s*([^\\]]+?))?\\]`, 'gi');

    let match;
    let lastIndex = 0;
    const textParts: string[] = [];

    // Reset regex state
    commandRegex.lastIndex = 0;

    while ((match = commandRegex.exec(content)) !== null) {
        const [fullMatch, commandType, commandValue = ''] = match;

        // Validate command type
        if (!commandsSet.has(commandType.toUpperCase() as CommandType)) {
            continue;
        }

        // Add text before this command
        if (match.index > lastIndex) {
            textParts.push(content.substring(lastIndex, match.index));
        }

        commands.push({
            type: commandType.toUpperCase(),
            value: commandValue.trim(),
            originalMatch: fullMatch,
            index: match.index,
        });

        lastIndex = commandRegex.lastIndex;
    }

    // Add remaining text after last command
    if (lastIndex < content.length) {
        textParts.push(content.substring(lastIndex));
    }

    return {
        commands,
        textWithoutCommands: textParts.join('').trim(),
        hasCommands: commands.length > 0,
    };
}

/**
 * Validate command value based on command type
 */
export function validateCommand(command: ParsedCommand): { valid: boolean; error?: string } {
    const { type, value } = command;

    switch (type) {
        case 'NAVIGATE':
        case 'SEARCH':
        case 'WEB_SEARCH':
            if (!value) {
                return { valid: false, error: `${type} requires a value` };
            }
            break;

        case 'SET_VOLUME':
        case 'SET_BRIGHTNESS':
            const percentage = parseInt(value, 10);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                return { valid: false, error: `${type} requires a percentage between 0-100` };
            }
            break;

        case 'WAIT':
            const duration = parseInt(value, 10);
            if (isNaN(duration) || duration < 0) {
                return { valid: false, error: 'WAIT requires a positive duration in milliseconds' };
            }
            break;

        case 'FILL_FORM':
            if (!value.includes('|')) {
                return { valid: false, error: 'FILL_FORM requires format: selector | value' };
            }
            break;

        case 'GENERATE_PDF':
            if (!value.includes('|')) {
                return { valid: false, error: 'GENERATE_PDF requires format: title | content' };
            }
            break;

        // Commands that don't require values
        case 'RELOAD':
        case 'GO_BACK':
        case 'GO_FORWARD':
        case 'SCREENSHOT_AND_ANALYZE':
        case 'READ_PAGE_CONTENT':
        case 'LIST_OPEN_TABS':
        case 'GMAIL_AUTHORIZE':
        case 'EXPLAIN_CAPABILITIES':
            // These are valid without values
            break;

        default:
            // For other commands, just check if value exists when needed
            if (!value && type !== 'OCR_SCREEN') {
                return { valid: false, error: `${type} requires a value` };
            }
    }

    return { valid: true };
}

/**
 * Extract commands and prepare for execution
 */
export function prepareCommandsForExecution(content: string): {
    commands: ParsedCommand[];
    responseText: string;
    invalidCommands: Array<{ command: ParsedCommand; error: string }>;
} {
    const parseResult = parseAICommands(content);
    const invalidCommands: Array<{ command: ParsedCommand; error: string }> = [];
    const validCommands: ParsedCommand[] = [];

    for (const command of parseResult.commands) {
        const validation = validateCommand(command);
        if (validation.valid) {
            validCommands.push(command);
        } else {
            invalidCommands.push({ command, error: validation.error || 'Unknown error' });
        }
    }

    return {
        commands: validCommands,
        responseText: parseResult.textWithoutCommands,
        invalidCommands,
    };
}

/**
 * Generate user-friendly command description
 */
export function getCommandDescription(command: ParsedCommand): string {
    const { type, value } = command;

    const descriptions: Record<string, (v: string) => string> = {
        NAVIGATE: (v) => `Navigate to ${v}`,
        SEARCH: (v) => `Search for "${v}"`,
        SET_THEME: (v) => `Change theme to ${v}`,
        OPEN_VIEW: (v) => `Open ${v} view`,
        RELOAD: () => 'Reload page',
        GO_BACK: () => 'Go back',
        GO_FORWARD: () => 'Go forward',
        SCREENSHOT_AND_ANALYZE: () => 'Capture and analyze screenshot',
        WEB_SEARCH: (v) => `Search web for "${v}"`,
        READ_PAGE_CONTENT: () => 'Read current page content',
        LIST_OPEN_TABS: () => 'List all open tabs',
        GENERATE_PDF: (v) => `Generate PDF: ${v.split('|')[0]}`,
        GENERATE_DIAGRAM: (v) => 'Generate diagram',
        SHELL_COMMAND: (v) => `Execute: ${v.substring(0, 40)}...`,
        SET_BRIGHTNESS: (v) => `Set brightness to ${v}%`,
        SET_VOLUME: (v) => `Set volume to ${v}%`,
        OPEN_APP: (v) => `Open ${v}`,
        FILL_FORM: (v) => `Fill form field: ${v.split('|')[0]}`,
        SCROLL_TO: (v) => `Scroll to ${v}`,
        EXTRACT_DATA: (v) => `Extract data from ${v}`,
        CREATE_NEW_TAB_GROUP: (v) => `Create tab group: ${v.split('|')[0]}`,
        OCR_COORDINATES: (v) => `OCR region: ${v}`,
        OCR_SCREEN: (v) => v ? `OCR screen region: ${v}` : 'OCR full screen',
        CLICK_ELEMENT: (v) => `Click element: ${v}`,
        FIND_AND_CLICK: (v) => `Find and click "${v}"`,
        GMAIL_AUTHORIZE: () => 'Authorize Gmail',
        GMAIL_LIST_MESSAGES: (v) => `List Gmail messages: ${v.split('|')[0]}`,
        GMAIL_GET_MESSAGE: (v) => `Get Gmail message: ${v}`,
        GMAIL_SEND_MESSAGE: (v) => `Send email to ${v.split('|')[0]}`,
        GMAIL_ADD_LABEL: (v) => `Add Gmail label: ${v.split('|')[1]}`,
        WAIT: (v) => `Wait ${parseInt(v) / 1000} seconds`,
        GUIDE_CLICK: (v) => `Guide click: ${v.split('|')[0]}`,
        EXPLAIN_CAPABILITIES: () => 'Explain AI capabilities',
    };

    const descFn = descriptions[type];
    return descFn ? descFn(value) : `${type}: ${value}`;
}

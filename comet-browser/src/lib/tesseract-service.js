const { desktopCapturer, screen } = require('electron');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('[TesseractService] sharp not available, preprocessing disabled:', e.message);
}

class TesseractOcrService {
  constructor() {
    this.worker = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized && this.worker) return;
    try {
      this.worker = await createWorker('eng');
      this.initialized = true;
      console.log('[TesseractService] Worker initialized');
    } catch (e) {
      console.error('[TesseractService] Failed to init worker:', e.message);
      this.worker = null;
      this.initialized = false;
      throw e;
    }
  }

  async terminate() {
    if (this.worker) {
      try { await this.worker.terminate(); } catch (e) {}
      this.worker = null;
      this.initialized = false;
    }
  }

  async captureScreen(displayId) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const scaleFactor = primaryDisplay.scaleFactor || 1;
    const { width, height } = primaryDisplay.size;
    const thumbnailSize = {
      width: Math.min(4096, Math.round(width * scaleFactor)),
      height: Math.min(4096, Math.round(height * scaleFactor)),
    };

    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize });
    const source = displayId
      ? sources.find(s => s.display_id === String(displayId)) || sources[0]
      : sources[0];

    if (!source || !source.thumbnail) {
      throw new Error('Could not capture screen');
    }

    return {
      png: source.thumbnail.toPNG(),
      scaleFactor,
      captureWidth: thumbnailSize.width,
      captureHeight: thumbnailSize.height,
      screenWidth: width,
      screenHeight: height,
    };
  }

  async preprocessImage(pngBuffer) {
    if (!sharp) return pngBuffer;

    try {
      return await sharp(pngBuffer)
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.5 })
        .resize({ width: 3840, kernel: 'lanczos3' })
        .png()
        .toBuffer();
    } catch (e) {
      console.warn('[TesseractService] Preprocessing failed, using raw image:', e.message);
      return pngBuffer;
    }
  }

  async captureAndOcr(displayId) {
    await this.init();

    const capture = await this.captureScreen(displayId);
    const processed = await this.preprocessImage(capture.png);

    const tempPath = path.join(os.tmpdir(), `comet-ocr-${Date.now()}.png`);
    fs.writeFileSync(tempPath, processed);

    let data;
    try {
      const result = await this.worker.recognize(tempPath);
      data = result.data;
    } catch (e) {
      console.error('[TesseractService] OCR failed:', e.message);
      try { await this.terminate(); } catch (_) {}
      throw e;
    } finally {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }

    const scaleX = capture.screenWidth / capture.captureWidth;
    const scaleY = capture.screenHeight / capture.captureHeight;
    const preprocessScale = sharp ? 3840 / capture.captureWidth : 1;

    const words = (data.words || [])
      .filter(w => w.confidence > 60 && (w.text || '').trim().length > 0)
      .map(w => {
        const bbox = w.bbox;
        const rawCenterX = (bbox.x0 + bbox.x1) / 2;
        const rawCenterY = (bbox.y0 + bbox.y1) / 2;

        const centerX = Math.round((rawCenterX / preprocessScale) * scaleX);
        const centerY = Math.round((rawCenterY / preprocessScale) * scaleY);

        return {
          text: w.text.trim(),
          confidence: w.confidence,
          bbox: {
            x0: Math.round((bbox.x0 / preprocessScale) * scaleX),
            y0: Math.round((bbox.y0 / preprocessScale) * scaleY),
            x1: Math.round((bbox.x1 / preprocessScale) * scaleX),
            y1: Math.round((bbox.y1 / preprocessScale) * scaleY),
          },
          centerX,
          centerY,
        };
      });

    return words;
  }

  async ocrClick(targetDescription, aiEngine, robotService, permissionStore) {
    const words = await this.captureAndOcr();

    if (words.length === 0) {
      return { success: false, error: 'No text found on screen' };
    }

    const searchLower = targetDescription.toLowerCase();
    const directMatch = words.find(w =>
      w.text.toLowerCase().includes(searchLower) ||
      searchLower.includes(w.text.toLowerCase())
    );

    if (directMatch) {
      await robotService.execute({
        type: 'click',
        x: directMatch.centerX,
        y: directMatch.centerY,
        reason: `OCR direct click: "${directMatch.text}"`,
      });
      return { success: true, clickedText: directMatch.text, method: 'direct' };
    }

    if (!aiEngine) {
      return { success: false, error: `Text "${targetDescription}" not found on screen (no AI fallback)` };
    }

    const wordList = words
      .slice(0, 100)
      .map((w, i) => `[${i}] "${w.text}" at (${w.centerX}, ${w.centerY})`)
      .join('\n');

    try {
      const response = await aiEngine.chat({
        model: 'llama-3.1-8b-instant',
        systemPrompt: 'You resolve UI click targets from OCR data. Respond with ONLY a JSON object: {"index": N, "text": "matched text"} or {"index": -1} if not found. No other text.',
        message: `Target: "${targetDescription}"\n\nOCR words:\n${wordList}`,
      });

      const cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const result = JSON.parse(cleaned);

      if (result.index < 0 || result.index >= words.length) {
        return { success: false, error: `AI could not find "${targetDescription}" on screen` };
      }

      const target = words[result.index];
      await robotService.execute({
        type: 'click',
        x: target.centerX,
        y: target.centerY,
        reason: `OCR AI click: "${target.text}" (target: "${targetDescription}")`,
      });

      return { success: true, clickedText: target.text, method: 'ai-resolved' };
    } catch (e) {
      return { success: false, error: `AI resolution failed: ${e.message}` };
    }
  }

  async getScreenText(displayId) {
    const words = await this.captureAndOcr(displayId);
    return words.map(w => w.text).join(' ');
  }
}

module.exports = { TesseractOcrService };

const fetch = require('cross-fetch');

class CometAiEngine {
  constructor() {
    this.keys = {};
  }

  configure(keys) {
    this.keys = { ...this.keys, ...keys };
  }

  _getKey(name) {
    return this.keys[name] || process.env[name] || '';
  }

  _inferProvider(model) {
    if (model.startsWith('gemini')) return 'gemini';
    if (model.startsWith('llama') || model.startsWith('mixtral')) return 'groq';
    if (model.startsWith('gpt') || model.startsWith('o')) return 'openai';
    if (model.startsWith('claude')) return 'anthropic';
    return 'groq';
  }

  async chat({ message, model, systemPrompt, history, onChunk }) {
    const provider = this._inferProvider(model || 'llama-3.3-70b-versatile');
    switch (provider) {
      case 'gemini': return this._chatGemini({ message, model, systemPrompt, history, onChunk });
      case 'groq': return this._chatGroq({ message, model, systemPrompt, history, onChunk });
      case 'openai': return this._chatOpenAI({ message, model, systemPrompt, history, onChunk });
      case 'anthropic': return this._chatAnthropic({ message, model, systemPrompt, history, onChunk });
      default: return this._chatGroq({ message, model, systemPrompt, history, onChunk });
    }
  }

  async _chatGroq({ message, model, systemPrompt, history, onChunk }) {
    const apiKey = this._getKey('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    for (const h of (history || [])) messages.push(h);
    messages.push({ role: 'user', content: message });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 8192,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (onChunk) onChunk(text);
    return text;
  }

  async _chatGemini({ message, model, systemPrompt, history, onChunk }) {
    const apiKey = this._getKey('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const contents = [];
    if (systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: 'Understood.' }] });
    }
    for (const h of (history || [])) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash-preview'}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (onChunk) onChunk(text);
    return text;
  }

  async _chatOpenAI({ message, model, systemPrompt, history, onChunk }) {
    const apiKey = this._getKey('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    for (const h of (history || [])) messages.push(h);
    messages.push({ role: 'user', content: message });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-5.2',
        messages,
        max_tokens: 8192,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (onChunk) onChunk(text);
    return text;
  }

  async _chatAnthropic({ message, model, systemPrompt, history, onChunk }) {
    const apiKey = this._getKey('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const messages = [];
    for (const h of (history || [])) messages.push(h);
    messages.push({ role: 'user', content: message });

    const body = {
      model: model || 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages,
    };
    if (systemPrompt) body.system = systemPrompt;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    if (onChunk) onChunk(text);
    return text;
  }
}

module.exports = { CometAiEngine };

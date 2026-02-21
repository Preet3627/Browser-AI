const fetch = require('cross-fetch');

class WebSearchProvider {
  constructor() {
    this.keys = {};
  }

  configure(keys) {
    this.keys = { ...this.keys, ...keys };
  }

  _getKey(name) {
    return this.keys[name] || process.env[name] || '';
  }

  async search(query, provider, count) {
    provider = provider || this._detectBestProvider();
    count = count || 8;

    switch (provider) {
      case 'brave': return this._searchBrave(query, count);
      case 'tavily': return this._searchTavily(query, count);
      case 'serp': return this._searchSerp(query, count);
      default: return this._searchBrave(query, count);
    }
  }

  _detectBestProvider() {
    if (this._getKey('BRAVE_API_KEY')) return 'brave';
    if (this._getKey('TAVILY_API_KEY')) return 'tavily';
    if (this._getKey('SERP_API_KEY')) return 'serp';
    return 'brave';
  }

  getAvailableProviders() {
    const providers = [];
    if (this._getKey('BRAVE_API_KEY')) providers.push('brave');
    if (this._getKey('TAVILY_API_KEY')) providers.push('tavily');
    if (this._getKey('SERP_API_KEY')) providers.push('serp');
    return providers;
  }

  async _searchBrave(query, count) {
    const apiKey = this._getKey('BRAVE_API_KEY');
    if (!apiKey) throw new Error('BRAVE_API_KEY not configured');

    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      { headers: { 'X-Subscription-Token': apiKey } }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Brave Search error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return (data.web?.results || []).map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.description || '',
    }));
  }

  async _searchTavily(query, count) {
    const apiKey = this._getKey('TAVILY_API_KEY');
    if (!apiKey) throw new Error('TAVILY_API_KEY not configured');

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: count,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Tavily Search error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return (data.results || []).map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.content || '',
    }));
  }

  async _searchSerp(query, count) {
    const apiKey = this._getKey('SERP_API_KEY');
    if (!apiKey) throw new Error('SERP_API_KEY not configured');

    const res = await fetch(
      `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=${count}&engine=google`
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`SerpAPI error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return (data.organic_results || []).map(r => ({
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
    }));
  }

  async searchForContext(query, provider) {
    try {
      const results = await this.search(query, provider, 5);
      return results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}`)
        .join('\n\n');
    } catch (e) {
      console.warn(`[WebSearch] ${e.message}`);
      return '';
    }
  }
}

module.exports = { WebSearchProvider };

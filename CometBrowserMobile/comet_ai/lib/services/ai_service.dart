import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

enum AIProvider { gemini, openai, groq }

class AIService {
  static final AIService _instance = AIService._internal();
  factory AIService() => _instance;
  AIService._internal();

  String? _geminiKey;
  String? _openaiKey;
  String? _groqKey;

  String _geminiModel = 'gemini-3-pro'; // Default to latest
  String _openaiModel = 'gpt-4o'; // Default to latest flagship

  AIProvider _currentProvider = AIProvider.gemini;

  Future<void> loadKeys() async {
    final prefs = await SharedPreferences.getInstance();
    _geminiKey = prefs.getString('api_key_gemini');
    _openaiKey = prefs.getString('api_key_openai');
    _groqKey = prefs.getString('api_key_groq');
    _geminiModel = prefs.getString('ai_model_gemini') ?? 'gemini-3-pro';
    _openaiModel = prefs.getString('ai_model_openai') ?? 'gpt-4o';

    // Default to Gemini if others empty
    final providerStr = prefs.getString('ai_provider') ?? 'gemini';
    _currentProvider = AIProvider.values.firstWhere(
      (e) => e.toString().split('.').last == providerStr,
      orElse: () => AIProvider.gemini,
    );
  }

  Future<void> setModel(AIProvider provider, String model) async {
    final prefs = await SharedPreferences.getInstance();
    if (provider == AIProvider.gemini) {
      _geminiModel = model;
      await prefs.setString('ai_model_gemini', model);
    } else if (provider == AIProvider.openai) {
      _openaiModel = model;
      await prefs.setString('ai_model_openai', model);
    }
  }

  String getModel(AIProvider provider) {
    return provider == AIProvider.gemini ? _geminiModel : _openaiModel;
  }

  Future<void> saveKey(AIProvider provider, String key) async {
    final prefs = await SharedPreferences.getInstance();
    switch (provider) {
      case AIProvider.gemini:
        _geminiKey = key;
        await prefs.setString('api_key_gemini', key);
        break;
      case AIProvider.openai:
        _openaiKey = key;
        await prefs.setString('api_key_openai', key);
        break;
      case AIProvider.groq:
        _groqKey = key;
        await prefs.setString('api_key_groq', key);
        break;
    }
  }

  Future<void> setProvider(AIProvider provider) async {
    _currentProvider = provider;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ai_provider', provider.toString().split('.').last);
  }

  Future<String> analyzeText(String prompt) async {
    if (_currentProvider == AIProvider.gemini &&
        (_geminiKey == null || _geminiKey!.isEmpty)) {
      return "Gemini API Key missing. Please add it in settings.";
    }
    if (_currentProvider == AIProvider.openai &&
        (_openaiKey == null || _openaiKey!.isEmpty)) {
      return "OpenAI API Key missing. Please add it in settings.";
    }
    if (_currentProvider == AIProvider.groq &&
        (_groqKey == null || _groqKey!.isEmpty)) {
      return "Groq API Key missing. Please add it in settings.";
    }

    try {
      switch (_currentProvider) {
        case AIProvider.gemini:
          return await _queryGemini(prompt);
        case AIProvider.openai:
          return await _queryOpenAI(prompt);
        case AIProvider.groq:
          return await _queryGroq(prompt);
      }
    } catch (e) {
      return "AI Error: $e";
    }
  }

  Future<String> _queryGemini(String prompt) async {
    // Note: Gemini 3 models follow similar URL structure but versioned as v1beta
    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/$_geminiModel:generateContent?key=$_geminiKey',
    );
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        "contents": [
          {
            "parts": [
              {"text": prompt},
            ],
          },
        ],
      }),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return json['candidates'][0]['content']['parts'][0]['text'];
    } else {
      throw Exception('Gemini API Error: ${response.body}');
    }
  }

  Future<String> _queryOpenAI(String prompt) async {
    final url = Uri.parse('https://api.openai.com/v1/chat/completions');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_openaiKey',
      },
      body: jsonEncode({
        "model": _openaiModel,
        "messages": [
          {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
      }),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return json['choices'][0]['message']['content'];
    } else {
      throw Exception('OpenAI API Error: ${response.body}');
    }
  }

  Future<String> _queryGroq(String prompt) async {
    // Groq is OpenAI compatible
    final url = Uri.parse('https://api.groq.com/openai/v1/chat/completions');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_groqKey',
      },
      body: jsonEncode({
        "model": "mixtral-8x7b-32768", // Default Groq model
        "messages": [
          {"role": "user", "content": prompt},
        ],
      }),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return json['choices'][0]['message']['content'];
    } else {
      throw Exception('Groq API Error: ${response.body}');
    }
  }
}

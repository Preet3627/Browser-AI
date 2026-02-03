import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:ui';
import 'tabs_panel.dart';

class BrowserPage extends StatefulWidget {
  const BrowserPage({super.key});

  @override
  State<BrowserPage> createState() => _BrowserPageState();
}

class _BrowserPageState extends State<BrowserPage> {
  late final WebViewController _controller;
  final TextEditingController _urlController = TextEditingController(text: 'https://www.google.com');
  bool _isLoading = false;
  double _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _progress = progress / 100;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _urlController.text = url;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://www.google.com'));
  }

  void _loadUrl() {
    String url = _urlController.text.trim();
    if (!url.startsWith('http')) {
      if (url.contains('.') && !url.contains(' ')) {
        url = 'https://$url';
      } else {
        url = 'https://www.google.com/search?q=${Uri.encodeComponent(url)}';
      }
    }
    _controller.loadRequest(Uri.parse(url));
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020205),
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.cyan.withOpacity(0.15),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),

          // Main Content
          SafeArea(
            child: Column(
              children: [
                // Top Bar (Address Bar)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    children: [
                      _buildGlassButton(
                        icon: LucideIcons.settings,
                        onTap: () {
                          // Handle settings
                        },
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: Row(
                            children: [
                              const SizedBox(width: 14),
                              Icon(LucideIcons.shieldCheck, size: 18, color: Colors.cyan[400]),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: _urlController,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                                  decoration: const InputDecoration(
                                    border: InputBorder.none,
                                    hintText: 'Search or enter URL',
                                    hintStyle: TextStyle(color: Colors.white24),
                                  ),
                                  onSubmitted: (_) => _loadUrl(),
                                ),
                              ),
                              if (_isLoading)
                                Padding(
                                  padding: const EdgeInsets.only(right: 12),
                                  child: SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.cyan[400]!),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // WebView
                Expanded(
                  child: Stack(
                    children: [
                      WebViewWidget(controller: _controller),
                      if (_progress < 1.0)
                        Positioned(
                          top: 0,
                          left: 0,
                          right: 0,
                          child: LinearProgressIndicator(
                            value: _progress,
                            backgroundColor: Colors.transparent,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.cyan[400]!),
                            minHeight: 2,
                          ),
                        ),
                    ],
                  ),
                ),

                // Bottom Navigation
                Container(
                  padding: EdgeInsets.only(
                    top: 15,
                    bottom: MediaQuery.of(context).padding.bottom + 10,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF020205),
                    border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildNavIcon(LucideIcons.arrowLeft, onTap: () async {
                        if (await _controller.canGoBack()) _controller.goBack();
                      }),
                      _buildNavIcon(LucideIcons.arrowRight, onTap: () async {
                        if (await _controller.canGoForward()) _controller.goForward();
                      }),
                      _buildCenterButton(),
                      _buildNavIcon(LucideIcons.rotateCw, onTap: () => _controller.reload()),
                      _buildNavIcon(LucideIcons.plus, color: Colors.cyan[400], onTap: () {
                        // Handle new tab
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassButton({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Icon(icon, size: 20, color: Colors.cyan[400]),
      ),
    );
  }

  Widget _buildNavIcon(IconData icon, {Color? color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Icon(icon, size: 24, color: color ?? Colors.white.withOpacity(0.6)),
    );
  }

  Widget _buildCenterButton() {
    return GestureDetector(
      onTap: () async {
        final url = await showModalBottomSheet<String>(
          context: context,
          backgroundColor: Colors.transparent,
          isScrollControlled: true,
          builder: (context) => const FractionallySizedBox(
            heightFactor: 0.8,
            child: TabsPanel(),
          ),
        );
        if (url != null && mounted) {
          _controller.loadRequest(Uri.parse(url));
        }
      },
      child: Container(
        width: 56,
        height: 56,
        margin: const EdgeInsets.only(top: -40),
        decoration: BoxDecoration(
          color: Colors.cyan[400],
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.cyan[400]!.withOpacity(0.4),
              blurRadius: 20,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: const Icon(LucideIcons.layers, color: Colors.black, size: 28),
      ),
    );
  }
}

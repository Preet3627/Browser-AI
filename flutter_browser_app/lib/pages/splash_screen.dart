import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/browser_model.dart';
import '../models/webview_model.dart';
import '../models/window_model.dart';
import '../webview_tab.dart';
import 'package:provider/provider.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'ai_chat_page.dart';
import 'agent_chat_page.dart';
import 'package:google_fonts/google_fonts.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.4, 1.0, curve: Curves.easeIn),
      ),
    );

    _rotationAnimation = Tween<double>(begin: 0.0, end: 2 * 3.14159).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.8, curve: Curves.easeInOutExpo),
      ),
    );

    _controller.forward();

    Timer(const Duration(milliseconds: 3000), () async {
      if (mounted) {
        final intentData = await const MethodChannel(
          'com.comet_ai_com.comet_ai.intent_data',
        ).invokeMethod<String>('getIntentData');

        if (intentData != null && intentData.isNotEmpty) {
          _handleIntentData(intentData);
        } else {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      }
    });
  }

  void _handleIntentData(String data) {
    if (data == "comet-ai://search") {
      Navigator.of(context).pushReplacementNamed('/home');
    } else if (data == "comet-ai://ai") {
      Navigator.of(context).pushReplacementNamed('/ai-chat');
    } else if (data == "comet-ai://voice") {
      // Voice search can be home with focus or a specific voice UI if exists
      Navigator.of(context).pushReplacementNamed(
        '/home',
        arguments: {'focus': true, 'voice': true},
      );
    } else if (data.startsWith('http://') || data.startsWith('https://')) {
      final windowModel = Provider.of<WindowModel>(context, listen: false);
      windowModel.addTab(
        WebViewTab(
          key: GlobalKey(),
          webViewModel: WebViewModel(url: WebUri(data)),
        ),
      );
      Navigator.of(context).pushReplacementNamed('/browser');
    } else {
      // It's likely shared text or PROCESS_TEXT
      if (data.startsWith('>>')) {
        Navigator.of(context).pushReplacementNamed(
          '/agent-chat',
          arguments: {'task': data.substring(2).trim()},
        );
      } else {
        Navigator.of(
          context,
        ).pushReplacementNamed('/ai-chat', arguments: {'initialMessage': data});
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Glow
          Center(
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF00E5FF).withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Logo
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _rotationAnimation.value,
                      child: Transform.scale(
                        scale: _scaleAnimation.value,
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00E5FF).withOpacity(0.5),
                                blurRadius: 30,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: Image.asset(
                              'assets/icon/icon.png',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  const Icon(
                                    Icons.rocket_launch,
                                    size: 80,
                                    color: Color(0xFF00E5FF),
                                  ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 40),

                // Animated Text
                FadeTransition(
                  opacity: _opacityAnimation,
                  child: Column(
                    children: [
                      Text(
                        'COMET',
                        style: GoogleFonts.outfit(
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 10,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'INTELLIGENT BROWSING',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF00E5FF).withOpacity(0.8),
                          letterSpacing: 4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Loading Indicator at bottom
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _opacityAnimation,
              child: Center(
                child: SizedBox(
                  width: 40,
                  height: 40,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      const Color(0xFF00E5FF).withOpacity(0.5),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

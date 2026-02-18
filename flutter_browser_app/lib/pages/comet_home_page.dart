import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:provider/provider.dart';
import '../models/window_model.dart';
import '../models/webview_model.dart';
import '../webview_tab.dart';
import 'dart:ui';

/// Custom Comet-AI Home Page with vibrant glassmorphism UI
class CometHomePage extends StatefulWidget {
  final Function(String)? onSearch;

  const CometHomePage({Key? key, this.onSearch}) : super(key: key);

  @override
  State<CometHomePage> createState() => _CometHomePageState();
}

class _CometHomePageState extends State<CometHomePage>
    with SingleTickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text;
      final windowModel = Provider.of<WindowModel>(context, listen: false);

      // Check if it's a URL or search query
      String url = query;
      if (!query.startsWith('http://') && !query.startsWith('https://')) {
        if (query.contains('.') && !query.contains(' ')) {
          url = 'https://$query';
        } else {
          url = 'https://www.google.com/search?q=${Uri.encodeComponent(query)}';
        }
      }

      windowModel.addTab(
        WebViewTab(
          key: GlobalKey(),
          webViewModel: WebViewModel(url: WebUri(url)),
        ),
      );

      Navigator.pushNamed(context, '/browser');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: Colors.black),
      child: Stack(
        children: [
          // Animated background particles/stars
          ...List.generate(30, (index) => _buildStar(index)),

          // Main content
          SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const SizedBox(height: 60),

                    // Animated Comet-AI Logo
                    _buildAnimatedLogo(),

                    const SizedBox(height: 20),

                    // "Ask Comet-AI anything" text
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [
                          Color(0xFF00E5FF),
                          Color(0xFFD500F9),
                          Color(0xFF00E5FF),
                        ],
                      ).createShader(bounds),
                      child: const Text(
                        'Comet-AI Browser',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'Outfit',
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    // Search bar with glassmorphism
                    _buildSearchBar(),

                    const SizedBox(height: 30),

                    // Quick action buttons
                    _buildQuickActions(),

                    const SizedBox(height: 30),

                    // Social shortcuts
                    _buildSocialShortcuts(),

                    const SizedBox(height: 30),

                    // Additional features
                    _buildFeatureButtons(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStar(int index) {
    final random = index * 0.1;
    return Positioned(
      left: (index * 37.0) % MediaQuery.of(context).size.width,
      top: (index * 53.0) % MediaQuery.of(context).size.height,
      child: AnimatedBuilder(
        animation: _glowAnimation,
        builder: (context, child) {
          return Opacity(
            opacity: (0.3 + random * 0.4) * _glowAnimation.value,
            child: Container(
              width: 2 + (index % 3),
              height: 2 + (index % 3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5FF).withOpacity(0.4),
                    blurRadius: 6,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAnimatedLogo() {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(
                  0xFF00E5FF,
                ).withOpacity(0.3 * _glowAnimation.value),
                blurRadius: 40,
                spreadRadius: 15,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(5.0),
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.black,
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/icon/icon.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const Icon(
                    Icons.rocket_launch,
                    size: 70,
                    color: Color(0xFF00E5FF),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchBar() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(30),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(
              color: const Color(0xFF00E5FF).withOpacity(0.3),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00E5FF).withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: Color(0xFF00E5FF), size: 24),
              const SizedBox(width: 15),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontFamily: 'Inter',
                  ),
                  decoration: InputDecoration(
                    hintText: 'Search or enter address',
                    hintStyle: TextStyle(
                      color: Colors.white.withOpacity(0.4),
                      fontFamily: 'Inter',
                    ),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (_) => _handleSearch(),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.arrow_forward, color: Color(0xFF00E5FF)),
                onPressed: _handleSearch,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      mainAxisSpacing: 15,
      crossAxisSpacing: 15,
      childAspectRatio: 1.5,
      children: [
        _buildActionButton('Generate Art', Icons.palette, [
          Color(0xFFE91E63),
          Color(0xFFD500F9),
        ], () => widget.onSearch?.call('generate art')),
        _buildActionButton(
          'Ask Questions',
          Icons.question_answer,
          [Color(0xFF00BCD4), Color(0xFF29B6F6)],
          () => widget.onSearch?.call('ask question'),
        ),
        _buildActionButton(
          'Summarize Text',
          Icons.description,
          [Color(0xFF5C6BC0), Color(0xFF7E57C2)],
          () => widget.onSearch?.call('summarize'),
        ),
        _buildActionButton('Write Code', Icons.code, [
          Color(0xFF26A69A),
          Color(0xFF00E676),
        ], () => widget.onSearch?.call('write code')),
      ],
    );
  }

  Widget _buildActionButton(
    String title,
    IconData icon,
    List<Color> gradientColors,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  gradientColors[0].withOpacity(0.2),
                  gradientColors[1].withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: gradientColors[0], size: 32),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialShortcuts() {
    final socials = [
      {
        'icon': 'https://www.facebook.com/favicon.ico',
        'url': 'https://facebook.com',
        'color': Color(0xFF1877F2),
      },
      {
        'icon': 'https://twitter.com/favicon.ico',
        'url': 'https://twitter.com',
        'color': Color(0xFF1DA1F2),
      },
      {
        'icon': 'https://instagram.com/favicon.ico',
        'url': 'https://instagram.com',
        'color': Color(0xFFE4405F),
      },
      {
        'icon': 'https://youtube.com/favicon.ico',
        'url': 'https://youtube.com',
        'color': Color(0xFFFF0000),
      },
      {
        'icon': 'https://google.com/favicon.ico',
        'url': 'https://google.com',
        'color': Color(0xFF4285F4),
      },
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: socials.map((social) {
        return _buildSocialButton(
          social['url'] as String,
          social['color'] as Color,
        );
      }).toList(),
    );
  }

  Widget _buildSocialButton(String url, Color color) {
    return GestureDetector(
      onTap: () => widget.onSearch?.call(url),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: [color.withOpacity(0.3), color.withOpacity(0.1)],
          ),
          border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
        ),
        child: Icon(Icons.link, color: color, size: 28),
      ),
    );
  }

  Widget _buildFeatureButtons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildFeatureIcon(Icons.settings, 'Settings', () {
          Navigator.pushNamed(context, '/settings');
        }),
        _buildFeatureIcon(Icons.qr_code_scanner, 'Connect PC', () {
          Navigator.pushNamed(context, '/connect-desktop');
        }),
        _buildFeatureIcon(Icons.bookmark, 'Bookmarks', () {
          Navigator.pushNamed(context, '/bookmarks');
        }),
      ],
    );
  }

  Widget _buildFeatureIcon(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(15),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  Color(0xFF29B6F6).withOpacity(0.2),
                  Color(0xFFD500F9).withOpacity(0.1),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Icon(icon, color: Color(0xFF29B6F6), size: 24),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontFamily: 'Inter',
            ),
          ),
        ],
      ),
    );
  }
}

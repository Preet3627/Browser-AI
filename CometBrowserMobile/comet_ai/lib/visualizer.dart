import 'package:flutter/material.dart';
import 'dart:math' as math;

class Visualizer extends StatefulWidget {
  const Visualizer({super.key});

  @override
  State<Visualizer> createState() => _VisualizerState();
}

class _VisualizerState extends State<Visualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          size: const Size(double.infinity, 200),
          painter: VisualizerPainter(_controller.value),
        );
      },
    );
  }
}

class VisualizerPainter extends CustomPainter {
  final double value;
  VisualizerPainter(this.value);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 6.0;

    final barCount = 15;
    final spacing = size.width / barCount;

    for (int i = 0; i < barCount; i++) {
      // Create a simulated wave effect
      final wave = (math.sin((i * 0.5) + value * 2 * math.pi) + 1) / 2;
      final height = size.height * (0.3 + 0.7 * wave);

      // Gradient color from Cyan to Purple
      paint.shader =
          LinearGradient(
            colors: [Colors.cyan[400]!, Colors.purpleAccent],
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
          ).createShader(
            Rect.fromLTWH(i * spacing, size.height - height, 10, height),
          );

      canvas.drawLine(
        Offset(i * spacing + 10, size.height),
        Offset(i * spacing + 10, size.height - height),
        paint,
      );
    }
  }

  // A simple pseudo-random wave function
  double difficulty(double t) {
    return (0.5 + 0.5 * (t).remainder(1.0)); // Simplified for visual effect
  }

  @override
  bool shouldRepaint(covariant VisualizerPainter oldDelegate) {
    return true;
  }
}

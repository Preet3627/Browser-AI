import 'package:flutter/material.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';

class FeaturesOverlay extends StatelessWidget {
  const FeaturesOverlay({super.key});

  Future<void> _scanText(BuildContext context) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image == null) return;

    final InputImage inputImage = InputImage.fromFilePath(image.path);
    final textRecognizer = TextRecognizer();

    try {
      final RecognizedText recognizedText = await textRecognizer.processImage(
        inputImage,
      );

      if (context.mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: const Color(0xFF0D0D15),
            title: const Text(
              'Recognized Text',
              style: TextStyle(color: Colors.white),
            ),
            content: SingleChildScrollView(
              child: Text(
                recognizedText.text,
                style: const TextStyle(color: Colors.white70),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error recognizing text: $e')));
      }
    } finally {
      textRecognizer.close();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D15),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.document_scanner, color: Colors.cyan),
            title: const Text(
              'Scan Text (OCR)',
              style: TextStyle(color: Colors.white),
            ),
            onTap: () => _scanText(context),
          ),
          ListTile(
            leading: const Icon(Icons.link, color: Colors.purpleAccent),
            title: const Text(
              'URL AI Predictor',
              style: TextStyle(color: Colors.white),
            ),
            subtitle: const Text(
              'Predicts next URLs based on history',
              style: TextStyle(color: Colors.white38, fontSize: 12),
            ),
            onTap: () {
              // Placeholder for prediction logic
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('AI is analyzing your browsing patterns...'),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

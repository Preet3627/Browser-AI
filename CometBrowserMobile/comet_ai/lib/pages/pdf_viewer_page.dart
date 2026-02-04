import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';

class PdfViewerPage extends StatefulWidget {
  final String path;
  final String title;

  const PdfViewerPage({super.key, required this.path, required this.title});

  @override
  State<PdfViewerPage> createState() => _PdfViewerPageState();
}

class _PdfViewerPageState extends State<PdfViewerPage> {
  int _totalPages = 0;
  int _currentPage = 0;
  bool _ready = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020205),
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Text(
                "${_currentPage + 1} / $_totalPages",
                style: const TextStyle(color: Colors.white70),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          PDFView(
            filePath: widget.path,
            enableSwipe: true,
            swipeHorizontal: true,
            autoSpacing: false,
            pageFling: true,
            pageSnap: true,
            defaultPage: 0,
            fitPolicy: FitPolicy.BOTH,
            preventLinkNavigation: false,
            onRender: (pages) {
              setState(() {
                _totalPages = pages!;
                _ready = true;
              });
            },
            onPageChanged: (page, total) {
              setState(() {
                _currentPage = page!;
              });
            },
            onError: (error) {
              print(error.toString());
            },
            onPageError: (page, error) {
              print('$page: ${error.toString()}');
            },
          ),
          if (!_ready)
            const Center(child: CircularProgressIndicator(color: Colors.cyan)),
        ],
      ),
    );
  }
}

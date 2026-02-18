import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:ui';
import 'dart:io';
import '../sync_service.dart';

class ConnectDesktopPage extends StatefulWidget {
  const ConnectDesktopPage({Key? key}) : super(key: key);

  @override
  State<ConnectDesktopPage> createState() => _ConnectDesktopPageState();
}

class _ConnectDesktopPageState extends State<ConnectDesktopPage> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  bool isConnecting = false;
  bool isConnected = false;
  String? desktopIp;
  String? errorMessage;

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  Future<void> _scanQRCode(String qrData) async {
    setState(() {
      isConnecting = true;
      errorMessage = null;
    });

    try {
      // Parse QR code data (format: "comet-ai://connect?ip=xxx&port=xxx&device=xxx")
      final uri = Uri.parse(qrData);
      if (uri.scheme == 'comet-ai' && uri.host == 'connect') {
        final ip = uri.queryParameters['ip'];
        final port = uri.queryParameters['port'];
        final deviceId = uri.queryParameters['device'];

        if (ip != null && port != null && deviceId != null) {
          // Connect to desktop
          await SyncService().connectToDesktop(ip, int.parse(port), deviceId);

          setState(() {
            isConnected = true;
            desktopIp = ip;
            isConnecting = false;
          });

          // Show success message
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Connected to desktop at $ip'),
                backgroundColor: Color(0xFF00E676),
              ),
            );
          }
        } else {
          throw Exception('Invalid QR code data');
        }
      } else {
        throw Exception('Not a Comet-AI QR code');
      }
    } catch (e) {
      setState(() {
        isConnecting = false;
        errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Connect to Desktop',
          style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        color: Colors.black,
        child: SafeArea(
          child: isConnected ? _buildConnectedView() : _buildScannerView(),
        ),
      ),
    );
  }

  Widget _buildScannerView() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              const Icon(
                Icons.qr_code_scanner,
                size: 80,
                color: Color(0xFF00E5FF),
              ),
              const SizedBox(height: 20),
              const Text(
                'Scan QR Code',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontFamily: 'Outfit',
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Open Comet-AI on your desktop and scan the QR code',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.7),
                  fontFamily: 'Inter',
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  QRView(
                    key: qrKey,
                    onQRViewCreated: _onQRViewCreated,
                    overlay: QrScannerOverlayShape(
                      borderColor: const Color(0xFF00E5FF),
                      borderRadius: 20,
                      borderLength: 40,
                      borderWidth: 10,
                      cutOutSize: MediaQuery.of(context).size.width * 0.7,
                    ),
                  ),
                  if (isConnecting)
                    Container(
                      color: Colors.black54,
                      child: const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            CircularProgressIndicator(color: Color(0xFF00E5FF)),
                            SizedBox(height: 20),
                            Text(
                              'Connecting...',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontFamily: 'Inter',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
        if (errorMessage != null)
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: Colors.red.withOpacity(0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          errorMessage!,
                          style: TextStyle(
                            color: Colors.white,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        Padding(
          padding: const EdgeInsets.all(20.0),
          child: _buildInstructionCard(),
        ),
      ],
    );
  }

  Widget _buildConnectedView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF00E676), Color(0xFF00C853)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFF00E676).withOpacity(0.5),
                    blurRadius: 30,
                    spreadRadius: 10,
                  ),
                ],
              ),
              child: Icon(Icons.check, size: 60, color: Colors.white),
            ),
            SizedBox(height: 30),
            Text(
              'Connected!',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontFamily: 'Outfit',
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Desktop: $desktopIp',
              style: TextStyle(
                fontSize: 18,
                color: Colors.white70,
                fontFamily: 'Inter',
              ),
            ),
            SizedBox(height: 40),
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.15),
                        Colors.white.withOpacity(0.05),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.touch_app, size: 40, color: Color(0xFF29B6F6)),
                      SizedBox(height: 15),
                      Text(
                        'You can now control your desktop from this device!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(height: 20),
                      Text(
                        '• Send voice commands\n'
                        '• Execute prompts remotely\n'
                        '• Sync clipboard & history',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  isConnected = false;
                  desktopIp = null;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.withOpacity(0.8),
                padding: EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: Text(
                'Disconnect',
                style: TextStyle(
                  fontSize: 16,
                  fontFamily: 'Inter',
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionCard() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(15),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: EdgeInsets.all(15),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.white.withOpacity(0.1),
                Colors.white.withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Color(0xFF29B6F6)),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Make sure both devices are on the same WiFi network',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      if (scanData.code != null && !isConnecting && !isConnected) {
        _scanQRCode(scanData.code!);
      }
    });
  }
}

import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:ui';
import 'dart:io';
import 'dart:async';
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
  final List<Map<String, dynamic>> _discoveredDevices = [];
  StreamSubscription? _discoverySubscription;

  @override
  void initState() {
    super.initState();
    _startDiscovery();
  }

  void _startDiscovery() {
    SyncService().startDiscovery();
    _discoverySubscription = SyncService().onDeviceDiscovered.listen((device) {
      if (mounted) {
        setState(() {
          if (!_discoveredDevices
              .any((d) => d['deviceId'] == device['deviceId'])) {
            _discoveredDevices.add(device);
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _discoverySubscription?.cancel();
    SyncService().stopDiscovery();
    controller?.dispose();
    super.dispose();
  }

  Future<void> _showPairingCodeDialog(
      String ip, int port, String deviceId) async {
    String pairingCode = "";
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Color(0xFF121212),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Enter Pairing Code',
            style: TextStyle(color: Colors.white, fontFamily: 'Outfit')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter the 6-digit code shown on your desktop screen.',
                style: TextStyle(color: Colors.white70, fontSize: 13)),
            SizedBox(height: 20),
            TextField(
              autofocus: true,
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: TextStyle(
                  color: Colors.white,
                  letterSpacing: 10,
                  fontSize: 24,
                  fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                counterText: "",
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: BorderSide.none),
              ),
              onChanged: (value) => pairingCode = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF00E5FF),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
            onPressed: () async {
              Navigator.pop(context);
              await _connect(ip, port, deviceId, pairingCode);
            },
            child: Text('Connect', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  Future<void> _connect(String ip, int port, String deviceId,
      [String? pairingCode]) async {
    setState(() {
      isConnecting = true;
      errorMessage = null;
    });

    try {
      await SyncService()
          .connectToDesktop(ip, port, deviceId, pairingCode: pairingCode);

      if (mounted) {
        setState(() {
          isConnected = true;
          desktopIp = ip;
          isConnecting = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connected to desktop at $ip'),
            backgroundColor: Color(0xFF00E676),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isConnecting = false;
          errorMessage = e.toString().contains('AUTH_FAILED')
              ? 'Invalid pairing code'
              : 'Connection failed: $e';
        });
      }
    }
  }

  Future<void> _scanQRCode(String qrData) async {
    try {
      final uri = Uri.parse(qrData);
      if (uri.scheme == 'comet-ai' && uri.host == 'connect') {
        final ip = uri.queryParameters['ip'];
        final port = uri.queryParameters['port'];
        final deviceId = uri.queryParameters['device'];

        if (ip != null && port != null && deviceId != null) {
          _showPairingCodeDialog(ip, int.parse(port), deviceId);
        } else {
          throw Exception('Invalid QR code data');
        }
      } else {
        throw Exception('Not a Comet-AI QR code');
      }
    } catch (e) {
      setState(() {
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
    return SingleChildScrollView(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                const Icon(
                  Icons.qr_code_scanner,
                  size: 60,
                  color: Color(0xFF00E5FF),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Scan QR Code',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontFamily: 'Outfit',
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 250,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40.0),
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
                        borderLength: 30,
                        borderWidth: 8,
                        cutOutSize: 200,
                      ),
                    ),
                    if (isConnecting)
                      Container(
                        color: Colors.black54,
                        child: const Center(
                          child: CircularProgressIndicator(
                              color: Color(0xFF00E5FF)),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          if (_discoveredDevices.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 30, 20, 10),
              child: Row(
                children: [
                  Icon(Icons.devices, color: Colors.white38, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'DISCOVERED DEVICES',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            ListView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: _discoveredDevices.length,
              itemBuilder: (context, index) {
                final device = _discoveredDevices[index];
                return Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Material(
                      color: Colors.white.withOpacity(0.05),
                      child: ListTile(
                        onTap: () => _showPairingCodeDialog(
                            device['ip'], device['port'], device['deviceId']),
                        leading: Container(
                          padding: EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Color(0xFF00E5FF).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.desktop_windows,
                              color: Color(0xFF00E5FF)),
                        ),
                        title: Text(device['deviceName'],
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)),
                        subtitle: Text(device['ip'],
                            style: TextStyle(color: Colors.white38)),
                        trailing:
                            Icon(Icons.chevron_right, color: Colors.white24),
                      ),
                    ),
                  ),
                );
              },
            ),
          ] else
            Padding(
              padding: const EdgeInsets.all(40.0),
              child: Column(
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white24),
                  ),
                  SizedBox(height: 10),
                  Text('Searching for local devices...',
                      style: TextStyle(color: Colors.white24, fontSize: 12)),
                ],
              ),
            ),
          if (errorMessage != null)
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Container(
                padding: EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.red.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(errorMessage!,
                          style: TextStyle(color: Colors.white70)),
                    ),
                  ],
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: _buildInstructionCard(),
          ),
        ],
      ),
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
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF00E676), Color(0xFF00C853)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFF00E676).withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Icon(Icons.check, size: 50, color: Colors.white),
            ),
            SizedBox(height: 30),
            Text(
              'Connected!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontFamily: 'Outfit',
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Desktop: $desktopIp',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white70,
                fontFamily: 'Inter',
              ),
            ),
            SizedBox(height: 30),
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.touch_app, size: 30, color: Color(0xFF00E5FF)),
                      SizedBox(height: 15),
                      Text(
                        'Premium Synchronisation Active',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(height: 15),
                      Text(
                        '• Instant Clipboard Sync\n'
                        '• Remote Command Execution\n'
                        '• Secure End-to-End Handshake',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white60,
                          fontFamily: 'Inter',
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 40),
            TextButton(
              onPressed: () {
                SyncService().disconnectFromDesktop();
                setState(() {
                  isConnected = false;
                  desktopIp = null;
                });
                _startDiscovery(); // Restart discovery
              },
              child: Text(
                'DISCONNECT SESSION',
                style: TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionCard() {
    return Container(
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Icon(Icons.security, color: Colors.white24, size: 20),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Connections are secured via local handshake and encrypted with your pairing code.',
              style: TextStyle(
                color: Colors.white24,
                fontSize: 11,
                fontFamily: 'Inter',
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    if (Platform.isAndroid) {
      controller.pauseCamera();
    }
    controller.resumeCamera();
    controller.scannedDataStream.listen((scanData) {
      if (scanData.code != null && !isConnecting && !isConnected) {
        _scanQRCode(scanData.code!);
      }
    });
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_browser/models/browser_model.dart';
import 'package:flutter_browser/pages/settings/android_settings.dart';
import 'package:flutter_browser/pages/settings/cross_platform_settings.dart';
import 'package:flutter_browser/pages/settings/ios_settings.dart';
import 'package:provider/provider.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Settings',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00E5FF)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildSectionHeader('Sync & Connection'),
          _buildSettingsTile(
            context,
            'Connect Desktop',
            'Sync with PC browser',
            Icons.desktop_windows_outlined,
            () => Navigator.pushNamed(context, '/connect-desktop'),
          ),
          const SizedBox(height: 20),
          _buildSectionHeader('Browser Preferences'),
          _buildSettingsTile(
            context,
            'General Settings',
            'Search engine, home page, etc.',
            Icons.language_outlined,
            () => _openSettingsTab(
              context,
              const CrossPlatformSettings(),
              'General Settings',
            ),
          ),
          _buildSettingsTile(
            context,
            'Android Specific',
            'Native Android browser settings',
            Icons.android_outlined,
            () => _openSettingsTab(
              context,
              const AndroidSettings(),
              'Android Settings',
            ),
          ),
          _buildSettingsTile(
            context,
            'iOS Specific',
            'Native iOS browser settings',
            Icons.apple_outlined,
            () =>
                _openSettingsTab(context, const IOSSettings(), 'iOS Settings'),
          ),
          const SizedBox(height: 20),
          _buildSectionHeader('Maintenance'),
          _buildSettingsTile(
            context,
            'Reset Browser Settings',
            'Restore default settings',
            Icons.refresh_outlined,
            () => _showResetDialog(context),
            isDestructive: true,
          ),
        ],
      ),
    );
  }

  void _openSettingsTab(BuildContext context, Widget child, String title) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            title: Text(title, style: const TextStyle(fontFamily: 'Outfit')),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xFF00E5FF)),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          body: child,
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 5),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: const Color(0xFF00E5FF).withOpacity(0.7),
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSettingsTile(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: isDestructive
              ? Colors.redAccent.withOpacity(0.3)
              : const Color(0xFF00E5FF).withOpacity(0.1),
        ),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(
          icon,
          color: isDestructive ? Colors.redAccent : const Color(0xFF00E5FF),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
        ),
        trailing: Icon(
          Icons.chevron_right,
          color: Colors.white.withOpacity(0.3),
        ),
      ),
    );
  }

  void _showResetDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF121212),
        title: const Text(
          'Reset Settings?',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'This will restore all browser settings to their defaults. This action cannot be undone.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'CANCEL',
              style: TextStyle(color: Colors.white60),
            ),
          ),
          TextButton(
            onPressed: () {
              final browserModel = Provider.of<BrowserModel>(
                context,
                listen: false,
              );
              browserModel.updateSettings(BrowserSettings());
              browserModel.save();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Settings reset successfully')),
              );
            },
            child: const Text(
              'RESET',
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );
  }
}

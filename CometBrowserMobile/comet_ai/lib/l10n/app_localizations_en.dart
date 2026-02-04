// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Comet Browser';

  @override
  String get searchHint => 'Search or enter URL';

  @override
  String get aiInsight => 'Comet AI Insight';

  @override
  String get analyzing => 'Analyzing...';

  @override
  String get fullAnalytics => 'FULL ANALYTICS';

  @override
  String get scanText => 'Scan Text (OCR)';

  @override
  String get visualizer => 'Music Visualizer';
}

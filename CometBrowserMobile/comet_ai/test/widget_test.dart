// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:comet_browser_mobile/main.dart';

void main() {
  testWidgets('App launch smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const CometApp());

    // Verify that the browser page is present.
    // Note: Since BrowserPage uses a WebView, actual rendering might differ in tests,
    // but we can check if the widget tree builds without errors.
    expect(find.byType(CometApp), findsOneWidget);
  });
}

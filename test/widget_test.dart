// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:velofit/main.dart';

void main() {
  testWidgets('Setup screen loads', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the setup screen is displayed
    expect(find.text('Bike Fit Setup'), findsOneWidget);
    expect(find.text('Wheel Diameter'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
  });
}

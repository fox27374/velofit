import 'package:flutter/material.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final _controller = TextEditingController(text: '700');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bike Fit Setup')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Wheel Diameter',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                label: Text('Diameter (mm)'),
                border: OutlineInputBorder(),
                hintText: '700',
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                final diameter = double.tryParse(_controller.text) ?? 700;
                Navigator.of(context).pushNamed(
                  '/calibration',
                  arguments: {'wheelDiameter': diameter},
                );
              },
              child: const Text('Proceed to Calibration'),
            ),
          ],
        ),
      ),
    );
  }
}

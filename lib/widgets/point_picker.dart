import 'dart:io';
import 'package:flutter/material.dart';
import '../angle_utils.dart';

/// Photo with draggable measurement markers. Points are reported in PHOTO
/// PIXEL coordinates, so they stay valid regardless of screen size or
/// device orientation.
///
/// Gestures are raw [Listener] pointer events, not a pan gesture, on purpose:
/// a pan only starts once the finger has travelled the touch slop and won the
/// gesture arena against the tap recogniser, which reads as a dead second
/// before the marker moves. Pointer events grab the marker on touch-down.
class PointPicker extends StatefulWidget {
  const PointPicker({
    super.key,
    required this.imageFile,
    required this.photoSize,
    required this.points,
    required this.onChanged,
    required this.maxPoints,
    this.onActiveIndexChanged,
  });

  final File imageFile;
  final Size photoSize;

  /// Placed points, in photo pixels.
  final List<Offset> points;
  final ValueChanged<List<Offset>> onChanged;
  final int maxPoints;

  /// Index of the point currently under the finger, null when none is. Lets a
  /// caller name the point being positioned instead of the next one — a point
  /// is created on touch-down, so the plain count is already one ahead while
  /// the user is still placing it.
  final ValueChanged<int?>? onActiveIndexChanged;

  @override
  State<PointPicker> createState() => _PointPickerState();
}

class _PointPickerState extends State<PointPicker> {
  int? _dragIndex;
  Offset? _pointerPosition;

  /// Marker position minus finger position, so grabbing a marker off-centre
  /// does not snap it under the fingertip.
  Offset _grabDelta = Offset.zero;

  static const double _grabRadius = 44;
  static const double _markerRadius = 14;
  static const double _magnifierSize = 120;

  List<Offset> _widgetPoints(Size boxSize) => widget.points
      .map((p) => photoPixelToWidget(p, widget.photoSize, boxSize))
      .toList();

  Offset _toPhoto(Offset widgetPixel, Size boxSize) {
    final photoPixel =
        widgetToPhotoPixel(widgetPixel, widget.photoSize, boxSize);
    return Offset(
      photoPixel.dx.clamp(0, widget.photoSize.width),
      photoPixel.dy.clamp(0, widget.photoSize.height),
    );
  }

  void _onPointerDown(Offset position, Size boxSize) {
    final widgetPoints = _widgetPoints(boxSize);
    var index = nearestPointIndex(widgetPoints, position, _grabRadius);

    if (index != null) {
      _grabDelta = widgetPoints[index] - position;
    } else if (widget.points.length < widget.maxPoints) {
      index = widget.points.length;
      _grabDelta = Offset.zero;
      widget.onChanged([...widget.points, _toPhoto(position, boxSize)]);
    } else if (widget.maxPoints == 1) {
      index = 0;
      _grabDelta = Offset.zero;
      widget.onChanged([_toPhoto(position, boxSize)]);
    } else {
      return; // Every point is placed and none is under the finger.
    }

    setState(() {
      _dragIndex = index;
      _pointerPosition = position;
    });
    widget.onActiveIndexChanged?.call(index);
  }

  void _onPointerMove(Offset position, Size boxSize) {
    final index = _dragIndex;
    if (index == null) return;

    final points = [...widget.points];
    points[index] = _toPhoto(position + _grabDelta, boxSize);
    widget.onChanged(points);

    setState(() => _pointerPosition = position);
  }

  void _onPointerUp() {
    setState(() {
      _dragIndex = null;
      _pointerPosition = null;
      _grabDelta = Offset.zero;
    });
    widget.onActiveIndexChanged?.call(null);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final boxSize = constraints.biggest;
        final markerColor =
            widget.maxPoints == 1 ? Colors.green : Colors.red;
        final pointer = _pointerPosition;

        return Stack(
          fit: StackFit.expand,
          children: [
            Image.file(widget.imageFile, fit: BoxFit.contain),
            Listener(
              behavior: HitTestBehavior.opaque,
              onPointerDown: (e) => _onPointerDown(e.localPosition, boxSize),
              onPointerMove: (e) => _onPointerMove(e.localPosition, boxSize),
              onPointerUp: (_) => _onPointerUp(),
              onPointerCancel: (_) => _onPointerUp(),
            ),
            ..._widgetPoints(boxSize).asMap().entries.map(
                  (e) => Positioned(
                    left: e.value.dx - _markerRadius,
                    top: e.value.dy - _markerRadius,
                    child: _buildMarker(e.key, markerColor),
                  ),
                ),
            if (pointer != null)
              _buildMagnifier(pointer + _grabDelta, boxSize),
          ],
        );
      },
    );
  }

  Widget _buildMarker(int index, Color color) {
    return SizedBox(
      width: _markerRadius * 2,
      height: _markerRadius * 2,
      child: Stack(
        alignment: Alignment.center,
        // The index sits outside the ring; without this it is clipped away.
        clipBehavior: Clip.none,
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 2),
            ),
          ),
          // Crosshair arms, stopping short of the centre so the pixel being
          // aimed at stays visible.
          Positioned(
            left: _markerRadius - 1,
            top: _markerRadius * 0.3,
            child: Container(width: 2, height: _markerRadius * 0.7, color: color),
          ),
          Positioned(
            left: _markerRadius - 1,
            top: _markerRadius + _markerRadius * 0.3,
            child: Container(width: 2, height: _markerRadius * 0.7, color: color),
          ),
          Positioned(
            left: _markerRadius * 0.3,
            top: _markerRadius - 1,
            child: Container(width: _markerRadius * 0.7, height: 2, color: color),
          ),
          Positioned(
            left: _markerRadius + _markerRadius * 0.3,
            top: _markerRadius - 1,
            child: Container(width: _markerRadius * 0.7, height: 2, color: color),
          ),
          // Which point this is. Only useful when there is more than one.
          if (widget.maxPoints > 1)
            Positioned(
              left: _markerRadius + 8,
              top: _markerRadius - 8,
              child: Text(
                '${index + 1}',
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMagnifier(Offset markerPosition, Size boxSize) {
    // Sits above the marker so the hand does not cover it, clamped into view.
    final x = (markerPosition.dx - _magnifierSize / 2)
        .clamp(0.0, boxSize.width - _magnifierSize);
    final y = (markerPosition.dy - _magnifierSize - 30)
        .clamp(0.0, boxSize.height - _magnifierSize);

    // The lens magnifies whatever is at centre + focalPointOffset, so aim it
    // back at the marker. Without this it magnifies blank sky above.
    final centre = Offset(x + _magnifierSize / 2, y + _magnifierSize / 2);

    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: _magnifierSize,
        height: _magnifierSize,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: RawMagnifier(
          magnificationScale: 2,
          size: const Size(_magnifierSize, _magnifierSize),
          focalPointOffset: markerPosition - centre,
        ),
      ),
    );
  }
}

/// Find the nearest point index within the grab radius, or null if none.
/// [widgetPoints]: list of points in widget pixels
/// [target]: the tap/drag position in widget pixels
/// [radius]: the grab radius in logical pixels
int? nearestPointIndex(List<Offset> widgetPoints, Offset target, double radius) {
  int? nearestIdx;
  double nearestDist = radius;

  for (int i = 0; i < widgetPoints.length; i++) {
    final dist = (widgetPoints[i] - target).distance;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}

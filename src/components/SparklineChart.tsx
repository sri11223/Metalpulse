/**
 * SparklineChart — Lightweight SVG mini chart
 *
 * Draws a trend line from mock data points using react-native-svg.
 * No heavy charting library needed.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Radius } from '../constants/theme';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export default function SparklineChart({
  data,
  width = 300,
  height = 120,
  color = Colors.primary,
  style,
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const padding = 8;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * chartW;
      const y = padding + chartH - ((val - min) / range) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  // Determine trend direction
  const isUp = data[data.length - 1] >= data[0];
  const lineColor = isUp ? Colors.success : Colors.danger;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={Radius.md}
          fill="url(#bg)"
        />
        <Polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface SkeletonLoaderProps {
  lines?: number;
  style?: ViewStyle;
}

function ShimmerLine({ width, delay }: { width: string; delay: number }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim, delay]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[styles.line, { width: width as unknown as number, opacity }]}
    />
  );
}

export default function SkeletonLoader({ lines = 3, style }: SkeletonLoaderProps) {
  const widths = ['80%', '60%', '45%', '70%', '55%'];
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerLine key={i} width={widths[i % widths.length]} delay={i * 150} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  line: {
    height: 14,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgShimmerHighlight,
    marginBottom: Spacing.md,
  },
});

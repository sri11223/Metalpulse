/**
 * AnimatedPrice — displays a price that flashes green/red on change.
 * Uses two SEPARATE Animated.View layers to avoid the
 * "JS driven animation on native node" crash:
 *   • Outer view  → background color flash (useNativeDriver: false)
 *   • Inner view  → scale bump            (useNativeDriver: true)
 * Each Animated.Value only ever drives ONE driver type.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../constants/theme';

interface AnimatedPriceProps {
  value: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: ViewStyle;
  flashOnChange?: boolean;
  direction?: 'up' | 'down' | 'neutral';
}

export default function AnimatedPrice({
  value,
  style,
  containerStyle,
  flashOnChange = true,
  direction = 'neutral',
}: AnimatedPriceProps) {
  /* Each value is driven by exactly ONE driver type */
  const flashAnim = useRef(new Animated.Value(0)).current;   // JS driver only
  const scaleAnim = useRef(new Animated.Value(1)).current;   // native driver only
  const prevValue = useRef(value);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    if (prevValue.current !== value && flashOnChange) {
      const color =
        direction === 'up' ? Colors.green :
        direction === 'down' ? Colors.red :
        Colors.accent;

      setFlashColor(color);

      // Run independently — NOT with Animated.parallel across driver types
      // Flash background (JS driver — needed for color interpolation)
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();

      // Scale bump (native driver — transform)
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevValue.current = value;
  }, [value, flashOnChange, direction]);

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', (flashColor ?? Colors.accent) + '25'],
  });

  return (
    /* Outer: JS-driven background color — its own Animated node */
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: bgColor },
      ]}
    >
      {/* Inner: native-driven scale — separate Animated node */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={style} numberOfLines={1}>
          {value}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
});

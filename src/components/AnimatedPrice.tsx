/**
 * AnimatedPrice — displays a price that flashes green/red on change
 * and smoothly transitions between values. Uses pure RN Animated API
 * (no Reanimated dependency needed).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../constants/theme';

interface AnimatedPriceProps {
  value: string;           // formatted price string
  style?: StyleProp<TextStyle>;       // text styling
  containerStyle?: ViewStyle;
  flashOnChange?: boolean; // default true
  direction?: 'up' | 'down' | 'neutral';
}

export default function AnimatedPrice({
  value,
  style,
  containerStyle,
  flashOnChange = true,
  direction = 'neutral',
}: AnimatedPriceProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    if (prevValue.current !== value && flashOnChange) {
      // Determine direction from change
      const color =
        direction === 'up' ? Colors.green :
        direction === 'down' ? Colors.red :
        Colors.accent;

      setFlashColor(color);

      // Flash background + scale bump
      Animated.parallel([
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
        ]),
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
        ]),
      ]).start();
    }
    prevValue.current = value;
  }, [value, flashOnChange, direction]);

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', (flashColor ?? Colors.accent) + '25'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={style} numberOfLines={1}>
        {value}
      </Text>
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

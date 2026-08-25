import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Glyphs, Motion, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tapped } from '@/lib/haptics';

/**
 * Yuvarlak işaretleyici.
 *
 * Dolgu ve tik anında belirmiyor: tamamlama listedeki en sık hareket, aniden
 * değişen bir kutucuk gözü tırmalıyordu. Tik hafif bir taşmayla (`Easing.back`)
 * yerine oturuyor, dolgu düz bir geçişle geliyor.
 */
export function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const theme = useTheme();

  const fill = useDerivedValue(() =>
    withTiming(checked ? 1 : 0, { duration: Motion.check, easing: Easing.out(Easing.quad) })
  );

  const pop = useDerivedValue(() =>
    withTiming(checked ? 1 : 0, { duration: Motion.check, easing: Easing.out(Easing.back(2.5)) })
  );

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(fill.value, [0, 1], [theme.textSecondary, theme.accent]),
  }));

  // Dolgu ayrı bir katman: kutucuğun zemini saydam kalmalı, yoksa satırın
  // kendi rengiyle karışan bir ara ton çıkıyor.
  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: theme.accent,
    opacity: fill.value,
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: pop.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        tapped();
        onPress();
      }}
      hitSlop={Spacing.three}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}>
      <Animated.View style={[styles.checkbox, boxStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.fill, fillStyle]} />
        <Animated.View style={markStyle}>
          <ThemedText style={[styles.checkmark, { color: theme.onAccent }]}>
            {Glyphs.check}
          </ThemedText>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: Sizes.checkbox,
    height: Sizes.checkbox,
    borderRadius: Sizes.checkbox / 2,
    borderWidth: Sizes.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Sizes.checkbox / 2,
  },
  checkmark: {
    fontSize: FontSize.check,
    lineHeight: FontSize.check + 4,
  },
});

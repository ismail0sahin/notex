import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Glyphs, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={Spacing.three}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.checkbox,
        { borderColor: checked ? theme.accent : theme.textSecondary },
        checked && { backgroundColor: theme.accent },
      ]}>
      {checked ? (
        <ThemedText style={[styles.checkmark, { color: theme.onAccent }]}>
          {Glyphs.check}
        </ThemedText>
      ) : null}
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
  },
  checkmark: {
    fontSize: FontSize.check,
    lineHeight: FontSize.check + 4,
  },
});

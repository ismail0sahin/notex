import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
        <ThemedText style={[styles.checkmark, { color: theme.onAccent }]}>✓</ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    lineHeight: 18,
  },
});

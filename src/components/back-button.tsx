import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/** Sol üstteki geri düğmesi. Panel sağdan geldiği için yön sola bakıyor. */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={Spacing.three}
      accessibilityRole="button"
      accessibilityLabel="Geri">
      <ThemedText themeColor="textSecondary" style={styles.arrow}>
        ←
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrow: {
    fontSize: 24,
    lineHeight: 30,
  },
});

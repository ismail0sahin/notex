import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { FontSize, Glyphs, LineHeight, Spacing } from '@/constants/theme';

/** Sol üstteki geri düğmesi. Panel sağdan geldiği için yön sola bakıyor. */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={Spacing.three}
      accessibilityRole="button"
      accessibilityLabel={Strings.a11y.back}>
      <ThemedText themeColor="textSecondary" style={styles.arrow}>
        {Glyphs.back}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrow: {
    fontSize: FontSize.back,
    lineHeight: LineHeight.back,
  },
});

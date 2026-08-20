import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FabSize, Spacing, TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Ekranın sağ alt köşesinde sabit durur; liste kaydırılsa da yeri değişmez.
 * SafeAreaView'in içine yerleştirilmeli — konumu onun iç kenarına göre hesaplanır,
 * böylece cihazın alt gezinme boşluğu kendiliğinden hesaba katılır.
 */
export function Fab({ onPress, label = '+' }: { onPress: () => void; label?: string }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Yeni ekle"
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
      ]}>
      <ThemedText style={[styles.label, { color: theme.onAccent }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // Ekranın yatay kenar boşluğuna ek olarak; büyütmek düğmeyi sola kaydırır.
    right: Spacing.three,
    bottom: TabBarHeight + Spacing.three,
    width: FabSize,
    height: FabSize,
    borderRadius: FabSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 400,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FabSize, Spacing, TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Çöp kutusu: kapak sapı, kapak ve gövde. İkon paketi kurmamak için View'lerle çizili. */
function TrashGlyph({ color }: { color: string }) {
  return (
    <View style={styles.glyph}>
      <View style={[styles.lidHandle, { backgroundColor: color }]} />
      <View style={[styles.lid, { backgroundColor: color }]} />
      <View style={[styles.can, { borderColor: color }]} />
    </View>
  );
}

const ACTIONS = {
  add: { label: 'Yeni ekle' },
  delete: { label: 'Seçilenleri sil' },
} as const;

/**
 * Ekranın sağ alt köşesinde sabit durur; liste kaydırılsa da yeri değişmez.
 * SafeAreaView'in içine yerleştirilmeli — konumu onun iç kenarına göre hesaplanır,
 * böylece cihazın alt gezinme boşluğu kendiliğinden hesaba katılır.
 */
export function Fab({
  action = 'add',
  onPress,
  bottomInset = TabBarHeight,
}: {
  action?: keyof typeof ACTIONS;
  onPress: () => void;
  /** Altta ne kadar yer bırakılacağı. Sekmeli ekranlarda çubuğun yüksekliği,
   *  tam ekran modallarda 0 verilir — orada sekme çubuğu yok. */
  bottomInset?: number;
}) {
  const theme = useTheme();
  const background = action === 'delete' ? theme.danger : theme.accent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={ACTIONS[action].label}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: background,
          bottom: bottomInset + Spacing.three,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {action === 'delete' ? (
        <TrashGlyph color={theme.onAccent} />
      ) : (
        <ThemedText style={[styles.plus, { color: theme.onAccent }]}>+</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // Ekranın yatay kenar boşluğuna ek olarak; büyütmek düğmeyi sola kaydırır.
    right: Spacing.three,
    width: FabSize,
    height: FabSize,
    borderRadius: FabSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 400,
  },
  glyph: {
    alignItems: 'center',
  },
  lidHandle: {
    width: 9,
    height: 2,
    borderRadius: 1,
  },
  lid: {
    width: 19,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 2,
  },
  can: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 2,
  },
});

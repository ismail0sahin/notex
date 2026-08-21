import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { FontSize, Glyphs, LineHeight, Sizes, Spacing, TabBarHeight } from '@/constants/theme';
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
  add: { label: Strings.a11y.add },
  delete: { label: Strings.a11y.deleteSelected },
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
   *  tam ekran panellerde 0 verilir — orada sekme çubuğu yok. */
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
        <ThemedText style={[styles.plus, { color: theme.onAccent }]}>{Glyphs.add}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // Ekranın yatay kenar boşluğuna ek olarak; büyütmek düğmeyi sola kaydırır.
    right: Spacing.three,
    width: Sizes.fab,
    height: Sizes.fab,
    borderRadius: Sizes.fab / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: FontSize.fab,
    lineHeight: LineHeight.fab,
  },
  glyph: {
    alignItems: 'center',
  },
  lidHandle: {
    width: 9,
    height: Sizes.glyphStroke,
    borderRadius: Sizes.glyphStroke / 2,
  },
  lid: {
    width: 19,
    height: Sizes.glyphStroke + 0.5,
    borderRadius: Sizes.glyphStroke / 2,
    marginTop: 2,
  },
  can: {
    width: 14,
    height: 14,
    borderWidth: Sizes.glyphStroke,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 2,
  },
});

import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { FontSize, Glyphs, LineHeight, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Büyüteç. İkon paketi kurmamak için View'lerle çizili — ⋮ ve tırtıl gibi. */
function LensGlyph({ color }: { color: string }) {
  return (
    <View style={styles.glyph}>
      <View style={[styles.lens, { borderColor: color }]} />
      <View style={[styles.handle, { backgroundColor: color }]} />
    </View>
  );
}

/** Başlıktaki arama düğmesi. */
export function SearchButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={Spacing.three}
      accessibilityRole="button"
      accessibilityLabel={Strings.a11y.search}>
      <LensGlyph color={theme.textSecondary} />
    </Pressable>
  );
}

/**
 * Açıkken başlığın yerini alan arama alanı.
 *
 * Alan kontrolsüz: `value` geri yazılmıyor, yazılan metin yalnızca süzme için
 * dışarı bildiriliyor. Her tuşta value'yu geri yazmak Android klavyesinde
 * ü/ğ/ş gibi harfleri düşürüyor — uygulamadaki bütün alanlar bu yüzden böyle.
 */
export function SearchField({
  onChange,
  onClose,
}: {
  onChange: (query: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();

  return (
    <>
      <LensGlyph color={theme.textSecondary} />

      <TextInput
        autoFocus
        onChangeText={onChange}
        placeholder={Strings.search.placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
      />

      <Pressable
        onPress={onClose}
        hitSlop={Spacing.three}
        accessibilityRole="button"
        accessibilityLabel={Strings.a11y.closeSearch}>
        <ThemedText themeColor="textSecondary">{Glyphs.close}</ThemedText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  glyph: {
    width: Sizes.searchLens + Sizes.glyphStroke * 3,
    height: Sizes.searchLens + Sizes.glyphStroke * 3,
  },
  lens: {
    width: Sizes.searchLens,
    height: Sizes.searchLens,
    borderRadius: Sizes.searchLens / 2,
    borderWidth: Sizes.glyphStroke,
  },
  // Sap merceğin sağ altından 45° çıkıyor.
  handle: {
    position: 'absolute',
    right: Sizes.glyphStroke,
    bottom: Sizes.glyphStroke,
    width: Sizes.glyphStroke,
    height: Sizes.searchLens / 2,
    borderRadius: Sizes.glyphStroke / 2,
    transform: [{ rotate: '-45deg' }],
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    paddingVertical: Spacing.two,
  },
});

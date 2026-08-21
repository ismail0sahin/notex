import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Üç nokta. İkon paketi kurmamak için View'lerle çizili. */
function DotsGlyph({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

/**
 * Başlıktaki ⋮ düğmesi: listeyi sıralama ya da çoklu seçim moduna alır.
 *
 * Modlar menüden açıkça seçiliyor, çünkü ikisi de uzun basışı kullanıyor —
 * hangisinin devrede olduğu kullanıcının kararı olmalı, tahmin edilmemeli.
 */
export function ModeMenu({
  onReorder,
  onSelect,
}: {
  onReorder: () => void;
  onSelect: () => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  function pick(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={Spacing.three}
        accessibilityRole="button"
        accessibilityLabel={Strings.a11y.listMenu}>
        <DotsGlyph color={theme.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Perdeye dokunmak menüyü kapatır; menünün kendisi dokunuşu tutar. */}
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.scrim }]}
          onPress={() => setOpen(false)}>
          <SafeAreaView style={styles.anchor}>
            <View style={[styles.menu, { backgroundColor: theme.backgroundElement }]}>
              <Pressable
                onPress={() => pick(onReorder)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText>{Strings.modes.reorder}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {Strings.modes.reorderDescription}
                </ThemedText>
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.background }]} />

              <Pressable
                onPress={() => pick(onSelect)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText>{Strings.modes.select}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {Strings.modes.selectDescription}
                </ThemedText>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dots: {
    gap: 3,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  dot: {
    width: Sizes.glyphStroke * 2,
    height: Sizes.glyphStroke * 2,
    borderRadius: Sizes.glyphStroke,
  },
  backdrop: {
    flex: 1,
  },
  anchor: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  menu: {
    minWidth: 180,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  item: {
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    height: 1,
  },
});

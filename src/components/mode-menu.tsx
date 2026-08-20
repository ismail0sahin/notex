import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
        accessibilityLabel="Liste menüsü">
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
                <ThemedText>Sırala</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Basılı tutup taşı
                </ThemedText>
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.background }]} />

              <Pressable
                onPress={() => pick(onSelect)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText>Seç</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Çoklu seçip sil
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
    width: 4,
    height: 4,
    borderRadius: 2,
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
    borderRadius: Spacing.three,
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

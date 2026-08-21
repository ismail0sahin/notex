import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { MaxContentWidth, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SheetOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

/**
 * Ortada açılan seçim sayfası: bir soru, altında kartlar.
 *
 * `selected` verilirse o kart aksan çerçevesiyle işaretlenir — mevcut ayarı
 * değiştirirken kullanılır. Yeni bir şey oluştururken boş bırakılır.
 */
export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onCancel,
  onPick,
}: {
  visible: boolean;
  title: string;
  options: readonly SheetOption<T>[];
  selected?: T;
  onCancel: () => void;
  onPick: (value: T) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Perdeye dokunmak kapatır; kartın kendisi dokunuşu tutar. */}
      <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={onCancel}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">{title}</ThemedText>

          {options.map((option) => {
            const picked = option.value === selected;

            return (
              <Pressable
                key={option.value}
                onPress={() => onPick(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor:
                      picked || pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: picked ? theme.accent : theme.borderSubtle,
                  },
                ]}>
                <ThemedText>{option.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {option.description}
                </ThemedText>
              </Pressable>
            );
          })}

          <Pressable onPress={onCancel} style={styles.cancel}>
            <ThemedText type="small" themeColor="textSecondary">
              {Strings.common.cancel}
            </ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.large,
  },
  option: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: Sizes.selectionBorder,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});

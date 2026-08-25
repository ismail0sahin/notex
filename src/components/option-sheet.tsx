import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { MaxContentWidth, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SheetOption<T extends string> = {
  value: T;
  title: string;
  /** Kartın altındaki açıklama. Renk gibi kendini anlatan seçeneklerde boş kalır. */
  description?: string;
  /** Verilirse kartın sağında bu renkte bir daire çizilir. */
  swatch?: string;
};

/**
 * Ortada açılan seçim sayfası: bir soru, altında kartlar.
 *
 * `selected` verilirse o kart aksan çerçevesiyle işaretlenir — mevcut ayarı
 * değiştirirken kullanılır. Yeni bir şey oluştururken boş bırakılır.
 *
 * Plan türü, görünüm ve aksan rengi üçü de bunu kullanıyor; yeni bir seçim
 * gerekirse dördüncü bir sayfa yazmak yerine buraya bir çağrı eklenir.
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
                <View style={styles.optionBody}>
                  <ThemedText>{option.title}</ThemedText>
                  {option.description ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {option.description}
                    </ThemedText>
                  ) : null}
                </View>

                {option.swatch ? (
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: option.swatch, borderColor: theme.borderSubtle },
                    ]}
                  />
                ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: Sizes.selectionBorder,
  },
  optionBody: {
    flex: 1,
    gap: Spacing.half,
  },
  swatch: {
    width: Sizes.swatch,
    height: Sizes.swatch,
    borderRadius: Sizes.swatch / 2,
    borderWidth: Sizes.hairline,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});

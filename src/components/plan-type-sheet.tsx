import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type { PlanKind } from '@/db';
import { useTheme } from '@/hooks/use-theme';

const OPTIONS: { kind: PlanKind; title: string; description: string }[] = [
  {
    kind: 'checklist',
    title: Strings.planTypes.checklistTitle,
    description: Strings.planTypes.checklistDescription,
  },
  {
    kind: 'sorted',
    title: Strings.planTypes.sortedTitle,
    description: Strings.planTypes.sortedDescription,
  },
  {
    kind: 'schedule',
    title: Strings.planTypes.scheduleTitle,
    description: Strings.planTypes.scheduleDescription,
  },
];

/** + basıldığında hangi tür planın açılacağını sorar. */
export function PlanTypeSheet({
  visible,
  onCancel,
  onPick,
}: {
  visible: boolean;
  onCancel: () => void;
  onPick: (kind: PlanKind) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Perdeye dokunmak kapatır; kartın kendisi dokunuşu tutar. */}
      <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={onCancel}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">{Strings.planTypes.question}</ThemedText>

          {OPTIONS.map((option) => (
            <Pressable
              key={option.kind}
              onPress={() => onPick(option.kind)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}>
              <ThemedText>{option.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {option.description}
              </ThemedText>
            </Pressable>
          ))}

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
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});

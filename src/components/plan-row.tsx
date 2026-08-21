import { Pressable, StyleSheet, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { Radius, Sizes, Spacing } from '@/constants/theme';
import type { PlanWithProgress } from '@/db';
import type { ListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

export function PlanRow({
  plan,
  mode,
  picked,
  onOpen,
  onToggle,
  onStartSelect,
}: {
  plan: PlanWithProgress;
  mode: ListMode;
  picked: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onStartSelect: () => void;
}) {
  const theme = useTheme();
  const drag = useReorderableDrag();

  const complete = plan.task_count > 0 && plan.done_count === plan.task_count;
  const progress = plan.task_count === 0 ? 0 : plan.done_count / plan.task_count;

  // Çizelgelerde günün kapsamı; saat girilmemişse yalnızca tür adı görünür.
  const span =
    plan.first_start && plan.last_end
      ? Strings.plans.timeSpan(plan.first_start, plan.last_end)
      : Strings.plans.scheduleLabel;
  const counts =
    plan.task_count === 0
      ? Strings.plans.noTasks
      : Strings.plans.taskProgress(plan.done_count, plan.task_count);
  const secondary =
    plan.kind === 'schedule'
      ? `${span} · ${counts}`
      : plan.kind === 'sorted'
        ? `${Strings.plans.sortedLabel} · ${counts}`
        : counts;

  const handlePress = () => {
    if (mode === 'select') onToggle();
    else if (mode === 'normal') onOpen();
  };

  const handleLongPress = () => {
    if (mode === 'reorder') drag();
    else if (mode === 'normal') onStartSelect();
    else onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: picked || pressed ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: picked ? theme.accent : 'transparent',
        },
      ]}>
      <View style={styles.body}>
        <ThemedText
          numberOfLines={2}
          themeColor={complete ? 'textSecondary' : 'text'}
          style={complete && styles.completeTitle}>
          {plan.title}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {secondary}
        </ThemedText>

        {plan.task_count > 0 ? (
          <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${progress * 100}%` },
              ]}
            />
          </View>
        ) : null}
      </View>

      {mode === 'reorder' ? <DragHandle /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    marginBottom: Spacing.two,
    borderWidth: Sizes.selectionBorder,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  completeTitle: {
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    height: Sizes.progressBar,
    borderRadius: Sizes.progressBar / 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: Sizes.progressBar,
    borderRadius: Sizes.progressBar / 2,
  },
});

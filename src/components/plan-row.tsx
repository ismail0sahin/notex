import { Pressable, StyleSheet, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { PlanWithProgress } from '@/db';
import type { ListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';
import { formatDue, isOverdue } from '@/lib/date';

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
  const dueLabel = formatDue(plan.due_date);
  const overdue = !complete && isOverdue(plan.due_date);
  const progress = plan.task_count === 0 ? 0 : plan.done_count / plan.task_count;

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
        <View style={styles.rowTop}>
          <ThemedText
            numberOfLines={2}
            themeColor={complete ? 'textSecondary' : 'text'}
            style={[styles.title, complete && styles.completeTitle]}>
            {plan.title}
          </ThemedText>
          {dueLabel ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={overdue ? { color: theme.danger } : undefined}>
              {dueLabel}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {plan.task_count === 0
            ? 'Görev yok'
            : `${plan.done_count}/${plan.task_count} görev tamam`}
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
    borderRadius: Spacing.three,
    // Satır aralığı burada: sürüklenen hücrenin yüksekliğine dahil olması gerekiyor.
    marginBottom: Spacing.two,
    borderWidth: 2,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
  },
  completeTitle: {
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});

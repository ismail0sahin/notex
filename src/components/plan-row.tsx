import { Pressable, StyleSheet, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
    plan.first_start && plan.last_end ? `${plan.first_start} – ${plan.last_end}` : 'Çizelge';
  const counts =
    plan.task_count === 0 ? 'Görev yok' : `${plan.done_count}/${plan.task_count} görev tamam`;
  const secondary = plan.kind === 'schedule' ? `${span} · ${counts}` : counts;

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
    borderRadius: Spacing.three,
    // Satır aralığı burada: sürüklenen hücrenin yüksekliğine dahil olması gerekiyor.
    marginBottom: Spacing.two,
    borderWidth: 2,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
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

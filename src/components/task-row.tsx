import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { Checkbox } from '@/components/checkbox';
import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { FontSize, LineHeight, Radius, Sizes, Spacing } from '@/constants/theme';
import type { PlanKind, Task } from '@/db';
import type { ListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

/** Çizelge satırında saat sütunu. Boşken --:-- görünür ve dokunulunca seçici açar. */
function TimeCell({
  value,
  disabled,
  onPress,
  label,
}: {
  value: string | null;
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.timeCell,
        { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
      ]}>
      <ThemedText type="small" themeColor={value ? 'text' : 'textSecondary'}>
        {value ?? Strings.planDetail.emptyTime}
      </ThemedText>
    </Pressable>
  );
}

export function TaskRow({
  task,
  kind,
  mode,
  picked,
  editing,
  onStartEdit,
  onSave,
  onToggleDone,
  onToggle,
  onStartSelect,
  onPickTime,
  showDivider = false,
}: {
  task: Task;
  kind: PlanKind;
  mode: ListMode;
  picked: boolean;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (title: string) => void;
  onToggleDone: () => void;
  onToggle: () => void;
  onStartSelect: () => void;
  onPickTime: (field: 'start' | 'end') => void;
  /** Bu satırın üstüne yapılacaklarla bitenleri ayıran çizgi çizilir. */
  showDivider?: boolean;
}) {
  const theme = useTheme();
  const drag = useReorderableDrag();
  // Kontrolsüz alan: yazılan metin state'e uğramadan burada birikiyor.
  const draftRef = useRef(task.title);

  const done = task.done === 1;
  const normal = mode === 'normal';
  const schedule = kind === 'schedule';

  const handlePress = () => {
    if (mode === 'select') onToggle();
    else if (normal) onStartEdit();
  };

  const handleLongPress = () => {
    if (mode === 'reorder') drag();
    else if (normal) onStartSelect();
    else onToggle();
  };

  return (
    <>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: theme.textSecondary }]} />
      ) : null}

      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.row,
          schedule && styles.scheduleRow,
          {
            backgroundColor:
              picked || pressed
                ? theme.backgroundSelected
                : done
                  ? theme.backgroundDone
                  : theme.backgroundElement,
            borderColor: picked ? theme.accent : theme.borderSubtle,
          },
        ]}>
        {/* Normal mod dışında işaretleyici devre dışı: dokunuş satıra gitsin,
            yoksa aynı hareket hem seçer hem görevi tamamlar. */}
        <View pointerEvents={normal ? 'auto' : 'none'}>
          <Checkbox checked={done} onPress={onToggleDone} />
        </View>

        {editing ? (
          <TextInput
            autoFocus
            defaultValue={task.title}
            onChangeText={(text) => {
              draftRef.current = text;
            }}
            onBlur={() => onSave(draftRef.current)}
            onSubmitEditing={() => onSave(draftRef.current)}
            returnKeyType="done"
            placeholder={Strings.planDetail.taskPlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={[styles.text, { color: theme.text }]}
          />
        ) : (
          <ThemedText numberOfLines={2} style={styles.text}>
            {task.title}
          </ThemedText>
        )}

        {schedule ? (
          <>
            <TimeCell
              value={task.start_time}
              disabled={!normal}
              onPress={() => onPickTime('start')}
              label={Strings.a11y.startTime}
            />
            <TimeCell
              value={task.end_time}
              disabled={!normal}
              onPress={() => onPickTime('end')}
              label={Strings.a11y.endTime}
            />
          </>
        ) : null}

        {mode === 'reorder' ? <DragHandle /> : null}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: Sizes.selectionBorder,
    // Satır aralığı burada: sürüklenen hücrenin yüksekliğine dahil olması gerekiyor.
    marginBottom: Spacing.two,
  },
  // Çizelgede dört sütun var; boşluklar daralmasa isim sütununa yer kalmıyor.
  scheduleRow: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  // Bölüm ayrımı olduğu belli olsun diye kenardan kenara ve kalın.
  divider: {
    height: Sizes.divider,
    borderRadius: Sizes.divider / 2,
    marginBottom: Spacing.three,
  },
  text: {
    flex: 1,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    paddingVertical: Spacing.two,
  },
  timeCell: {
    minWidth: Sizes.timeCell,
    alignItems: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.small,
  },
});

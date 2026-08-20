import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { Checkbox } from '@/components/checkbox';
import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Task } from '@/db';
import type { ListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

export function TaskRow({
  task,
  mode,
  picked,
  editing,
  onStartEdit,
  onSave,
  onToggleDone,
  onToggle,
  onStartSelect,
  onRemove,
}: {
  task: Task;
  mode: ListMode;
  picked: boolean;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (title: string) => void;
  onToggleDone: () => void;
  onToggle: () => void;
  onStartSelect: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const drag = useReorderableDrag();
  // Kontrolsüz alan: yazılan metin state'e uğramadan burada birikiyor.
  const draftRef = useRef(task.title);

  const done = task.done === 1;

  const handlePress = () => {
    if (mode === 'select') onToggle();
    else if (mode === 'normal') onStartEdit();
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
      {/* Normal mod dışında işaretleyici devre dışı: dokunuş satıra gitsin,
          yoksa aynı hareket hem seçer hem görevi tamamlar. */}
      <View pointerEvents={mode === 'normal' ? 'auto' : 'none'}>
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
          placeholder="Görev"
          placeholderTextColor={theme.textSecondary}
          style={[styles.text, { color: theme.text }]}
        />
      ) : (
        <ThemedText
          themeColor={done ? 'textSecondary' : 'text'}
          style={[styles.text, done && styles.doneText]}>
          {task.title}
        </ThemedText>
      )}

      {mode === 'reorder' ? <DragHandle /> : null}

      {mode === 'normal' ? (
        <Pressable
          onPress={onRemove}
          hitSlop={Spacing.two}
          accessibilityRole="button"
          accessibilityLabel="Görevi sil">
          <ThemedText themeColor="textSecondary">✕</ThemedText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 2,
    // Satır aralığı burada: sürüklenen hücrenin yüksekliğine dahil olması gerekiyor.
    marginBottom: Spacing.two,
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: Spacing.two,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
});

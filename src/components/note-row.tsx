import { Pressable, StyleSheet, View } from 'react-native';
import { useReorderableDrag } from 'react-native-reorderable-list';

import { DragHandle } from '@/components/drag-handle';
import { ThemedText } from '@/components/themed-text';
import { Radius, Sizes, Spacing } from '@/constants/theme';
import type { Note } from '@/db';
import type { ListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/date';
import { held } from '@/lib/haptics';
import { notePreview } from '@/lib/note';

/**
 * Uzun basış moda göre iş değiştirir: normalde çoklu seçimi açar, sıralama
 * modunda sürüklemeyi başlatır. drag() yalnızca satırın içinden alınabildiği
 * için bu ayrım burada yapılıyor.
 */
export function NoteRow({
  note,
  mode,
  picked,
  onOpen,
  onToggle,
  onStartSelect,
}: {
  note: Note;
  mode: ListMode;
  picked: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onStartSelect: () => void;
}) {
  const theme = useTheme();
  const drag = useReorderableDrag();
  const { title, preview } = notePreview(note);

  const handlePress = () => {
    if (mode === 'select') onToggle();
    else if (mode === 'normal') onOpen();
  };

  const handleLongPress = () => {
    held();
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
          borderColor: picked ? theme.accent : theme.borderSubtle,
        },
      ]}>
      <View style={styles.body}>
        <ThemedText numberOfLines={1}>{title}</ThemedText>
        {preview ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {preview}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {formatDate(note.updated_at.slice(0, 10))}
        </ThemedText>
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
    // Satır aralığı burada: sürüklenen hücrenin yüksekliğine dahil olması gerekiyor.
    marginBottom: Spacing.two,
    borderWidth: Sizes.selectionBorder,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
});

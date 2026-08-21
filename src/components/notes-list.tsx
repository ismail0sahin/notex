import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { Fab } from '@/components/fab';
import { ModeMenu } from '@/components/mode-menu';
import { NoteRow } from '@/components/note-row';
import { SlidePanel } from '@/components/slide-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Strings } from '@/constants/strings';
import {
  FontSize,
  FontWeight,
  LineHeight,
  MaxContentWidth,
  Radius,
  Sizes,
  Spacing,
  TabBarHeight,
} from '@/constants/theme';
import {
  createNote,
  deleteNotes,
  listNotes,
  reorderNotes,
  setNotesHidden,
  updateNote,
  type Note,
} from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

type Editing = Note | 'new' | null;

/**
 * Not listesi. Hem ana sekmede hem gizli notlar sayfasında aynı bileşen
 * çalışıyor; `hidden` hangi kümenin gösterildiğini ve seçim modundaki eylemin
 * gizlemek mi göstermek mi olduğunu belirliyor.
 */
export function NotesList({
  hidden = false,
  title,
  onBack,
  menuExtra,
}: {
  hidden?: boolean;
  title: string;
  onBack?: () => void;
  menuExtra?: { title: string; description: string; onPress: () => void };
}) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const list = useListMode();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Editing>(null);

  // Alanlar kontrolsüz: yazılan metin state'e uğramıyor, ref'te birikiyor.
  // Her tuşta value'yu geri yazmak Android klavyesinde ü/ğ/ş gibi harfleri düşürüyor.
  const titleRef = useRef('');
  const bodyRef = useRef('');

  const reload = useCallback(async () => {
    setNotes(await listNotes(db, hidden));
  }, [db, hidden]);

  useEffect(() => {
    reload();
  }, [reload]);

  function openNew() {
    titleRef.current = '';
    bodyRef.current = '';
    setEditing('new');
  }

  function openEdit(note: Note) {
    titleRef.current = note.title;
    bodyRef.current = note.body;
    setEditing(note);
  }

  async function save() {
    const nextTitle = titleRef.current.trim();
    const nextBody = bodyRef.current.trim();

    if (!nextTitle && !nextBody) {
      setEditing(null);
      return;
    }

    // Başlık boş bırakılabilir; liste satırında notun ilk satırı başlık yerine geçer.
    if (editing === 'new') {
      await createNote(db, nextTitle, nextBody, hidden);
    } else if (editing) {
      await updateNote(db, editing.id, nextTitle, nextBody);
    }

    setEditing(null);
    reload();
  }

  /** Ekranda hemen uygula, sonra sırayı veritabanına yaz. */
  async function handleReorder({ from, to }: ReorderableListReorderEvent) {
    const next = reorderItems(notes, from, to);
    setNotes(next);
    await reorderNotes(
      db,
      next.map((note) => note.id)
    );
  }

  function confirmDeleteSelected() {
    Alert.alert(Strings.notes.deleteSelectedTitle, Strings.notes.deleteSelectedBody(list.count), [
      { text: Strings.common.cancel, style: 'cancel' },
      {
        text: Strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteNotes(db, list.ids);
          list.reset();
          reload();
        },
      },
    ]);
  }

  /** Seçilenleri gizli listeye taşır ya da geri getirir. */
  async function moveSelected() {
    await setNotesHidden(db, list.ids, !hidden);
    list.reset();
    reload();
  }

  function statusLine() {
    if (list.selecting) return Strings.notes.selected(list.count);
    if (list.reordering) return Strings.modes.reorderHintList;
    return hidden ? Strings.hidden.count(notes.length) : Strings.notes.count(notes.length);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {onBack ? <BackButton onPress={onBack} /> : null}
          <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>

          {list.mode === 'normal' ? (
            <ModeMenu
              onReorder={list.startReorder}
              onSelect={() => list.startSelect()}
              extra={menuExtra}
            />
          ) : (
            <View style={styles.headerActions}>
              {list.selecting && list.count > 0 ? (
                <Pressable onPress={moveSelected} hitSlop={Spacing.three}>
                  <ThemedText type="smallBold">
                    {hidden ? Strings.hidden.unhide : Strings.hidden.hide}
                  </ThemedText>
                </Pressable>
              ) : null}

              <Pressable onPress={list.reset} hitSlop={Spacing.three}>
                <ThemedText themeColor="textSecondary">
                  {list.selecting ? Strings.common.cancel : Strings.common.done}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {statusLine()}
        </ThemedText>

        <View style={[styles.headerRule, { backgroundColor: theme.borderSubtle }]} />

        <ReorderableList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          onReorder={handleReorder}
          dragEnabled={list.reordering}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: theme.borderSubtle }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                {hidden ? Strings.hidden.empty : Strings.notes.empty}
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <NoteRow
              note={item}
              mode={list.mode}
              picked={list.has(item.id)}
              onOpen={() => openEdit(item)}
              onToggle={() => list.toggle(item.id)}
              onStartSelect={() => list.startSelect(item.id)}
            />
          )}
        />

        {list.selecting ? <Fab action="delete" onPress={confirmDeleteSelected} /> : null}
        {list.mode === 'normal' ? <Fab onPress={openNew} /> : null}
      </SafeAreaView>

      {/* Cihazın geri tuşu da aynı yoldan geçiyor, yazılan kaybolmasın. */}
      <SlidePanel visible={editing !== null} onRequestClose={save}>
        {/* Kapanınca içerik sökülüyor; böylece her açılışta defaultValue yeniden okunur. */}
        {editing !== null ? (
          <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              {/* Kaydet düğmesi yok: geri dönmek kaydetmek demek. */}
              <View style={styles.panelHeader}>
                <BackButton onPress={save} />
              </View>

              <TextInput
                defaultValue={titleRef.current}
                onChangeText={(text) => {
                  titleRef.current = text;
                }}
                placeholder={Strings.notes.titlePlaceholder}
                placeholderTextColor={theme.textSecondary}
                style={[styles.titleInput, { color: theme.text }]}
              />

              <TextInput
                defaultValue={bodyRef.current}
                onChangeText={(text) => {
                  bodyRef.current = text;
                }}
                placeholder={Strings.notes.bodyPlaceholder}
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlignVertical="top"
                style={[styles.bodyInput, { color: theme.text }]}
                autoFocus
              />
            </SafeAreaView>
          </ThemedView>
        ) : null}
      </SlidePanel>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  list: {
    paddingTop: Spacing.two,
    paddingBottom: TabBarHeight + Sizes.fab + Spacing.four,
  },
  headerRule: {
    height: Sizes.hairline,
    marginBottom: Spacing.one,
  },
  // Boş liste boşluk gibi durmasın: kesikli çerçeve "buraya eklenecek" diyor.
  empty: {
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderWidth: Sizes.selectionBorder,
    borderStyle: 'dashed',
    borderRadius: Radius.medium,
  },
  emptyText: {
    textAlign: 'center',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  titleInput: {
    fontSize: FontSize.title,
    lineHeight: LineHeight.title,
    fontWeight: FontWeight.heading,
  },
  bodyInput: {
    flex: 1,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
  },
});

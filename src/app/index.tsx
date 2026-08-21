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
  Sizes,
  Spacing,
  TabBarHeight,
} from '@/constants/theme';
import { createNote, deleteNotes, listNotes, reorderNotes, updateNote, type Note } from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

type Editing = Note | 'new' | null;

export default function NotesScreen() {
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
    setNotes(await listNotes(db));
  }, [db]);

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
      await createNote(db, nextTitle, nextBody);
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">{Strings.notes.title}</ThemedText>
          {list.mode === 'normal' ? (
            <ModeMenu onReorder={list.startReorder} onSelect={() => list.startSelect()} />
          ) : (
            <Pressable onPress={list.reset} hitSlop={Spacing.three}>
              <ThemedText themeColor="textSecondary">
                {list.selecting ? Strings.common.cancel : Strings.common.done}
              </ThemedText>
            </Pressable>
          )}
        </View>

        {list.mode === 'normal' ? null : (
          <ThemedText type="small" themeColor="textSecondary">
            {list.selecting ? Strings.notes.selected(list.count) : Strings.modes.reorderHintList}
          </ThemedText>
        )}

        <ReorderableList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          onReorder={handleReorder}
          dragEnabled={list.reordering}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              {Strings.notes.empty}
            </ThemedText>
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

      <SlidePanel visible={editing !== null} onRequestClose={() => setEditing(null)}>
        {/* Kapanınca içerik sökülüyor; böylece her açılışta defaultValue yeniden okunur. */}
        {editing !== null ? (
          <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.panelHeader}>
                <BackButton onPress={() => setEditing(null)} />
                <Pressable onPress={save} hitSlop={Spacing.three}>
                  <ThemedText type="smallBold">{Strings.common.save}</ThemedText>
                </Pressable>
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
  list: {
    paddingTop: Spacing.two,
    paddingBottom: TabBarHeight + Sizes.fab + Spacing.four,
  },
  empty: {
    paddingVertical: Spacing.four,
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

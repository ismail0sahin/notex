import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FabSize, MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';
import { createNote, deleteNote, listNotes, updateNote, type Note } from '@/db';
import { useTheme } from '@/hooks/use-theme';
import { formatDue } from '@/lib/date';

type Editing = Note | 'new' | null;

export default function NotesScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
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

    if (editing === 'new') {
      await createNote(db, nextTitle || 'Başlıksız', nextBody);
    } else if (editing) {
      await updateNote(db, editing.id, nextTitle || 'Başlıksız', nextBody);
    }

    setEditing(null);
    reload();
  }

  function confirmDelete(note: Note) {
    Alert.alert('Notu sil', `"${note.title}" kalıcı olarak silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(db, note.id);
          setEditing(null);
          reload();
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Notlar</ThemedText>

        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Henüz not yok. Sağ alttaki + ile ilk notunu ekle.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openEdit(item)}
              onLongPress={() => confirmDelete(item)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
              ]}>
              <ThemedText numberOfLines={1}>{item.title}</ThemedText>
              {item.body ? (
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {item.body}
                </ThemedText>
              ) : null}
              <ThemedText type="small" themeColor="textSecondary">
                {formatDue(item.updated_at.slice(0, 10)) ?? ''}
              </ThemedText>
            </Pressable>
          )}
        />

        <Fab onPress={openNew} />
      </SafeAreaView>

      <Modal
        visible={editing !== null}
        animationType="slide"
        onRequestClose={() => setEditing(null)}>
        {/* Kapanınca içerik sökülüyor; böylece her açılışta defaultValue yeniden okunur. */}
        {editing !== null ? (
          <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setEditing(null)} hitSlop={Spacing.two}>
                  <ThemedText themeColor="textSecondary">İptal</ThemedText>
                </Pressable>
                <Pressable onPress={save} hitSlop={Spacing.two}>
                  <ThemedText type="smallBold">Kaydet</ThemedText>
                </Pressable>
              </View>

              <TextInput
                defaultValue={titleRef.current}
                onChangeText={(text) => {
                  titleRef.current = text;
                }}
                placeholder="Başlık"
                placeholderTextColor={theme.textSecondary}
                style={[styles.titleInput, { color: theme.text }]}
                autoFocus
              />

              <TextInput
                defaultValue={bodyRef.current}
                onChangeText={(text) => {
                  bodyRef.current = text;
                }}
                placeholder="Not..."
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlignVertical="top"
                style={[styles.bodyInput, { color: theme.text }]}
              />

              {editing !== 'new' ? (
                <Pressable onPress={() => confirmDelete(editing)} style={styles.deleteButton}>
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    Notu sil
                  </ThemedText>
                </Pressable>
              ) : null}
            </SafeAreaView>
          </ThemedView>
        ) : null}
      </Modal>
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
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: TabBarHeight + FabSize + Spacing.four,
  },
  empty: {
    paddingVertical: Spacing.four,
  },
  row: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    paddingVertical: Spacing.three,
  },
});

import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Checkbox } from '@/components/checkbox';
import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FabSize, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  createTask,
  deletePlan,
  deleteTask,
  deleteTasks,
  getPlan,
  listTasks,
  setTaskDone,
  updatePlan,
  updateTask,
  type Task,
} from '@/db';
import { useSelection } from '@/hooks/use-selection';
import { useTheme } from '@/hooks/use-theme';
import { formatDue, todayYmd, tomorrowYmd } from '@/lib/date';

const DUE_OPTIONS = [
  { label: 'Bugün', value: () => todayYmd() },
  { label: 'Yarın', value: () => tomorrowYmd() },
  { label: 'Tarihsiz', value: () => null },
];

/** Planın içeriği: başlık, tarih ve görev listesi. Değişiklikler anında kaydedilir. */
export function PlanDetail({ planId, onClose }: { planId: number; onClose: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const selection = useSelection();
  const [loaded, setLoaded] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // Görev metni normalde düz yazı; dokununca yalnızca o satır düzenlemeye girer.
  // Sürekli açık bir TextInput olsaydı uzun basış Android'in metin seçme
  // menüsüne giderdi ve çoklu seçim hiç tetiklenmezdi.
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Metin alanları kontrolsüz: yazılan metin state'e uğramadan ref'te birikiyor.
  // Her tuşta value'yu geri yazmak Android klavyesinde ü/ğ/ş gibi harfleri düşürüyor.
  const titleRef = useRef('');
  const draftRef = useRef('');
  const newTaskRef = useRef('');
  const newTaskInput = useRef<TextInput>(null);

  const reloadTasks = useCallback(async () => {
    setTasks(await listTasks(db, planId));
  }, [db, planId]);

  useEffect(() => {
    (async () => {
      const plan = await getPlan(db, planId);
      if (plan) {
        titleRef.current = plan.title;
        setDueDate(plan.due_date);
      }
      await reloadTasks();
      setLoaded(true);
    })();
  }, [db, planId, reloadTasks]);

  const planTitle = () => titleRef.current.trim() || 'Başlıksız plan';

  function saveTitle() {
    updatePlan(db, planId, planTitle(), dueDate);
  }

  function selectDue(value: string | null) {
    setDueDate(value);
    updatePlan(db, planId, planTitle(), value);
  }

  async function addTask() {
    const value = newTaskRef.current.trim();
    if (!value) return;

    newTaskRef.current = '';
    newTaskInput.current?.clear();
    await createTask(db, planId, value);
    reloadTasks();
  }

  async function toggleTask(task: Task) {
    await setTaskDone(db, task.id, task.done === 0);
    reloadTasks();
  }

  function startEdit(task: Task) {
    draftRef.current = task.title;
    setEditingTaskId(task.id);
  }

  /** Boşaltılan görev silinir — checklist'te boş satır bırakmanın anlamı yok. */
  async function finishEdit(task: Task) {
    const next = draftRef.current.trim();
    setEditingTaskId(null);

    if (!next) {
      await deleteTask(db, task.id);
    } else if (next !== task.title) {
      await updateTask(db, task.id, next);
    } else {
      return;
    }

    reloadTasks();
  }

  async function removeTask(task: Task) {
    await deleteTask(db, task.id);
    reloadTasks();
  }

  function confirmDeleteSelected() {
    Alert.alert('Seçilenleri sil', `${selection.count} görev kalıcı olarak silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteTasks(db, selection.ids);
          selection.clear();
          reloadTasks();
        },
      },
    ]);
  }

  function confirmDeletePlan() {
    Alert.alert('Planı sil', `"${planTitle()}" ve içindeki görevler silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deletePlan(db, planId);
          onClose();
        },
      },
    ]);
  }

  const doneCount = tasks.filter((task) => task.done === 1).length;

  // Başlık defaultValue ile mount anında okunuyor, o yüzden veri gelmeden alanı açmıyoruz.
  if (!loaded) return <ThemedView style={styles.container} />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={selection.active ? selection.clear : onClose}
            hitSlop={Spacing.two}>
            <ThemedText themeColor="textSecondary">
              {selection.active ? 'Vazgeç' : 'Kapat'}
            </ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            {selection.active
              ? `${selection.count} görev seçili`
              : tasks.length === 0
                ? 'Görev yok'
                : `${doneCount}/${tasks.length} tamamlandı`}
          </ThemedText>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.planHeader}>
              <TextInput
                defaultValue={titleRef.current}
                onChangeText={(text) => {
                  titleRef.current = text;
                }}
                onEndEditing={saveTitle}
                placeholder="Plan adı"
                placeholderTextColor={theme.textSecondary}
                style={[styles.titleInput, { color: theme.text }]}
                multiline
              />

              <View style={styles.chipRow}>
                {DUE_OPTIONS.map((option) => {
                  const value = option.value();
                  const selected = value === dueDate;

                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => selectDue(value)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? theme.backgroundSelected
                            : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText type={selected ? 'smallBold' : 'small'}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {dueDate && dueDate !== todayYmd() && dueDate !== tomorrowYmd() ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Seçili tarih: {formatDue(dueDate)}
                </ThemedText>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const done = item.done === 1;
            const picked = selection.has(item.id);

            return (
              <Pressable
                // Seçim açıkken dokunmak düzenlemeye girmez, seçimi değiştirir.
                onPress={() => (selection.active ? selection.toggle(item.id) : startEdit(item))}
                onLongPress={() => selection.toggle(item.id)}
                style={({ pressed }) => [
                  styles.taskRow,
                  {
                    backgroundColor:
                      picked || pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: picked ? theme.accent : 'transparent',
                  },
                ]}>
                {/* Seçim sırasında işaretleyici devre dışı: dokunuş satıra gider,
                    yoksa aynı hareket hem seçer hem görevi tamamlar. */}
                <View pointerEvents={selection.active ? 'none' : 'auto'}>
                  <Checkbox checked={done} onPress={() => toggleTask(item)} />
                </View>

                {editingTaskId === item.id ? (
                  <TextInput
                    autoFocus
                    defaultValue={item.title}
                    onChangeText={(text) => {
                      draftRef.current = text;
                    }}
                    onBlur={() => finishEdit(item)}
                    onSubmitEditing={() => finishEdit(item)}
                    returnKeyType="done"
                    placeholder="Görev"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.taskText, { color: theme.text }]}
                  />
                ) : (
                  <ThemedText
                    themeColor={done ? 'textSecondary' : 'text'}
                    style={[styles.taskText, done && styles.doneText]}>
                    {item.title}
                  </ThemedText>
                )}

                {selection.active ? null : (
                  <Pressable
                    onPress={() => removeTask(item)}
                    hitSlop={Spacing.two}
                    accessibilityRole="button"
                    accessibilityLabel="Görevi sil">
                    <ThemedText themeColor="textSecondary">✕</ThemedText>
                  </Pressable>
                )}
              </Pressable>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={[styles.taskRow, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText themeColor="textSecondary">+</ThemedText>
                <TextInput
                  ref={newTaskInput}
                  onChangeText={(text) => {
                    newTaskRef.current = text;
                  }}
                  onSubmitEditing={addTask}
                  submitBehavior="submit"
                  returnKeyType="done"
                  placeholder="Görev ekle"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.taskText, { color: theme.text }]}
                />
              </View>

              {selection.active ? null : (
                <Pressable onPress={confirmDeletePlan} style={styles.deleteButton}>
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    Planı sil
                  </ThemedText>
                </Pressable>
              )}
            </View>
          }
        />

        {selection.active ? (
          <Fab action="delete" onPress={confirmDeleteSelected} bottomInset={0} />
        ) : null}
      </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: FabSize + Spacing.five,
  },
  planHeader: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    // Seçili satırın çerçevesi burada açılır; her satırda durduğu için
    // seçim sırasında yüksekliklerin oynamasını engelliyor.
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: Spacing.two,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  footer: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  deleteButton: {
    paddingVertical: Spacing.three,
  },
});

import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ModeMenu } from '@/components/mode-menu';
import { TaskRow } from '@/components/task-row';
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
  reorderTasks,
  setTaskDone,
  updatePlan,
  updateTask,
  type Task,
} from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
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
  const list = useListMode();
  const [loaded, setLoaded] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // Görev metni normalde düz yazı; dokununca yalnızca o satır düzenlemeye girer.
  // Sürekli açık bir TextInput olsaydı uzun basış Android'in metin seçme
  // menüsüne giderdi; ne çoklu seçim ne sürükleme tetiklenirdi.
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const titleRef = useRef('');
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

  async function toggleDone(task: Task) {
    await setTaskDone(db, task.id, task.done === 0);
    reloadTasks();
  }

  /** Boşaltılan görev silinir — checklist'te boş satır bırakmanın anlamı yok. */
  async function saveTask(task: Task, value: string) {
    const next = value.trim();
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

  /** Ekranda hemen uygula, sonra sırayı veritabanına yaz. */
  async function handleReorder({ from, to }: ReorderableListReorderEvent) {
    const next = reorderItems(tasks, from, to);
    setTasks(next);
    await reorderTasks(
      db,
      next.map((task) => task.id)
    );
  }

  function confirmDeleteSelected() {
    Alert.alert('Seçilenleri sil', `${list.count} görev kalıcı olarak silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteTasks(db, list.ids);
          list.reset();
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
    // Modal içindeki hareketler kendi kökünü ister; bu olmadan sürükleme çalışmaz.
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable
              onPress={list.mode === 'normal' ? onClose : list.reset}
              hitSlop={Spacing.two}>
              <ThemedText themeColor="textSecondary">
                {list.mode === 'normal' ? 'Kapat' : list.selecting ? 'Vazgeç' : 'Bitti'}
              </ThemedText>
            </Pressable>

            <View style={styles.headerRight}>
              <ThemedText type="small" themeColor="textSecondary">
                {list.selecting
                  ? `${list.count} görev seçili`
                  : list.reordering
                    ? 'Basılı tutup sürükle'
                    : tasks.length === 0
                      ? 'Görev yok'
                      : `${doneCount}/${tasks.length} tamamlandı`}
              </ThemedText>
              {list.mode === 'normal' && tasks.length > 1 ? (
                <ModeMenu onReorder={list.startReorder} onSelect={() => list.startSelect()} />
              ) : null}
            </View>
          </View>

          {/* Plan başlığı listenin dışında: sürüklenen hücrelerin ölçümüne karışmasın. */}
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
                    <ThemedText type={selected ? 'smallBold' : 'small'}>{option.label}</ThemedText>
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

          <ReorderableList
            data={tasks}
            keyExtractor={(item) => String(item.id)}
            onReorder={handleReorder}
            dragEnabled={list.reordering}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TaskRow
                task={item}
                mode={list.mode}
                picked={list.has(item.id)}
                editing={editingTaskId === item.id}
                onStartEdit={() => setEditingTaskId(item.id)}
                onSave={(value) => saveTask(item, value)}
                onToggleDone={() => toggleDone(item)}
                onToggle={() => list.toggle(item.id)}
                onStartSelect={() => list.startSelect(item.id)}
                onRemove={() => removeTask(item)}
              />
            )}
            ListFooterComponent={
              list.mode === 'normal' ? (
                <View style={styles.footer}>
                  <View style={[styles.addRow, { backgroundColor: theme.backgroundElement }]}>
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
                      style={[styles.addInput, { color: theme.text }]}
                    />
                  </View>

                  <Pressable onPress={confirmDeletePlan} style={styles.deleteButton}>
                    <ThemedText type="small" style={{ color: theme.danger }}>
                      Planı sil
                    </ThemedText>
                  </Pressable>
                </View>
              ) : null
            }
          />

          {list.selecting ? (
            <Fab action="delete" onPress={confirmDeleteSelected} bottomInset={0} />
          ) : null}
        </SafeAreaView>
      </ThemedView>
    </GestureHandlerRootView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
  list: {
    paddingBottom: FabSize + Spacing.five,
  },
  footer: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  addInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: Spacing.two,
  },
  deleteButton: {
    paddingVertical: Spacing.three,
  },
});

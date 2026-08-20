import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
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
  setTaskTime,
  updatePlanTitle,
  updateTask,
  type PlanKind,
  type Task,
} from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';
import { dateToHm, hmToDate } from '@/lib/date';

type TimeTarget = { task: Task; field: 'start' | 'end' };

/** Planın içeriği: başlık, tarih ve görev listesi. Değişiklikler anında kaydedilir. */
export function PlanDetail({ planId, onClose }: { planId: number; onClose: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const list = useListMode();
  const [loaded, setLoaded] = useState(false);
  const [kind, setKind] = useState<PlanKind>('checklist');
  const [tasks, setTasks] = useState<Task[]>([]);
  // Görev metni normalde düz yazı; dokununca yalnızca o satır düzenlemeye girer.
  // Sürekli açık bir TextInput olsaydı uzun basış Android'in metin seçme
  // menüsüne giderdi; ne çoklu seçim ne sürükleme tetiklenirdi.
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [timeTarget, setTimeTarget] = useState<TimeTarget | null>(null);

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
        setKind(plan.kind);
      }
      await reloadTasks();
      setLoaded(true);
    })();
  }, [db, planId, reloadTasks]);

  const planTitle = () => titleRef.current.trim() || 'Başlıksız plan';

  function saveTitle() {
    updatePlanTitle(db, planId, planTitle());
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

  /** Saat seçici kapanınca: seçildiyse yaz, "Temizle"ye basıldıysa boşalt. */
  async function handleTimeChange(event: DateTimePickerEvent, date?: Date) {
    const target = timeTarget;
    setTimeTarget(null);

    if (!target) return;

    if (event.type === 'set' && date) {
      await setTaskTime(db, target.task.id, target.field, dateToHm(date));
    } else if (event.type === 'neutralButtonPressed') {
      await setTaskTime(db, target.task.id, target.field, null);
    } else {
      return;
    }

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
            {list.mode === 'normal' ? (
              <BackButton onPress={onClose} />
            ) : (
              <Pressable onPress={list.reset} hitSlop={Spacing.three}>
                <ThemedText themeColor="textSecondary">
                  {list.selecting ? 'Vazgeç' : 'Bitti'}
                </ThemedText>
              </Pressable>
            )}

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
              {list.mode === 'normal' && tasks.length > 0 ? (
                <ModeMenu onReorder={list.startReorder} onSelect={() => list.startSelect()} />
              ) : null}
            </View>
          </View>

          {/* Plan başlığı listenin dışında: sürüklenen hücrelerin ölçümüne karışmasın. */}
          <TextInput
            defaultValue={titleRef.current}
            onChangeText={(text) => {
              titleRef.current = text;
            }}
            onEndEditing={saveTitle}
            placeholder={kind === 'schedule' ? 'Çizelge adı' : 'Plan adı'}
            placeholderTextColor={theme.textSecondary}
            style={[styles.titleInput, { color: theme.text }]}
            multiline
          />

          {/* Çizelgede sütunların ne olduğunu söyleyen ince başlık. */}
          {kind === 'schedule' && tasks.length > 0 ? (
            <View style={styles.columnHeader}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnName}>
                Görev
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnTime}>
                Başlangıç
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnTime}>
                Bitiş
              </ThemedText>
            </View>
          ) : null}

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
                kind={kind}
                mode={list.mode}
                picked={list.has(item.id)}
                editing={editingTaskId === item.id}
                onStartEdit={() => setEditingTaskId(item.id)}
                onSave={(value) => saveTask(item, value)}
                onToggleDone={() => toggleDone(item)}
                onToggle={() => list.toggle(item.id)}
                onStartSelect={() => list.startSelect(item.id)}
                onPickTime={(field) => setTimeTarget({ task: item, field })}
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
                      placeholder={kind === 'schedule' ? 'Satır ekle' : 'Görev ekle'}
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

        {timeTarget ? (
          <DateTimePicker
            mode="time"
            is24Hour
            display="clock"
            value={hmToDate(
              timeTarget.field === 'start' ? timeTarget.task.start_time : timeTarget.task.end_time
            )}
            neutralButton={{ label: 'Temizle' }}
            onChange={handleTimeChange}
          />
        ) : null}
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
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // Satırdaki işaretleyici + boşluk kadar içeriden başlıyor ki sütunlar hizalansın.
    paddingLeft: Spacing.two + 24 + Spacing.two,
    paddingRight: Spacing.two,
    paddingBottom: Spacing.one,
  },
  columnName: {
    flex: 1,
  },
  columnTime: {
    minWidth: 48,
    textAlign: 'center',
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

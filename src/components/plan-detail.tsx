import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearTransition } from 'react-native-reanimated';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { Fab } from '@/components/fab';
import { ModeMenu } from '@/components/mode-menu';
import { TaskRow } from '@/components/task-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Strings } from '@/constants/strings';
import {
  FontSize,
  FontWeight,
  Glyphs,
  LineHeight,
  MaxContentWidth,
  Motion,
  Radius,
  Sizes,
  Spacing,
} from '@/constants/theme';
import {
  createTask,
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

/** Planın içeriği: başlık ve görev listesi. Değişiklikler anında kaydedilir. */
export function PlanDetail({ planId, onClose }: { planId: number; onClose: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const list = useListMode();
  const insets = useSafeAreaInsets();
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

  // Sıralama türe bağlı: `sorted` planlarda tamamlananlar alta iner.
  const reloadTasks = useCallback(async () => {
    setTasks(await listTasks(db, planId, kind === 'sorted'));
  }, [db, planId, kind]);

  // Tür ilk okumada öğrenildiği için etki iki kez çalışıyor: bir kez varsayılan
  // sırayla, bir kez planın gerçek türüyle. Sorgu yerel, maliyeti yok.
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

  const planTitle = () => titleRef.current.trim() || Strings.planDetail.untitled;

  /**
   * Başlık yazıldıkça kaydediliyor. Paneli cihazın geri tuşu kapattığında
   * kapanış plan-detail'in dışından tetikleniyor, o yüzden "çıkarken kaydet"
   * güvenilir değil. Tek satırlık alan, yazma maliyeti yok.
   */
  function saveTitle(text: string) {
    titleRef.current = text;
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
    Alert.alert(
      Strings.planDetail.deleteSelectedTitle,
      Strings.planDetail.deleteSelectedBody(list.count),
      [
        { text: Strings.common.cancel, style: 'cancel' },
        {
          text: Strings.common.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteTasks(db, list.ids);
            list.reset();
            reloadTasks();
          },
        },
      ]
    );
  }

  const doneCount = tasks.filter((task) => task.done === 1).length;

  // Alışveriş listesinde yapılacaklarla bitenler arasına çizgi. Sıralama modunda
  // gizli: çizgi sürüklenen hücreye takılıp satırla birlikte oynardı.
  const dividerIndex =
    kind === 'sorted' && list.mode !== 'reorder' ? tasks.findIndex((task) => task.done === 1) : -1;

  function statusLine() {
    if (list.selecting) return Strings.planDetail.selected(list.count);
    if (list.reordering) return Strings.modes.reorderHintShort;
    if (tasks.length === 0) return Strings.planDetail.noTasks;
    return Strings.planDetail.progress(doneCount, tasks.length);
  }

  // Başlık defaultValue ile mount anında okunuyor, o yüzden veri gelmeden alanı açmıyoruz.
  if (!loaded) return <ThemedView style={styles.container} />;

  return (
    // Modal içindeki hareketler kendi kökünü ister; bu olmadan sürükleme çalışmaz.
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            {list.mode === 'normal' ? (
              <BackButton onPress={onClose} />
            ) : (
              <Pressable onPress={list.reset} hitSlop={Spacing.three}>
                <ThemedText themeColor="textSecondary">
                  {list.selecting ? Strings.common.cancel : Strings.common.done}
                </ThemedText>
              </Pressable>
            )}

            <View style={styles.headerRight}>
              <ThemedText type="small" themeColor="textSecondary">
                {statusLine()}
              </ThemedText>
              {list.mode === 'normal' && tasks.length > 0 ? (
                <ModeMenu onReorder={list.startReorder} onSelect={() => list.startSelect()} />
              ) : null}
            </View>
          </View>

          {/* Plan başlığı listenin dışında: sürüklenen hücrelerin ölçümüne karışmasın. */}
          <TextInput
            defaultValue={titleRef.current}
            onChangeText={saveTitle}
            placeholder={
              kind === 'schedule'
                ? Strings.planDetail.schedulePlaceholder
                : Strings.planDetail.namePlaceholder
            }
            placeholderTextColor={theme.textSecondary}
            style={[styles.titleInput, { color: theme.text }]}
            multiline
          />

          <View style={[styles.headerRule, { backgroundColor: theme.borderSubtle }]} />

          {/* Yazma satırı listenin dışında ve üstünde: liste kaydırılsa da yerinde
              kalıyor, yazılan satır da hemen altında görünüyor. */}
          {list.mode === 'normal' ? (
            <View style={[styles.addRow, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText themeColor="textSecondary">{Glyphs.add}</ThemedText>
              <TextInput
                ref={newTaskInput}
                onChangeText={(text) => {
                  newTaskRef.current = text;
                }}
                onSubmitEditing={addTask}
                submitBehavior="submit"
                returnKeyType="done"
                placeholder={
                  kind === 'schedule'
                    ? Strings.planDetail.addScheduleRow
                    : Strings.planDetail.addTask
                }
                placeholderTextColor={theme.textSecondary}
                style={[styles.addInput, { color: theme.text }]}
              />
            </View>
          ) : null}

          {/* Çizelgede sütunların ne olduğunu söyleyen ince başlık. */}
          {kind === 'schedule' && tasks.length > 0 ? (
            <View style={styles.columnHeader}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnName}>
                {Strings.planDetail.columnTask}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnTime}>
                {Strings.planDetail.columnStart}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.columnTime}>
                {Strings.planDetail.columnEnd}
              </ThemedText>
            </View>
          ) : null}

          <ReorderableList
            data={tasks}
            keyExtractor={(item) => String(item.id)}
            onReorder={handleReorder}
            dragEnabled={list.reordering}
            // Tamamlanan satır `sorted` planlarda alta iner; aniden yer
            // değiştirmesi takip edilemiyordu, kayarak gidiyor. Sıralama
            // modunda kapalı: kütüphanenin kendi sürükleme animasyonuyla
            // aynı anda çalışınca satır iki kez oynuyor.
            itemLayoutAnimation={
              list.reordering ? undefined : LinearTransition.duration(Motion.rowSettle)
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + Sizes.fab + Spacing.five }}
            renderItem={({ item, index }) => (
              <TaskRow
                task={item}
                showDivider={index === dividerIndex && index > 0}
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
          />

          {list.selecting ? (
            <Fab action="delete" onPress={confirmDeleteSelected} bottomInset={0} />
          ) : null}
        </SafeAreaView>

        {timeTarget ? (
          <DateTimePicker
            mode="time"
            is24Hour
            // Alarm uygulamalarındaki gibi yukarı aşağı dönen saat/dakika tekerleği.
            display="spinner"
            value={hmToDate(
              timeTarget.field === 'start' ? timeTarget.task.start_time : timeTarget.task.end_time
            )}
            neutralButton={{ label: Strings.common.clearTime }}
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
    fontSize: FontSize.title,
    lineHeight: LineHeight.title,
    fontWeight: FontWeight.heading,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerRule: {
    height: Sizes.hairline,
    marginBottom: Spacing.three,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // Satırdaki işaretleyici + boşluk kadar içeriden başlıyor ki sütunlar hizalansın.
    paddingLeft: Spacing.two + Sizes.checkbox + Spacing.two,
    paddingRight: Spacing.two,
    paddingBottom: Spacing.one,
  },
  columnName: {
    flex: 1,
  },
  columnTime: {
    minWidth: Sizes.timeCell,
    textAlign: 'center',
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    marginBottom: Spacing.three,
  },
  addInput: {
    flex: 1,
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    paddingVertical: Spacing.two,
  },
});

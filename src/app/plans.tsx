import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ModeMenu } from '@/components/mode-menu';
import { PlanDetail } from '@/components/plan-detail';
import { PlanRow } from '@/components/plan-row';
import { OptionSheet, type SheetOption } from '@/components/option-sheet';
import { SlidePanel } from '@/components/slide-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Strings } from '@/constants/strings';
import { MaxContentWidth, Radius, Sizes, Spacing, TabBarHeight } from '@/constants/theme';
import {
  createPlan,
  deletePlan,
  deletePlans,
  getPlan,
  listPlans,
  listTasks,
  reorderPlans,
  type PlanKind,
  type PlanWithProgress,
} from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
import { useTheme } from '@/hooks/use-theme';

/** + basıldığında sorulan plan türleri. */
const KIND_OPTIONS: readonly SheetOption<PlanKind>[] = [
  {
    value: 'checklist',
    title: Strings.planTypes.checklistTitle,
    description: Strings.planTypes.checklistDescription,
  },
  {
    value: 'sorted',
    title: Strings.planTypes.sortedTitle,
    description: Strings.planTypes.sortedDescription,
  },
  {
    value: 'schedule',
    title: Strings.planTypes.scheduleTitle,
    description: Strings.planTypes.scheduleDescription,
  },
];

export default function PlansScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const list = useListMode();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<PlanWithProgress[]>([]);
  const [openPlanId, setOpenPlanId] = useState<number | null>(null);
  const [askingKind, setAskingKind] = useState(false);

  const reload = useCallback(async () => {
    setPlans(await listPlans(db));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addPlan(kind: PlanKind) {
    setAskingKind(false);
    const id = await createPlan(db, Strings.plans.newTitle, null, kind);
    await reload();
    setOpenPlanId(Number(id));
  }

  async function closeDetail(planId: number) {
    // + basıp hiçbir şey yazmadan çıkıldıysa boş planı listede bırakma.
    const plan = await getPlan(db, planId);

    if (plan && plan.title === Strings.plans.newTitle) {
      const tasks = await listTasks(db, planId);
      if (tasks.length === 0) await deletePlan(db, planId);
    }

    setOpenPlanId(null);
    reload();
  }

  /** Ekranda hemen uygula, sonra sırayı veritabanına yaz. */
  async function handleReorder({ from, to }: ReorderableListReorderEvent) {
    const next = reorderItems(plans, from, to);
    setPlans(next);
    await reorderPlans(
      db,
      next.map((plan) => plan.id)
    );
  }

  function confirmDeleteSelected() {
    Alert.alert(Strings.plans.deleteSelectedTitle, Strings.plans.deleteSelectedBody(list.count), [
      { text: Strings.common.cancel, style: 'cancel' },
      {
        text: Strings.common.delete,
        style: 'destructive',
        onPress: async () => {
          await deletePlans(db, list.ids);
          list.reset();
          reload();
        },
      },
    ]);
  }

  const activeCount = plans.filter(
    (plan) => plan.task_count === 0 || plan.done_count < plan.task_count
  ).length;

  function statusLine() {
    if (list.selecting) return Strings.plans.selected(list.count);
    if (list.reordering) return Strings.modes.reorderHintList;
    if (plans.length === 0) return Strings.plans.none;
    return Strings.plans.running(activeCount);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">{Strings.plans.title}</ThemedText>
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

        <ThemedText type="small" themeColor="textSecondary">
          {statusLine()}
        </ThemedText>

        <View style={[styles.headerRule, { backgroundColor: theme.borderSubtle }]} />

        <ReorderableList
          data={plans}
          keyExtractor={(item) => String(item.id)}
          onReorder={handleReorder}
          dragEnabled={list.reordering}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + TabBarHeight + Sizes.fab + Spacing.four },
          ]}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: theme.borderSubtle }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                {Strings.plans.empty}
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <PlanRow
              plan={item}
              mode={list.mode}
              picked={list.has(item.id)}
              onOpen={() => setOpenPlanId(item.id)}
              onToggle={() => list.toggle(item.id)}
              onStartSelect={() => list.startSelect(item.id)}
            />
          )}
        />

        {list.selecting ? <Fab action="delete" onPress={confirmDeleteSelected} /> : null}
        {list.mode === 'normal' ? <Fab onPress={() => setAskingKind(true)} /> : null}
      </SafeAreaView>

      <OptionSheet
        visible={askingKind}
        title={Strings.planTypes.question}
        options={KIND_OPTIONS}
        onCancel={() => setAskingKind(false)}
        onPick={addPlan}
      />

      <SlidePanel
        visible={openPlanId !== null}
        onRequestClose={() => openPlanId !== null && closeDetail(openPlanId)}>
        {openPlanId !== null ? (
          <PlanDetail planId={openPlanId} onClose={() => closeDetail(openPlanId)} />
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
});

import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ModeMenu } from '@/components/mode-menu';
import { PlanDetail } from '@/components/plan-detail';
import { PlanRow } from '@/components/plan-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FabSize, MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';
import {
  createPlan,
  deletePlan,
  deletePlans,
  getPlan,
  listPlans,
  listTasks,
  reorderPlans,
  type PlanWithProgress,
} from '@/db';
import { useListMode } from '@/hooks/use-list-mode';
import { todayYmd } from '@/lib/date';

/** + ile açılan plan bu adla oluşur; kullanıcı dokunmadan çıkarsa geri alınır. */
const NEW_PLAN_TITLE = 'Yeni plan';

export default function PlansScreen() {
  const db = useSQLiteContext();
  const list = useListMode();
  const [plans, setPlans] = useState<PlanWithProgress[]>([]);
  const [openPlanId, setOpenPlanId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setPlans(await listPlans(db));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addPlan() {
    const id = await createPlan(db, NEW_PLAN_TITLE, todayYmd());
    await reload();
    setOpenPlanId(Number(id));
  }

  async function closeDetail(planId: number) {
    // + basıp hiçbir şey yazmadan çıkıldıysa boş planı listede bırakma.
    const plan = await getPlan(db, planId);

    if (plan && plan.title === NEW_PLAN_TITLE) {
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
    Alert.alert(
      'Seçilenleri sil',
      `${list.count} plan ve içindeki bütün görevler kalıcı olarak silinecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deletePlans(db, list.ids);
            list.reset();
            reload();
          },
        },
      ]
    );
  }

  const activeCount = plans.filter(
    (plan) => plan.task_count === 0 || plan.done_count < plan.task_count
  ).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Planlar</ThemedText>
          {list.mode === 'normal' ? (
            <ModeMenu onReorder={list.startReorder} onSelect={() => list.startSelect()} />
          ) : (
            <Pressable onPress={list.reset} hitSlop={Spacing.two}>
              <ThemedText themeColor="textSecondary">
                {list.selecting ? 'Vazgeç' : 'Bitti'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {list.selecting
            ? `${list.count} plan seçili`
            : list.reordering
              ? 'Taşımak için satırı basılı tutup sürükle'
              : plans.length === 0
                ? 'Plan yok'
                : `${activeCount} plan sürüyor`}
        </ThemedText>

        <ReorderableList
          data={plans}
          keyExtractor={(item) => String(item.id)}
          onReorder={handleReorder}
          dragEnabled={list.reordering}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Henüz plan yok. Sağ alttaki + ile bir plan oluştur, içine görevlerini ekle.
            </ThemedText>
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
        {list.mode === 'normal' ? <Fab onPress={addPlan} /> : null}
      </SafeAreaView>

      <Modal
        visible={openPlanId !== null}
        animationType="slide"
        onRequestClose={() => openPlanId !== null && closeDetail(openPlanId)}>
        {openPlanId !== null ? (
          <PlanDetail planId={openPlanId} onClose={() => closeDetail(openPlanId)} />
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
    paddingBottom: TabBarHeight + FabSize + Spacing.four,
  },
  empty: {
    paddingVertical: Spacing.four,
  },
});

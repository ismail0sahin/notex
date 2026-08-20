import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { PlanDetail } from '@/components/plan-detail';
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
  type PlanWithProgress,
} from '@/db';
import { useSelection } from '@/hooks/use-selection';
import { useTheme } from '@/hooks/use-theme';
import { formatDue, isOverdue, todayYmd } from '@/lib/date';

/** + ile açılan plan bu adla oluşur; kullanıcı dokunmadan çıkarsa geri alınır. */
const NEW_PLAN_TITLE = 'Yeni plan';

export default function PlansScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const selection = useSelection();
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

  function confirmDeleteSelected() {
    const count = selection.count;

    Alert.alert(
      'Seçilenleri sil',
      `${count} plan ve içindeki bütün görevler kalıcı olarak silinecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deletePlans(db, selection.ids);
            selection.clear();
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
          {selection.active ? (
            <Pressable onPress={selection.clear} hitSlop={Spacing.two}>
              <ThemedText themeColor="textSecondary">Vazgeç</ThemedText>
            </Pressable>
          ) : null}
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {selection.active
            ? `${selection.count} plan seçili`
            : plans.length === 0
              ? 'Plan yok'
              : `${activeCount} plan sürüyor`}
        </ThemedText>

        <FlatList
          data={plans}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Henüz plan yok. Sağ alttaki + ile bir plan oluştur, içine görevlerini ekle.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const complete = item.task_count > 0 && item.done_count === item.task_count;
            const dueLabel = formatDue(item.due_date);
            const overdue = !complete && isOverdue(item.due_date);
            const progress = item.task_count === 0 ? 0 : item.done_count / item.task_count;
            const picked = selection.has(item.id);

            return (
              <Pressable
                // Seçim açıkken dokunmak planı açmaz, seçimi değiştirir.
                onPress={() =>
                  selection.active ? selection.toggle(item.id) : setOpenPlanId(item.id)
                }
                onLongPress={() => selection.toggle(item.id)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor:
                      picked || pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: picked ? theme.accent : 'transparent',
                  },
                ]}>
                <View style={styles.rowTop}>
                  <ThemedText
                    numberOfLines={2}
                    themeColor={complete ? 'textSecondary' : 'text'}
                    style={[styles.rowTitle, complete && styles.completeTitle]}>
                    {item.title}
                  </ThemedText>
                  {dueLabel ? (
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      style={overdue ? { color: theme.danger } : undefined}>
                      {dueLabel}
                    </ThemedText>
                  ) : null}
                </View>

                <ThemedText type="small" themeColor="textSecondary">
                  {item.task_count === 0
                    ? 'Görev yok'
                    : `${item.done_count}/${item.task_count} görev tamam`}
                </ThemedText>

                {item.task_count > 0 ? (
                  <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: theme.accent, width: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />

        {selection.active ? (
          <Fab action="delete" onPress={confirmDeleteSelected} />
        ) : (
          <Fab onPress={addPlan} />
        )}
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
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: TabBarHeight + FabSize + Spacing.four,
  },
  empty: {
    paddingVertical: Spacing.four,
  },
  row: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    // Seçili satırın çerçevesi burada açılır; her satırda durduğu için
    // seçim sırasında yüksekliklerin oynamasını engelliyor.
    borderWidth: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  rowTitle: {
    flex: 1,
  },
  completeTitle: {
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});

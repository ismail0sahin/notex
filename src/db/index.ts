import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'notex.db';
const DATABASE_VERSION = 4;

export type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  position: number;
};

/**
 * İki tür plan var:
 * - `checklist`: sade görev listesi, tik at geç.
 * - `schedule`: çizelge; her satırın başlangıç ve bitiş saati olabilir.
 */
export type PlanKind = 'checklist' | 'schedule';

export type Plan = {
  id: number;
  title: string;
  due_date: string | null;
  kind: PlanKind;
  created_at: string;
  position: number;
};

/** Liste satırlarında ilerlemeyi göstermek için sayaçlarla birlikte. */
export type PlanWithProgress = Plan & {
  task_count: number;
  done_count: number;
  /** Çizelgelerde günün kapsamını göstermek için. */
  first_start: string | null;
  last_end: string | null;
};

export type Task = {
  id: number;
  plan_id: number;
  title: string;
  done: number;
  /** 'HH:MM' ya da null. Yalnızca çizelge planlarında kullanılır. */
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  position: number;
};

/**
 * Tüm veri cihazda kalır; internet ya da sunucu gerekmez.
 *
 * Şema değişikliği: DATABASE_VERSION'ı artır ve aşağıya yeni bir blok ekle.
 * Var olan blokları düzenleme — kurulu uygulamalar o adımları çoktan geçti.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Bağlantı başına açılır; ON DELETE CASCADE bunun olmadan çalışmaz.
  await db.execAsync('PRAGMA foreign_keys = ON');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) return;

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE notes (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE plans (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        due_date TEXT,
        done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    currentDbVersion = 1;
  }

  if (currentDbVersion === 1) {
    // Plan artık tek bir görev değil, görev listesi taşıyor.
    // Planın tamamlanma durumu task'lardan hesaplanıyor, plans.done gereksiz kaldı.
    await db.execAsync(`
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY NOT NULL,
        plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE INDEX tasks_plan_id ON tasks (plan_id);

      ALTER TABLE plans DROP COLUMN done;
    `);
    currentDbVersion = 2;
  }

  if (currentDbVersion === 2) {
    // Sıra artık kullanıcının elinde. position, o ana kadarki otomatik sıralamayla
    // doldurulur; böylece eldeki listeler göz önünde yer değiştirmez.
    // Sayaçlı alt sorgu, pencere fonksiyonuna gerek kalmadan aynı işi yapıyor.
    await db.execAsync(`
      ALTER TABLE notes ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE plans ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

      UPDATE notes SET position = (
        SELECT COUNT(*) FROM notes AS other WHERE other.updated_at > notes.updated_at
      );

      UPDATE plans SET position = (
        SELECT COUNT(*) FROM plans AS other WHERE other.created_at > plans.created_at
      );

      UPDATE tasks SET position = (
        SELECT COUNT(*) FROM tasks AS other
        WHERE other.plan_id = tasks.plan_id
          AND (
            other.done < tasks.done
            OR (other.done = tasks.done AND other.created_at < tasks.created_at)
          )
      );
    `);
    currentDbVersion = 3;
  }

  if (currentDbVersion === 3) {
    // Plan türü ve çizelge saatleri. Var olan planlar checklist sayılır.
    await db.execAsync(`
      ALTER TABLE plans ADD COLUMN kind TEXT NOT NULL DEFAULT 'checklist';
      ALTER TABLE tasks ADD COLUMN start_time TEXT;
      ALTER TABLE tasks ADD COLUMN end_time TEXT;
    `);
    currentDbVersion = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const now = () => new Date().toISOString();

/**
 * Sürükleyip bırakma sonrası sırayı yazar. Tablo adı yalnızca bu dosyadan
 * geliyor, kullanıcı girdisi değil; kimlikler bağlı parametre olarak geçiyor.
 */
async function writePositions(db: SQLiteDatabase, table: string, ids: readonly number[]) {
  await db.withTransactionAsync(async () => {
    for (let index = 0; index < ids.length; index += 1) {
      await db.runAsync(`UPDATE ${table} SET position = ? WHERE id = ?`, index, ids[index]);
    }
  });
}

// --- Notlar ---

export function listNotes(db: SQLiteDatabase) {
  return db.getAllAsync<Note>('SELECT * FROM notes ORDER BY position ASC, id ASC');
}

/** Yeni not listenin başına gelir. */
export function createNote(db: SQLiteDatabase, title: string, body: string) {
  const ts = now();
  return db.runAsync(
    `INSERT INTO notes (title, body, created_at, updated_at, position)
     VALUES (?, ?, ?, ?, (SELECT COALESCE(MIN(position), 0) - 1 FROM notes))`,
    title,
    body,
    ts,
    ts
  );
}

export function updateNote(db: SQLiteDatabase, id: number, title: string, body: string) {
  return db.runAsync(
    'UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ?',
    title,
    body,
    now(),
    id
  );
}

export function deleteNote(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

/** Çoklu seçimle silme. Tek sorgu, tek geçiş. */
export function deleteNotes(db: SQLiteDatabase, ids: readonly number[]) {
  if (ids.length === 0) return Promise.resolve(null);

  const placeholders = ids.map(() => '?').join(', ');
  return db.runAsync(`DELETE FROM notes WHERE id IN (${placeholders})`, ...ids);
}

export function reorderNotes(db: SQLiteDatabase, ids: readonly number[]) {
  return writePositions(db, 'notes', ids);
}

// --- Planlar ---

export function listPlans(db: SQLiteDatabase) {
  return db.getAllAsync<PlanWithProgress>(
    `SELECT
       p.*,
       (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id) AS task_count,
       (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id AND t.done = 1) AS done_count,
       (SELECT MIN(t.start_time) FROM tasks t
         WHERE t.plan_id = p.id AND t.start_time IS NOT NULL) AS first_start,
       (SELECT MAX(t.end_time) FROM tasks t
         WHERE t.plan_id = p.id AND t.end_time IS NOT NULL) AS last_end
     FROM plans p
     ORDER BY p.position ASC, p.id ASC`
  );
}

export function getPlan(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Plan>('SELECT * FROM plans WHERE id = ?', id);
}

/** Yeni plan listenin başına gelir. */
export async function createPlan(
  db: SQLiteDatabase,
  title: string,
  dueDate: string | null,
  kind: PlanKind
) {
  const result = await db.runAsync(
    `INSERT INTO plans (title, due_date, kind, created_at, position)
     VALUES (?, ?, ?, ?, (SELECT COALESCE(MIN(position), 0) - 1 FROM plans))`,
    title,
    dueDate,
    kind,
    now()
  );
  return result.lastInsertRowId;
}

export function updatePlanTitle(db: SQLiteDatabase, id: number, title: string) {
  return db.runAsync('UPDATE plans SET title = ? WHERE id = ?', title, id);
}

/** tasks tablosu ON DELETE CASCADE ile birlikte temizlenir. */
export function deletePlan(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM plans WHERE id = ?', id);
}

/** Çoklu seçimle silme; görevler cascade ile gider. */
export function deletePlans(db: SQLiteDatabase, ids: readonly number[]) {
  if (ids.length === 0) return Promise.resolve(null);

  const placeholders = ids.map(() => '?').join(', ');
  return db.runAsync(`DELETE FROM plans WHERE id IN (${placeholders})`, ...ids);
}

export function reorderPlans(db: SQLiteDatabase, ids: readonly number[]) {
  return writePositions(db, 'plans', ids);
}

// --- Görevler ---

export function listTasks(db: SQLiteDatabase, planId: number) {
  return db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE plan_id = ? ORDER BY position ASC, id ASC',
    planId
  );
}

/** Yeni görev listenin sonuna eklenir — checklist doldurma yönü bu. */
export function createTask(db: SQLiteDatabase, planId: number, title: string) {
  return db.runAsync(
    `INSERT INTO tasks (plan_id, title, done, created_at, position)
     VALUES (?, ?, 0, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM tasks WHERE plan_id = ?))`,
    planId,
    title,
    now(),
    planId
  );
}

export function updateTask(db: SQLiteDatabase, id: number, title: string) {
  return db.runAsync('UPDATE tasks SET title = ? WHERE id = ?', title, id);
}

/** Çizelge saatleri. Kolon adı bu iki seçenekten geliyor, kullanıcı girdisi değil. */
export function setTaskTime(
  db: SQLiteDatabase,
  id: number,
  field: 'start' | 'end',
  value: string | null
) {
  const column = field === 'start' ? 'start_time' : 'end_time';
  return db.runAsync(`UPDATE tasks SET ${column} = ? WHERE id = ?`, value, id);
}

export function setTaskDone(db: SQLiteDatabase, id: number, done: boolean) {
  return db.runAsync('UPDATE tasks SET done = ? WHERE id = ?', done ? 1 : 0, id);
}

export function deleteTask(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

/** Çoklu seçimle silme. */
export function deleteTasks(db: SQLiteDatabase, ids: readonly number[]) {
  if (ids.length === 0) return Promise.resolve(null);

  const placeholders = ids.map(() => '?').join(', ');
  return db.runAsync(`DELETE FROM tasks WHERE id IN (${placeholders})`, ...ids);
}

export function reorderTasks(db: SQLiteDatabase, ids: readonly number[]) {
  return writePositions(db, 'tasks', ids);
}

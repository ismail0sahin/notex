import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'notex.db';
const DATABASE_VERSION = 2;

export type Note = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: number;
  title: string;
  due_date: string | null;
  created_at: string;
};

/** Liste satırlarında ilerlemeyi göstermek için sayaçlarla birlikte. */
export type PlanWithProgress = Plan & {
  task_count: number;
  done_count: number;
};

export type Task = {
  id: number;
  plan_id: number;
  title: string;
  done: number;
  created_at: string;
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

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const now = () => new Date().toISOString();

// --- Notlar ---

export function listNotes(db: SQLiteDatabase) {
  return db.getAllAsync<Note>('SELECT * FROM notes ORDER BY updated_at DESC');
}

export function createNote(db: SQLiteDatabase, title: string, body: string) {
  const ts = now();
  return db.runAsync(
    'INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)',
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

// --- Planlar ---

/** Tamamlananlar en sona, sonra tarihe göre; tarihsizler tarihlilerin ardından. */
export function listPlans(db: SQLiteDatabase) {
  return db.getAllAsync<PlanWithProgress>(
    `SELECT
       p.*,
       (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id) AS task_count,
       (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id AND t.done = 1) AS done_count
     FROM plans p
     ORDER BY
       (task_count > 0 AND done_count = task_count) ASC,
       due_date IS NULL ASC,
       due_date ASC,
       created_at DESC`
  );
}

export function getPlan(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Plan>('SELECT * FROM plans WHERE id = ?', id);
}

export async function createPlan(db: SQLiteDatabase, title: string, dueDate: string | null) {
  const result = await db.runAsync(
    'INSERT INTO plans (title, due_date, created_at) VALUES (?, ?, ?)',
    title,
    dueDate,
    now()
  );
  return result.lastInsertRowId;
}

export function updatePlan(
  db: SQLiteDatabase,
  id: number,
  title: string,
  dueDate: string | null
) {
  return db.runAsync('UPDATE plans SET title = ?, due_date = ? WHERE id = ?', title, dueDate, id);
}

/** tasks tablosu ON DELETE CASCADE ile birlikte temizlenir. */
export function deletePlan(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM plans WHERE id = ?', id);
}

// --- Görevler ---

/** Bitmeyenler önce, her grup içinde eklenme sırasına göre. */
export function listTasks(db: SQLiteDatabase, planId: number) {
  return db.getAllAsync<Task>(
    'SELECT * FROM tasks WHERE plan_id = ? ORDER BY done ASC, created_at ASC, id ASC',
    planId
  );
}

export function createTask(db: SQLiteDatabase, planId: number, title: string) {
  return db.runAsync(
    'INSERT INTO tasks (plan_id, title, done, created_at) VALUES (?, ?, 0, ?)',
    planId,
    title,
    now()
  );
}

export function updateTask(db: SQLiteDatabase, id: number, title: string) {
  return db.runAsync('UPDATE tasks SET title = ? WHERE id = ?', title, id);
}

export function setTaskDone(db: SQLiteDatabase, id: number, done: boolean) {
  return db.runAsync('UPDATE tasks SET done = ? WHERE id = ?', done ? 1 : 0, id);
}

export function deleteTask(db: SQLiteDatabase, id: number) {
  return db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

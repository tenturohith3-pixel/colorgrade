/**
 * Local Auth Database
 *
 * Self-contained SQLite-based auth using better-sqlite3 + jose JWT.
 * Works immediately with zero external setup.
 * Migrate to Supabase cloud later when ready.
 *
 * Database is initialized lazily on first use to avoid crashing
 * at build time when env vars / native modules aren't available.
 */

import Database from "better-sqlite3";
import type DatabaseType from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import fs from "fs";

let _db: DatabaseType.Database | null = null;

function getDb(): DatabaseType.Database {
  if (_db) return _db;

  const DB_PATH = path.join(process.cwd(), "data", "auth.db");

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  _db.pragma("journal_mode = WAL");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'trial', 'basic', 'pro', 'lifetime')),
      clips_remaining INTEGER DEFAULT 3,
      age_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS grading_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      input_url TEXT,
      output_url TEXT,
      settings TEXT DEFAULT '{}',
      status TEXT DEFAULT 'pending',
      processing_time_ms INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_presets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      settings TEXT NOT NULL DEFAULT '{}',
      is_public INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_session_id TEXT UNIQUE,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'inr',
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return _db;
}

// ── User Operations ──────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string;
  plan: string;
  clips_remaining: number;
  age_verified: number;
  created_at: string;
  updated_at: string;
}

export function createUser(email: string, passwordHash: string, fullName: string = ""): UserRow {
  const db = getDb();
  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, email, passwordHash, fullName);
  return getUserById(id)!;
}

export function getUserById(id: string): UserRow | null {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | null;
}

export function getUserByEmail(email: string): UserRow | null {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | null;
}

export function updateUser(id: string, updates: Partial<Pick<UserRow, "full_name" | "avatar_url" | "plan" | "clips_remaining" | "age_verified">>) {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => (updates as any)[f]);
  getDb().prepare(`UPDATE users SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
}

// ── Grading Jobs ─────────────────────────────────

export interface GradingJobRow {
  id: string;
  user_id: string;
  input_url: string | null;
  output_url: string | null;
  settings: string;
  status: string;
  processing_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export function createGradingJob(userId: string, inputUrl: string): GradingJobRow {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO grading_jobs (id, user_id, input_url)
    VALUES (?, ?, ?)
  `).run(id, userId, inputUrl);
  return db.prepare("SELECT * FROM grading_jobs WHERE id = ?").get(id) as GradingJobRow;
}

export function getGradingJobs(userId: string): GradingJobRow[] {
  return getDb().prepare("SELECT * FROM grading_jobs WHERE user_id = ? ORDER BY created_at DESC").all(userId) as GradingJobRow[];
}

export function updateGradingJob(id: string, updates: Partial<Pick<GradingJobRow, "output_url" | "status" | "processing_time_ms" | "completed_at">>) {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => (updates as any)[f]);
  getDb().prepare(`UPDATE grading_jobs SET ${setClause} WHERE id = ?`).run(...values, id);
}

// ── Presets ──────────────────────────────────────

export interface PresetRow {
  id: string;
  user_id: string;
  name: string;
  settings: string;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export function createUserPreset(userId: string, name: string, settings: string, isPublic: boolean = false): PresetRow {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO user_presets (id, user_id, name, settings, is_public)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, name, settings, isPublic ? 1 : 0);
  return db.prepare("SELECT * FROM user_presets WHERE id = ?").get(id) as PresetRow;
}

export function getUserPresets(userId: string): PresetRow[] {
  return getDb().prepare("SELECT * FROM user_presets WHERE user_id = ? OR is_public = 1 ORDER BY created_at DESC").all(userId) as PresetRow[];
}

export function deleteUserPreset(id: string, userId: string) {
  getDb().prepare("DELETE FROM user_presets WHERE id = ? AND user_id = ?").run(id, userId);
}

// ── Payments ─────────────────────────────────────

export interface PaymentRow {
  id: string;
  user_id: string;
  stripe_session_id: string | null;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  created_at: string;
}

export function createPayment(userId: string, amount: number, currency: string, plan: string, stripeSessionId?: string): PaymentRow {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO payments (id, user_id, amount, currency, plan, stripe_session_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, amount, currency, plan, stripeSessionId || null);
  return db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as PaymentRow;
}

export function getUserPayments(userId: string): PaymentRow[] {
  return getDb().prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(userId) as PaymentRow[];
}

// ── Cleanup ──────────────────────────────────────

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DATABASE_PATH = path.join(__dirname, '../../data/finance.db');

export interface Database {
  run: (sql: string, params?: any[]) => Promise<void>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  close: () => Promise<void>;
}

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const sqliteDb = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  db = {
    run: promisify(sqliteDb.run.bind(sqliteDb)),
    get: promisify(sqliteDb.get.bind(sqliteDb)),
    all: promisify(sqliteDb.all.bind(sqliteDb)),
    close: promisify(sqliteDb.close.bind(sqliteDb))
  };

  await createTables();
  await seedDefaultCategories();
  
  return db;
}

async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      color TEXT NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      target_date DATE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS goal_contributions (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES savings_goals (id)
    )
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON goal_contributions(goal_id);
  `);

  console.log('Database tables created successfully');
}

async function seedDefaultCategories(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const existingCategories = await db.get('SELECT COUNT(*) as count FROM categories');
  if (existingCategories.count > 0) {
    return;
  }

  const defaultCategories = [
    { id: 'income-salary', name: 'Salary', type: 'income', color: '#22c55e', icon: '💰' },
    { id: 'income-freelance', name: 'Freelance', type: 'income', color: '#3b82f6', icon: '💻' },
    { id: 'income-investment', name: 'Investments', type: 'income', color: '#8b5cf6', icon: '📈' },
    { id: 'income-other', name: 'Other Income', type: 'income', color: '#06b6d4', icon: '💵' },
    
    { id: 'expense-food', name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: '🍽️' },
    { id: 'expense-transport', name: 'Transportation', type: 'expense', color: '#f59e0b', icon: '🚗' },
    { id: 'expense-housing', name: 'Housing', type: 'expense', color: '#8b5cf6', icon: '🏠' },
    { id: 'expense-utilities', name: 'Utilities', type: 'expense', color: '#06b6d4', icon: '⚡' },
    { id: 'expense-entertainment', name: 'Entertainment', type: 'expense', color: '#ec4899', icon: '🎬' },
    { id: 'expense-healthcare', name: 'Healthcare', type: 'expense', color: '#10b981', icon: '⚕️' },
    { id: 'expense-shopping', name: 'Shopping', type: 'expense', color: '#f97316', icon: '🛍️' },
    { id: 'expense-education', name: 'Education', type: 'expense', color: '#3b82f6', icon: '📚' },
    { id: 'expense-other', name: 'Other Expenses', type: 'expense', color: '#6b7280', icon: '💸' }
  ];

  for (const category of defaultCategories) {
    await db.run(
      `INSERT INTO categories (id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)`,
      [category.id, category.name, category.type, category.color, category.icon]
    );
  }

  console.log('Default categories seeded successfully');
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
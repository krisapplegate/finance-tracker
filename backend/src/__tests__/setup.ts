import { initializeDatabase } from '../database/init';
import path from 'path';
import fs from 'fs';

// Setup test database
const TEST_DB_PATH = path.join(__dirname, '../../data/test.db');

beforeAll(async () => {
  // Ensure test data directory exists
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Set test database path
  process.env.DATABASE_PATH = TEST_DB_PATH;
  
  // Initialize test database
  await initializeDatabase();
});

afterAll(async () => {
  // Clean up test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

beforeEach(async () => {
  // Clear all tables before each test
  const { getDatabase } = require('../database/init');
  const db = await getDatabase();
  
  await db.run('DELETE FROM goal_contributions');
  await db.run('DELETE FROM savings_goals');
  await db.run('DELETE FROM transactions');
  // Don't delete categories as they are seeded data
});

// Mock console.log in tests to reduce noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});
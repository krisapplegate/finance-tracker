import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Categories API', () => {
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check structure of first category
      const category = response.body[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('type');
      expect(category).toHaveProperty('color');
      expect(['income', 'expense']).toContain(category.type);
    });

    it('should filter categories by type', async () => {
      const response = await request(app)
        .get('/api/categories?type=expense')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((category: any) => {
        expect(category.type).toBe('expense');
      });
    });

    it('should filter categories by income type', async () => {
      const response = await request(app)
        .get('/api/categories?type=income')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((category: any) => {
        expect(category.type).toBe('income');
      });
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a specific category', async () => {
      const response = await request(app)
        .get('/api/categories/expense-food')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'expense-food',
        name: 'Food & Dining',
        type: 'expense'
      });
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/categories/:id/summary', () => {
    it('should return category summary with no transactions', async () => {
      const response = await request(app)
        .get('/api/categories/expense-food/summary')
        .expect(200);

      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toMatchObject({
        transaction_count: 0,
        total_amount: 0,
        average_amount: 0,
        min_amount: 0,
        max_amount: 0
      });
    });

    it('should return category summary with transactions', async () => {
      // First create a transaction
      const transaction = {
        amount: 100.50,
        description: 'Test transaction',
        category_id: 'expense-food',
        type: 'expense',
        date: '2024-01-01'
      };

      await request(app)
        .post('/api/transactions')
        .send(transaction)
        .expect(201);

      const response = await request(app)
        .get('/api/categories/expense-food/summary')
        .expect(200);

      expect(response.body.summary.transaction_count).toBe(1);
      expect(response.body.summary.total_amount).toBe(100.50);
    });
  });
});
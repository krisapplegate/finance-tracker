import request from 'supertest';
import { app } from '../index';
import { initializeDatabase } from '../database/init';

describe('Transactions API', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  describe('GET /api/transactions', () => {
    it('should return empty array when no transactions exist', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return transactions with pagination', async () => {
      // First create some test transactions
      const testTransaction = {
        amount: 100.50,
        description: 'Test transaction',
        category_id: 'expense-food',
        type: 'expense',
        date: '2024-01-01'
      };

      await request(app)
        .post('/api/transactions')
        .send(testTransaction)
        .expect(201);

      const response = await request(app)
        .get('/api/transactions?limit=10&offset=0')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        amount: 100.50,
        description: 'Test transaction',
        type: 'expense'
      });
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=expense')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((transaction: any) => {
        expect(transaction.type).toBe('expense');
      });
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app)
        .get('/api/transactions?start_date=2024-01-01&end_date=2024-01-31')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const newTransaction = {
        amount: 250.75,
        description: 'Grocery shopping',
        category_id: 'expense-food',
        type: 'expense',
        date: '2024-01-15'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201);

      expect(response.body).toMatchObject({
        amount: 250.75,
        description: 'Grocery shopping',
        type: 'expense'
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
    });

    it('should return 400 for invalid transaction data', async () => {
      const invalidTransaction = {
        amount: -50,
        description: '',
        category_id: 'invalid-category',
        type: 'invalid-type',
        date: '2024-01-15'
      };

      await request(app)
        .post('/api/transactions')
        .send(invalidTransaction)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTransaction = {
        amount: 100,
        description: 'Test'
      };

      await request(app)
        .post('/api/transactions')
        .send(incompleteTransaction)
        .expect(400);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update an existing transaction', async () => {
      // First create a transaction
      const newTransaction = {
        amount: 100,
        description: 'Original description',
        category_id: 'expense-food',
        type: 'expense',
        date: '2024-01-01'
      };

      const createResponse = await request(app)
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201);

      const transactionId = createResponse.body.id;

      // Update the transaction
      const updates = {
        amount: 150,
        description: 'Updated description'
      };

      const updateResponse = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send(updates)
        .expect(200);

      expect(updateResponse.body.amount).toBe(150);
      expect(updateResponse.body.description).toBe('Updated description');
    });

    it('should return 404 for non-existent transaction', async () => {
      const updates = {
        amount: 150,
        description: 'Updated description'
      };

      await request(app)
        .put('/api/transactions/non-existent-id')
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete an existing transaction', async () => {
      // First create a transaction
      const newTransaction = {
        amount: 100,
        description: 'To be deleted',
        category_id: 'expense-food',
        type: 'expense',
        date: '2024-01-01'
      };

      const createResponse = await request(app)
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201);

      const transactionId = createResponse.body.id;

      // Delete the transaction
      await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/transactions/${transactionId}`)
        .expect(404);
    });

    it('should return 404 for non-existent transaction', async () => {
      await request(app)
        .delete('/api/transactions/non-existent-id')
        .expect(404);
    });
  });
});
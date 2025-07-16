import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init';
import { CreateTransactionRequest, UpdateTransactionRequest, TransactionWithCategory } from '../models/types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { limit = 50, offset = 0, category_id, type, start_date, end_date } = req.query;
    
    let sql = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (category_id) {
      sql += ' AND t.category_id = ?';
      params.push(category_id);
    }
    
    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }
    
    if (start_date) {
      sql += ' AND t.date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND t.date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY t.date DESC, t.created_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    const transactions = await db.all(sql, params);
    
    const transformedTransactions = transactions.map((t: any) => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      category_id: t.category_id,
      type: t.type,
      date: t.date,
      created_at: t.created_at,
      updated_at: t.updated_at,
      category: {
        id: t.category_id,
        name: t.category_name,
        color: t.category_color,
        icon: t.category_icon
      }
    }));
    
    res.json(transformedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const transaction = await db.get(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const transformedTransaction = {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id,
      type: transaction.type,
      date: transaction.date,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      category: {
        id: transaction.category_id,
        name: transaction.category_name,
        color: transaction.category_color,
        icon: transaction.category_icon
      }
    };
    
    res.json(transformedTransaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { amount, description, category_id, type, date }: CreateTransactionRequest = req.body;
    
    if (!amount || !description || !category_id || !type || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }
    
    const categoryExists = await db.get('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO transactions (id, amount, description, category_id, type, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, amount, description, category_id, type, date, now, now]
    );
    
    const newTransaction = await db.get(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);
    
    const transformedTransaction = {
      id: newTransaction.id,
      amount: newTransaction.amount,
      description: newTransaction.description,
      category_id: newTransaction.category_id,
      type: newTransaction.type,
      date: newTransaction.date,
      created_at: newTransaction.created_at,
      updated_at: newTransaction.updated_at,
      category: {
        id: newTransaction.category_id,
        name: newTransaction.category_name,
        color: newTransaction.category_color,
        icon: newTransaction.category_icon
      }
    };
    
    res.status(201).json(transformedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { amount, description, category_id, type, date }: UpdateTransactionRequest = req.body;
    
    const existingTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (category_id) {
      const categoryExists = await db.get('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }
    
    if (type && type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      params.push(date);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);
    
    await db.run(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const updatedTransaction = await db.get(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);
    
    const transformedTransaction = {
      id: updatedTransaction.id,
      amount: updatedTransaction.amount,
      description: updatedTransaction.description,
      category_id: updatedTransaction.category_id,
      type: updatedTransaction.type,
      date: updatedTransaction.date,
      created_at: updatedTransaction.created_at,
      updated_at: updatedTransaction.updated_at,
      category: {
        id: updatedTransaction.category_id,
        name: updatedTransaction.category_name,
        color: updatedTransaction.category_color,
        icon: updatedTransaction.category_icon
      }
    };
    
    res.json(transformedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const existingTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await db.run('DELETE FROM transactions WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
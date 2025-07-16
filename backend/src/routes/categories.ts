import express from 'express';
import { getDatabase } from '../database/init';
import { Category } from '../models/types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { type } = req.query;
    
    let sql = 'SELECT * FROM categories';
    const params: any[] = [];
    
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY name';
    
    const categories = await db.all(sql, params);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/transactions', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { limit = 50, offset = 0, start_date, end_date } = req.query;
    
    const categoryExists = await db.get('SELECT id FROM categories WHERE id = ?', [id]);
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    let sql = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.category_id = ?
    `;
    const params: any[] = [id];
    
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
    console.error('Error fetching category transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/summary', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    const categoryExists = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    let sql = `
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount,
        MIN(date) as first_transaction_date,
        MAX(date) as last_transaction_date
      FROM transactions 
      WHERE category_id = ?
    `;
    const params: any[] = [id];
    
    if (start_date) {
      sql += ' AND date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND date <= ?';
      params.push(end_date);
    }
    
    const summary = await db.get(sql, params);
    
    res.json({
      category: categoryExists,
      summary: {
        transaction_count: summary.transaction_count || 0,
        total_amount: summary.total_amount || 0,
        average_amount: summary.average_amount || 0,
        min_amount: summary.min_amount || 0,
        max_amount: summary.max_amount || 0,
        first_transaction_date: summary.first_transaction_date,
        last_transaction_date: summary.last_transaction_date
      }
    });
  } catch (error) {
    console.error('Error fetching category summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init';
import { CreateGoalRequest, UpdateGoalRequest, CreateContributionRequest } from '../models/types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const goals = await db.all('SELECT * FROM savings_goals ORDER BY created_at DESC');
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const goal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, target_amount, target_date, description }: CreateGoalRequest = req.body;
    
    if (!name || !target_amount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }
    
    if (target_amount <= 0) {
      return res.status(400).json({ error: 'Target amount must be positive' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO savings_goals (id, name, target_amount, target_date, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, target_amount, target_date || null, description || null, now, now]
    );
    
    const newGoal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { name, target_amount, target_date, description }: UpdateGoalRequest = req.body;
    
    const existingGoal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    if (target_amount !== undefined && target_amount <= 0) {
      return res.status(400).json({ error: 'Target amount must be positive' });
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (target_amount !== undefined) {
      updates.push('target_amount = ?');
      params.push(target_amount);
    }
    if (target_date !== undefined) {
      updates.push('target_date = ?');
      params.push(target_date);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);
    
    await db.run(
      `UPDATE savings_goals SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const updatedGoal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const existingGoal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    await db.run('DELETE FROM goal_contributions WHERE goal_id = ?', [id]);
    await db.run('DELETE FROM savings_goals WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/contributions', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const goalExists = await db.get('SELECT id FROM savings_goals WHERE id = ?', [id]);
    if (!goalExists) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const contributions = await db.all(
      `SELECT * FROM goal_contributions 
       WHERE goal_id = ? 
       ORDER BY date DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [id, Number(limit), Number(offset)]
    );
    
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/contributions', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { amount, date, description }: CreateContributionRequest = req.body;
    
    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    const goal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [id]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    const contributionId = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO goal_contributions (id, goal_id, amount, date, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [contributionId, id, amount, date, description || null, now]
    );
    
    const newCurrentAmount = (goal.current_amount || 0) + amount;
    await db.run(
      'UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?',
      [newCurrentAmount, now, id]
    );
    
    const newContribution = await db.get('SELECT * FROM goal_contributions WHERE id = ?', [contributionId]);
    res.status(201).json(newContribution);
  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:goalId/contributions/:contributionId', async (req, res) => {
  try {
    const db = await getDatabase();
    const { goalId, contributionId } = req.params;
    
    const contribution = await db.get('SELECT * FROM goal_contributions WHERE id = ? AND goal_id = ?', [contributionId, goalId]);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    const goal = await db.get('SELECT * FROM savings_goals WHERE id = ?', [goalId]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    await db.run('DELETE FROM goal_contributions WHERE id = ?', [contributionId]);
    
    const newCurrentAmount = Math.max(0, (goal.current_amount || 0) - contribution.amount);
    await db.run(
      'UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?',
      [newCurrentAmount, new Date().toISOString(), goalId]
    );
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
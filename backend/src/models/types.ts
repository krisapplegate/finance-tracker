export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  description?: string;
  created_at: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description: string;
  category_id: string;
  type: 'income' | 'expense';
  date: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  description?: string;
  category_id?: string;
  type?: 'income' | 'expense';
  date?: string;
}

export interface CreateGoalRequest {
  name: string;
  target_amount: number;
  target_date?: string;
  description?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  target_amount?: number;
  target_date?: string;
  description?: string;
}

export interface CreateContributionRequest {
  goal_id: string;
  amount: number;
  date: string;
  description?: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  recentTransactions: TransactionWithCategory[];
  savingsGoals: SavingsGoal[];
}
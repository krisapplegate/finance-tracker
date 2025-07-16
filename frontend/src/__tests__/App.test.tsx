import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock the TailwindTest component
vi.mock('../components/TailwindTest', () => {
  return {
    default: () => <div data-testid="tailwind-test">Tailwind Test Component</div>
  };
});

describe('App Component', () => {
  it('renders finance tracker header', () => {
    render(<App />);
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<App />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  it('shows dashboard by default', () => {
    render(<App />);
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$12,450.00')).toBeInTheDocument();
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
  });

  it('switches to transactions tab when clicked', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Transactions'));
    
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByText('Transaction management coming soon...')).toBeInTheDocument();
  });

  it('switches to goals tab when clicked', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Goals'));
    
    expect(screen.getByText('Savings Goals')).toBeInTheDocument();
    expect(screen.getByText('Add Goal')).toBeInTheDocument();
    expect(screen.getByText('Savings goals management coming soon...')).toBeInTheDocument();
  });

  it('switches to insights tab when clicked', () => {
    render(<App />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Insights' }));
    
    expect(screen.getByRole('heading', { name: 'Insights' })).toBeInTheDocument();
    expect(screen.getByText('Financial insights and charts coming soon...')).toBeInTheDocument();
  });

  it('shows active tab styling', () => {
    render(<App />);
    
    const dashboardTab = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardTab).toHaveClass('bg-primary-100', 'text-primary-700');
    
    // Switch to transactions
    fireEvent.click(screen.getByRole('button', { name: 'Transactions' }));
    
    const transactionsTab = screen.getByRole('button', { name: 'Transactions' });
    expect(transactionsTab).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('opens tailwind test when test css button is clicked', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Test CSS'));
    
    expect(screen.getByText('Finance Tracker - Tailwind Test')).toBeInTheDocument();
    expect(screen.getByTestId('tailwind-test')).toBeInTheDocument();
  });

  it('returns to main app from tailwind test', () => {
    render(<App />);
    
    // Open tailwind test
    fireEvent.click(screen.getByText('Test CSS'));
    expect(screen.getByText('Finance Tracker - Tailwind Test')).toBeInTheDocument();
    
    // Go back to main app
    fireEvent.click(screen.getByText('Back to App'));
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
  });

  it('displays mock financial data correctly', () => {
    render(<App />);
    
    // Check dashboard cards
    expect(screen.getByText('$12,450.00')).toBeInTheDocument();
    expect(screen.getByText('$5,200.00')).toBeInTheDocument();
    expect(screen.getByText('$3,850.00')).toBeInTheDocument();
    
    // Check recent transactions
    expect(screen.getByText('Grocery Store')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    
    // Check savings goals
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
  });
});
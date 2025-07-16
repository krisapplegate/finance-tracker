import { useState } from 'react'
import TailwindTest from './components/TailwindTest'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTailwindTest, setShowTailwindTest] = useState(false)
  
  if (showTailwindTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Finance Tracker - Tailwind Test</h1>
              </div>
              <button
                onClick={() => setShowTailwindTest(false)}
                className="btn-secondary"
              >
                Back to App
              </button>
            </div>
          </div>
        </header>
        <TailwindTest />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Finance Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'transactions' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'goals' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'insights' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Insights
              </button>
              </nav>
              <button
                onClick={() => setShowTailwindTest(true)}
                className="btn-primary text-xs"
              >
                Test CSS
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Balance</h3>
                <p className="text-3xl font-semibold text-gray-900">$12,450.00</p>
                <p className="text-sm text-success-600 mt-1">+2.5% from last month</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Income</h3>
                <p className="text-3xl font-semibold text-gray-900">$5,200.00</p>
                <p className="text-sm text-success-600 mt-1">+1.2% from last month</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Expenses</h3>
                <p className="text-3xl font-semibold text-gray-900">$3,850.00</p>
                <p className="text-sm text-danger-600 mt-1">+5.8% from last month</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Grocery Store</p>
                      <p className="text-sm text-gray-500">Food & Dining</p>
                    </div>
                    <span className="text-danger-600 font-medium">-$87.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Salary</p>
                      <p className="text-sm text-gray-500">Income</p>
                    </div>
                    <span className="text-success-600 font-medium">+$2,600.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Netflix</p>
                      <p className="text-sm text-gray-500">Entertainment</p>
                    </div>
                    <span className="text-danger-600 font-medium">-$15.99</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Savings Goals</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Emergency Fund</span>
                      <span className="text-sm text-gray-500">$3,500 / $10,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Vacation</span>
                      <span className="text-sm text-gray-500">$1,200 / $3,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-success-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Transactions</h2>
              <button className="btn-primary">Add Transaction</button>
            </div>
            <div className="card">
              <p className="text-gray-500">Transaction management coming soon...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Savings Goals</h2>
              <button className="btn-primary">Add Goal</button>
            </div>
            <div className="card">
              <p className="text-gray-500">Savings goals management coming soon...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Insights</h2>
            <div className="card">
              <p className="text-gray-500">Financial insights and charts coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
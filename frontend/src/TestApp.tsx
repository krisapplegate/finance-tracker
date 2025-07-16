import { useState } from 'react'
import TailwindTest from './components/TailwindTest'

function TestApp() {
  const [showTest, setShowTest] = useState(false)

  if (showTest) {
    return <TailwindTest />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Finance Tracker</h1>
            </div>
            <button
              onClick={() => setShowTest(true)}
              className="btn-primary"
            >
              Test Tailwind CSS
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </main>
    </div>
  )
}

export default TestApp
import { useState } from 'react';
import { runTailwindValidation } from '../utils/tailwindValidator';

export default function TailwindTest() {
  const [testState, setTestState] = useState('idle');
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = () => {
    setTestState('running');
    setTimeout(() => {
      const results = runTailwindValidation();
      setTestResults(results);
      setTestState('completed');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tailwind CSS Test Suite</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Color Palette Test</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-500 rounded"></div>
              <span className="text-primary-600">Primary Blue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success-500 rounded"></div>
              <span className="text-success-600">Success Green</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger-500 rounded"></div>
              <span className="text-danger-600">Danger Red</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Button Components</h2>
          <div className="space-y-2">
            <button className="btn-primary w-full">Primary Button</button>
            <button className="btn-secondary w-full">Secondary Button</button>
            <button className="btn-success w-full">Success Button</button>
            <button className="btn-danger w-full">Danger Button</button>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Form Components</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Test Input Field</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter some text..."
            />
          </div>
          <div>
            <label className="label">Test Select</label>
            <select className="input">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Layout & Responsive Test</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-primary-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-600">1</div>
            <div className="text-sm text-primary-500">Mobile: 1 col</div>
          </div>
          <div className="bg-success-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-success-600">2</div>
            <div className="text-sm text-success-500">Tablet: 2 cols</div>
          </div>
          <div className="bg-danger-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-danger-600">3</div>
            <div className="text-sm text-danger-500">Desktop: 3 cols</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={runTests}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            testState === 'running' 
              ? 'bg-yellow-500 text-white cursor-not-allowed' 
              : testState === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          disabled={testState === 'running'}
        >
          {testState === 'running' ? 'Running Tests...' : 
           testState === 'completed' ? '✓ Tests Passed' : 
           'Run Visual Tests'}
        </button>
      </div>

      {testResults && (
        <div className="mt-8 card">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="mb-4">
            <div className="flex gap-4 text-sm">
              <span className="text-success-600 font-medium">Passed: {testResults.passed}</span>
              <span className="text-danger-600 font-medium">Failed: {testResults.failed}</span>
              <span className="text-gray-600">Total: {testResults.results.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {testResults.results.map((result: any, index: number) => (
              <div key={index} className={`p-3 rounded-lg ${
                result.status === 'passed' ? 'bg-success-50 border border-success-200' : 
                'bg-danger-50 border border-danger-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.name}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    result.status === 'passed' ? 'bg-success-100 text-success-800' : 
                    'bg-danger-100 text-danger-800'
                  }`}>
                    {result.status === 'passed' ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Class: <code className="bg-gray-100 px-1 rounded">{result.className}</code>
                </div>
                {result.error && (
                  <div className="text-sm text-danger-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
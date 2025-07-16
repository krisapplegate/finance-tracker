// Utility to validate Tailwind CSS classes are being applied correctly
export interface TailwindTest {
  name: string;
  className: string;
  expectedStyles: Record<string, string>;
}

export const tailwindTests: TailwindTest[] = [
  {
    name: 'Background Colors',
    className: 'bg-primary-500',
    expectedStyles: {
      backgroundColor: 'rgb(14, 165, 233)', // #0ea5e9
    }
  },
  {
    name: 'Text Colors',
    className: 'text-success-600',
    expectedStyles: {
      color: 'rgb(22, 163, 74)', // #16a34a
    }
  },
  {
    name: 'Border Radius',
    className: 'rounded-2xl',
    expectedStyles: {
      borderRadius: '1.5rem',
    }
  },
  {
    name: 'Padding',
    className: 'p-6',
    expectedStyles: {
      padding: '1.5rem',
    }
  },
  {
    name: 'Shadow',
    className: 'shadow-sm',
    expectedStyles: {
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    }
  },
  {
    name: 'Font Weight',
    className: 'font-semibold',
    expectedStyles: {
      fontWeight: '600',
    }
  },
  {
    name: 'Grid Layout',
    className: 'grid-cols-3',
    expectedStyles: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    }
  },
  {
    name: 'Flexbox',
    className: 'flex items-center justify-between',
    expectedStyles: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }
  }
];

// Function to check if computed styles match expected styles
export function validateTailwindClass(element: Element, test: TailwindTest): boolean {
  const computedStyles = window.getComputedStyle(element);
  
  for (const [property, expectedValue] of Object.entries(test.expectedStyles)) {
    const computedValue = computedStyles.getPropertyValue(property);
    
    // Handle different ways CSS values can be expressed
    if (!valuesMatch(computedValue, expectedValue)) {
      console.warn(`Tailwind validation failed for ${test.name}:`, {
        property,
        expected: expectedValue,
        actual: computedValue,
        className: test.className
      });
      return false;
    }
  }
  
  return true;
}

function valuesMatch(actual: string, expected: string): boolean {
  // Remove extra whitespace and normalize
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
  
  const normalizedActual = normalize(actual);
  const normalizedExpected = normalize(expected);
  
  return normalizedActual === normalizedExpected;
}

// Auto-test function that creates elements and validates them
export function runTailwindValidation(): { passed: number; failed: number; results: any[] } {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  tailwindTests.forEach(test => {
    // Create a temporary element
    const testElement = document.createElement('div');
    testElement.className = test.className;
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';
    
    // Add to DOM temporarily
    document.body.appendChild(testElement);
    
    try {
      const isValid = validateTailwindClass(testElement, test);
      
      if (isValid) {
        passed++;
        results.push({ ...test, status: 'passed' });
      } else {
        failed++;
        results.push({ ...test, status: 'failed' });
      }
    } catch (error) {
      failed++;
      results.push({ ...test, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      // Clean up
      document.body.removeChild(testElement);
    }
  });

  return { passed, failed, results };
}
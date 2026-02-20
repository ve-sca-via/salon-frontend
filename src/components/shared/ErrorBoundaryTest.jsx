/**
 * ErrorBoundaryTest Component
 * 
 * PURPOSE:
 * Development-only component to test error boundaries
 * Triggers intentional crashes to verify error handling works correctly
 * 
 * USAGE:
 * Import and place in any route temporarily:
 * <Route path="/test-error" element={<ErrorBoundaryTest />} />
 * 
 * Then visit /test-error and click buttons to test different error scenarios
 * 
 * IMPORTANT: Remove from production code!
 */

import React, { useState } from 'react';

export default function ErrorBoundaryTest() {
  const [shouldCrash, setShouldCrash] = useState(false);

  // Trigger render error
  if (shouldCrash) {
    throw new Error('Test Error: This is an intentional crash to test error boundary!');
  }

  const handleRenderCrash = () => {
    setShouldCrash(true);
  };

  const handleUndefinedError = () => {
    // Access property on undefined - common real-world error
    const obj = undefined;
    console.log(obj.property.nested);
  };

  const handleNullError = () => {
    // Access property on null
    const data = null;
    console.log(data.map(item => item.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error Boundary Testing
          </h1>
          <p className="text-gray-600 mb-6">
            Click the buttons below to trigger different types of errors and test the error boundary.
          </p>

          <div className="space-y-4">
            {/* Render Error Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Render Error Test
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Triggers an error during component render. Error boundary should catch this.
              </p>
              <button
                onClick={handleRenderCrash}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Trigger Render Crash
              </button>
            </div>

            {/* Undefined Property Error */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Undefined Property Error
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Attempts to access nested property on undefined. Common real-world error.
              </p>
              <button
                onClick={handleUndefinedError}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Trigger Undefined Error
              </button>
            </div>

            {/* Null Reference Error */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Null Reference Error
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Attempts to call method on null. Another common error pattern.
              </p>
              <button
                onClick={handleNullError}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Trigger Null Error
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              What to expect:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Error boundary should catch the error</li>
              <li>Fallback UI should display instead of white screen</li>
              <li>You should see error details in console (dev mode)</li>
              <li>Retry/reload buttons should work</li>
              <li>Rest of the app should remain functional</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ IMPORTANT: Remove this test component before deploying to production!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

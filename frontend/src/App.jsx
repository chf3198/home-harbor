import React from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import AIChatSection from './components/AIChatSection';
import HelpModal from './components/HelpModal';
import ErrorBoundary from './components/ErrorBoundary';
import { PropertyProvider } from './hooks/usePropertySearch';
import { AIProvider } from './hooks/useAIChat';

function App() {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AIProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Header />
            <main className="mx-auto w-[min(1120px,92vw)] space-y-8 py-10">
              <ErrorBoundary fallback={({ retry }) => (
                <div className="text-center p-8">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Search Error</h3>
                  <p className="text-gray-600 mb-4">Unable to load search functionality.</p>
                  <button
                    onClick={retry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              )}>
                <SearchSection />
              </ErrorBoundary>

              <ErrorBoundary fallback={({ retry }) => (
                <div className="text-center p-8">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Results Error</h3>
                  <p className="text-gray-600 mb-4">Unable to display search results.</p>
                  <button
                    onClick={retry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              )}>
                <ResultsSection />
              </ErrorBoundary>

              <ErrorBoundary fallback={({ retry }) => (
                <div className="text-center p-8">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">AI Chat Error</h3>
                  <p className="text-gray-600 mb-4">AI assistant is temporarily unavailable.</p>
                  <button
                    onClick={retry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              )}>
                <AIChatSection />
              </ErrorBoundary>
            </main>
            <HelpModal />
          </div>
        </AIProvider>
      </PropertyProvider>
    </ErrorBoundary>
  );
}

export default App;
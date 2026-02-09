import React from 'react';
// HomeHarbor React App - v2.2.0 - AI-First Split View Layout
import Header from './components/Header';
import AIChatSection from './components/AIChatSection';
import ResultsSection from './components/ResultsSection';
import HelpModal from './components/HelpModal';
import ErrorBoundary from './components/ErrorBoundary';
import { PropertyProvider } from './hooks/usePropertySearch';
import { AIProvider } from './hooks/useAIChat';

/**
 * AI-First Split View Layout
 * 
 * UX Research Insights Applied:
 * - Nielsen Norman: 57% of viewing time is above the fold
 * - F-Pattern: Important content in top-left (AI Chat)
 * - Fitts's Law: Primary action (chat input) always visible
 * - Serial Position Effect: AI Chat first, Results alongside
 * - Aesthetic-Usability Effect: Clean, modern split view
 */
function App() {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AIProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Header />
            
            {/* Main Content - AI-First Split View */}
            <main className="mx-auto w-[min(1400px,96vw)] py-6 px-2 sm:px-4">
              {/* Feature Discovery Banner - Shows on first visit */}
              <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-semibold text-slate-800">Try our AI Assistant!</p>
                      <p className="text-sm text-slate-600">
                        Ask questions like "Find homes near good schools in West Hartford" — we'll search for you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      100% Free
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs text-blue-700 font-medium">
                      211K+ CT Properties
                    </span>
                  </div>
                </div>
              </div>

              {/* Two-Column Split View */}
              <div className="grid gap-6 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr]">
                {/* Left Column - AI Chat (Primary) */}
                <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
                  <ErrorBoundary fallback={({ retry }) => (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                      <h3 className="text-lg font-semibold text-red-600 mb-4">AI Chat Error</h3>
                      <p className="text-gray-600 mb-4">AI assistant is temporarily unavailable.</p>
                      <button
                        onClick={retry}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                      >
                        Retry
                      </button>
                    </div>
                  )}>
                    <AIChatSection />
                  </ErrorBoundary>
                </div>

                {/* Right Column - Results */}
                <div className="min-w-0">
                  <ErrorBoundary fallback={({ retry }) => (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                      <h3 className="text-lg font-semibold text-red-600 mb-4">Results Error</h3>
                      <p className="text-gray-600 mb-4">Unable to display search results.</p>
                      <button
                        onClick={retry}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                      >
                        Retry
                      </button>
                    </div>
                  )}>
                    <ResultsSection />
                  </ErrorBoundary>
                </div>
              </div>
            </main>
            <HelpModal />
          </div>
        </AIProvider>
      </PropertyProvider>
    </ErrorBoundary>
  );
}

export default App;
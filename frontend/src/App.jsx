import React, { useState } from 'react';
// HomeHarbor React App - v3.0.0 - Chat-Centric Fullscreen with Swipeable Results
import Header from './components/Header';
import ChatCentricView from './components/ChatCentricView';
import HelpModal from './components/HelpModal';
import ErrorBoundary from './components/ErrorBoundary';
import { PropertyProvider } from './hooks/usePropertySearch';
import { AIProvider } from './hooks/useAIChat';

/**
 * Chat-Centric Fullscreen Layout v3.0
 * 
 * UX Research Insights Applied (February 2026):
 * - Nielsen Norman: 57% of viewing time above fold → fit everything in viewport
 * - Fitts's Law: Chat input in thumb zone, swipe gestures for browsing
 * - Miller's Law: One card at a time reduces cognitive load
 * - Hick's Law: Fewer visible options = faster decisions
 * - App Shell Pattern: Fixed UI shell with dynamic content
 * - Tinder-style Swiping: Proven pattern for browsing items
 * 
 * Layout:
 * ┌─────────────────────────────┐
 * │ Minimal Header (40px)       │
 * ├─────────────────────────────┤
 * │ Chat + Swipeable Results    │
 * │ (fills remaining viewport)  │
 * ├─────────────────────────────┤
 * │ Fixed Chat Input (56px)     │
 * └─────────────────────────────┘
 */
function App() {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AIProvider>
          {/* 
            Fixed viewport container using dvh (dynamic viewport height)
            - Prevents iOS Safari address bar issues
            - No body scroll - all scroll contained within components
          */}
          <div 
            className="flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 overflow-hidden"
            style={{ 
              height: '100dvh',
              minHeight: '-webkit-fill-available', // iOS Safari fallback
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            {/* Compact Header - 48px fixed */}
            <Header compact />
            
            {/* Main Content - Fills remaining space */}
            <main className="flex-1 min-h-0 flex flex-col">
              <ErrorBoundary fallback={({ retry }) => (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Something went wrong</h3>
                    <p className="text-gray-600 mb-4">We couldn't load the app. Please try again.</p>
                    <button
                      onClick={retry}
                      className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}>
                <ChatCentricView />
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
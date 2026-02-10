import React, { useState } from 'react';
// HomeHarbor React App - v4.0.0 - CSS Grid Architecture
import Header from './components/Header';
import ChatCentricView from './components/ChatCentricView';
import HelpModal from './components/HelpModal';
import ErrorBoundary from './components/ErrorBoundary';
import { PropertyProvider } from './hooks/usePropertySearch';
import { AIProvider } from './hooks/useAIChat';

/**
 * Chat-Centric Fullscreen Layout v4.0 - CSS Grid Architecture
 * 
 * UX Research Insights Applied (February 2026):
 * - Nielsen Norman: 57% of viewing time above fold → fit everything in viewport
 * - Fitts's Law: Chat input in thumb zone, swipe gestures for browsing
 * - Miller's Law: One card at a time reduces cognitive load
 * - Hick's Law: Fewer visible options = faster decisions
 * - App Shell Pattern: Fixed UI shell with dynamic content
 * - Ionic Framework Pattern: CSS Grid with explicit track sizing
 * 
 * CSS Grid Layout (bulletproof mobile):
 * ┌──────────────────────────────┐
 * │ Header (auto)                │  row 1: auto-sized
 * ├──────────────────────────────┤
 * │ Content (1fr)                │  row 2: fills remaining space
 * │   ┌────────────────────────┐ │  (contains its own grid)
 * │   │ Toggle (auto)          │ │
 * │   │ Chat/Results (1fr)     │ │
 * │   │ Input (auto)           │ │
 * │   └────────────────────────┘ │
 * └──────────────────────────────┘
 */
function App() {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AIProvider>
          {/* 
            CSS Grid container with explicit row tracks
            - grid-template-rows: auto 1fr
            - Header is auto-sized (content height)
            - Content area gets all remaining space (1fr)
            - Content has overflow:hidden to contain children
          */}
          <div 
            className="grid bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900"
            style={{ 
              height: '100dvh',
              minHeight: '-webkit-fill-available',
              gridTemplateRows: 'auto 1fr',
              gridTemplateColumns: '1fr',
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            {/* Row 1: Header (auto height) */}
            <Header compact />
            
            {/* Row 2: Main Content (1fr - fills all remaining space) */}
            <main className="overflow-hidden relative">
              <ErrorBoundary fallback={({ retry }) => (
                <div className="absolute inset-0 flex items-center justify-center p-8">
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

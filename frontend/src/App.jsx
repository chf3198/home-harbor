import React from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import AIChatSection from './components/AIChatSection';
import HelpModal from './components/HelpModal';
import { PropertyProvider } from './hooks/usePropertySearch';
import { AIProvider } from './hooks/useAIChat';

function App() {
  return (
    <PropertyProvider>
      <AIProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
          <Header />
          <main className="mx-auto w-[min(1120px,92vw)] space-y-8 py-10">
            <SearchSection />
            <ResultsSection />
            <AIChatSection />
          </main>
          <HelpModal />
        </div>
      </AIProvider>
    </PropertyProvider>
  );
}

export default App;
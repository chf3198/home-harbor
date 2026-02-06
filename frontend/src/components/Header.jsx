import React from 'react';

function Header() {
  const openHelp = () => {
    // This will be handled by the HelpModal context
    window.dispatchEvent(new CustomEvent('openHelp', { detail: 'user' }));
  };

  return (
    <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-[min(1120px,92vw)] flex-wrap items-center justify-between gap-6 py-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-medium">HomeHarbor</p>
          </div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            AI-Powered Real Estate Search
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400 text-lg">
            Beautiful, compliant real estate search using legal data sources and
            free AI models.
          </p>
        </div>
        <button
          onClick={openHelp}
          className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 backdrop-blur px-6 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
          type="button"
          aria-label="Open help and guides"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help &amp; Guides
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;
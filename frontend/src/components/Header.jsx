import React from 'react';

function Header() {
  const openHelp = () => {
    // This will be handled by the HelpModal context
    window.dispatchEvent(new CustomEvent('openHelp', { detail: 'user' }));
  };

  return (
    <header className="bg-slate-900 text-white">
      <div className="mx-auto flex w-[min(1120px,92vw)] flex-wrap items-center justify-between gap-6 py-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">HomeHarbor</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            AI-Powered Real Estate Search
          </h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Beautiful, compliant real estate search using legal data sources and
            free AI models.
          </p>
        </div>
        <button
          onClick={openHelp}
          className="rounded-full border border-emerald-400/40 px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          type="button"
          aria-label="Open help and guides"
        >
          Help &amp; Guides
        </button>
      </div>
    </header>
  );
}

export default Header;
import React, { useState, useEffect } from 'react';
import UserGuide from './UserGuide';
import DevInfo from './DevInfo';

function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('user');

  useEffect(() => {
    const handleOpenHelp = (event) => {
      setActiveTab(event.detail || 'user');
      setIsOpen(true);
    };

    window.addEventListener('openHelp', handleOpenHelp);

    return () => {
      window.removeEventListener('openHelp', handleOpenHelp);
    };
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Help & Guides</h2>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Close help modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex space-x-1">
            <button
              onClick={() => setActiveTab('user')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === 'user'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              User Guide
            </button>
            <button
              onClick={() => setActiveTab('dev')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === 'dev'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Developer Info
            </button>
          </div>

          <div className="prose prose-sm max-w-none">
            {activeTab === 'user' ? <UserGuide /> : <DevInfo />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
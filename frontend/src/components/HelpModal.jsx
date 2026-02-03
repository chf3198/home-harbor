import React, { useState, useEffect } from 'react';

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
            {activeTab === 'user' ? (
              <div>
                <h3>How to Use HomeHarbor</h3>
                <p>HomeHarbor helps you search for real estate properties using legal, free data sources.</p>

                <h4>Searching Properties</h4>
                <ul>
                  <li>Enter a city name in Connecticut</li>
                  <li>Set price ranges and property details</li>
                  <li>Click "Search Properties" to find matches</li>
                </ul>

                <h4>AI Features</h4>
                <ul>
                  <li>Ask questions about properties in the chat</li>
                  <li>Get AI-powered analysis and descriptions</li>
                  <li>All AI features use free, open-source models</li>
                </ul>
              </div>
            ) : (
              <div>
                <h3>Technical Information</h3>
                <p>This application demonstrates modern serverless architecture.</p>

                <h4>Architecture</h4>
                <ul>
                  <li><strong>Frontend:</strong> React with Vite</li>
                  <li><strong>Backend:</strong> AWS Lambda functions</li>
                  <li><strong>Database:</strong> DynamoDB with TTL caching</li>
                  <li><strong>AI:</strong> OpenRouter API with cascading fallbacks</li>
                </ul>

                <h4>Data Sources</h4>
                <ul>
                  <li>Redfin Market Analytics (public S3)</li>
                  <li>Connecticut Open Data (government API)</li>
                  <li>Google Street View (free tier)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
import React from 'react';

function UserGuide() {
  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-slate-800">How to Use HomeHarbor</h3>
      <p className="text-slate-600 mb-4">HomeHarbor helps you search for real estate properties using AI-powered natural language and traditional filters.</p>

      <details className="mb-4" open>
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">🔍 Searching Properties</summary>
        <ul className="mt-2 ml-4 text-slate-600 list-disc">
          <li>Enter a Connecticut city name (e.g., Hartford, Stamford)</li>
          <li>Set price ranges using the Min/Max price fields</li>
          <li>Filter by bedrooms, bathrooms, and property type</li>
          <li>Click "Search Properties" to find matching homes</li>
        </ul>
      </details>

      <details className="mb-4" open>
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">💬 AI Chat Assistant</summary>
        <ul className="mt-2 ml-4 text-slate-600 list-disc">
          <li><strong>Natural language search:</strong> Type "Show me 3 bedroom houses in Hartford under $400k"</li>
          <li><strong>Get recommendations:</strong> Ask "What neighborhoods are good for families?"</li>
          <li><strong>Automatic filters:</strong> The AI extracts your criteria and applies search filters</li>
          <li><strong>Default values:</strong> If you don't specify a price range, defaults are applied ($100K-$500K)</li>
          <li>Press Enter to send, Shift+Enter for new line</li>
          <li>Use the trash icon to clear chat history</li>
        </ul>
      </details>

      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">🤖 AI Analysis Features</summary>
        <ul className="mt-2 ml-4 text-slate-600 list-disc">
          <li>Get AI-powered property descriptions</li>
          <li>View exterior analysis from Street View images</li>
          <li>All AI features use free, open-source models</li>
        </ul>
      </details>

      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">📊 Data Sources</summary>
        <ul className="mt-2 ml-4 text-slate-600 list-disc">
          <li><strong>Connecticut Open Data:</strong> Real property transactions</li>
          <li><strong>Google Street View:</strong> Property exterior photos</li>
          <li><strong>OpenRouter AI:</strong> Free LLM models for chat and analysis</li>
        </ul>
      </details>
    </div>
  );
}

export default UserGuide;
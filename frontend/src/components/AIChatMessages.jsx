/**
 * @fileoverview AI Chat Messages Component - Displays chat history with thinking indicator
 */

import React from 'react';

function AIChatMessages({ messages = [], loading = false, error = null }) {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
      {messages.map((msg, index) => (
        <ChatMessage key={msg.timestamp || index} message={msg} />
      ))}
      {loading && <ThinkingIndicator />}
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.filters && <FilterBadge filters={message.filters} />}
      </div>
    </div>
  );
}

function FilterBadge({ filters }) {
  const filterCount = Object.keys(filters).filter(k => filters[k] != null).length;
  if (filterCount === 0) return null;

  return (
    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
      {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
    </span>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 text-slate-500 p-3 rounded-lg rounded-bl-none">
        <div className="flex items-center gap-1">
          <span className="text-sm">Thinking</span>
          <span className="animate-pulse">...</span>
        </div>
      </div>
    </div>
  );
}

export default AIChatMessages;

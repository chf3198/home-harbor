/**
 * @fileoverview AI Chat Messages Component - Messenger-style chat UI
 */

import React, { useEffect, useRef } from 'react';

function AIChatMessages({ messages = [], loading = false, error = null }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-80 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !loading && !error && <WelcomeMessage />}
        {error && <ErrorMessage error={error} />}
        {messages.map((msg, index) => (
          <ChatBubble key={msg.timestamp || index} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-3 shadow-lg">
        <span className="text-white text-xl">🏠</span>
      </div>
      <p className="text-slate-600 font-medium">Hi! I&apos;m your HomeHarbor assistant</p>
      <p className="text-slate-400 text-sm mt-1">Ask me anything about properties</p>
    </div>
  );
}

function ErrorMessage({ error }) {
  return (
    <div className="flex justify-center my-2">
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 max-w-[85%]">
        <p className="text-red-600 text-sm">⚠️ {error}</p>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const time = message.timestamp ? formatTime(message.timestamp) : '';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
          : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
      }`}>
        <span className="text-white text-sm">{isUser ? '👤' : '🤖'}</span>
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] group`}>
        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          {message.filters && <FilterBadge filters={message.filters} isUser={isUser} />}
        </div>
        {/* Timestamp */}
        <p className={`text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {time}
        </p>
      </div>
    </div>
  );
}

function FilterBadge({ filters, isUser }) {
  const filterCount = Object.keys(filters).filter(k => filters[k] != null).length;
  if (filterCount === 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs rounded-full ${
      isUser 
        ? 'bg-blue-400/30 text-blue-100' 
        : 'bg-emerald-100 text-emerald-700'
    }`}>
      <span>✓</span> {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
        <span className="text-white text-sm">🤖</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default AIChatMessages;

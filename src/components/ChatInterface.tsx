'use client';

import { useState, useEffect } from 'react';
import { Send, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickSuggestions } from './QuickSuggestions';

export const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'openai'>('gemini');

  const {
    session,
    quickSuggestions,
    error,
    isInitialized,
    messagesEndRef,
    initializeChat,
    sendMessage,
    clearChat,
    resetChat,
  } = useChat();

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || session.isLoading || !isOnline) return;

    await sendMessage(inputMessage, preferredProvider);
    setInputMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (session.isLoading || !isOnline) return;
    sendMessage(suggestion, preferredProvider);
  };

  if (!isInitialized && !error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing RainBot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-sm">RB</span>
          </div>
          <div>
            <h2 className="font-semibold text-black">RainBot</h2>
            <p className="text-xs text-green-500">Islamic Finance AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Provider selector */}
          <select
            value={preferredProvider}
            onChange={(e) => setPreferredProvider(e.target.value as 'gemini' | 'openai')}
            disabled={session.isLoading}
            className="px-2 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title="Select AI Provider"
          >
            <option value="gemini">Gemini</option>
            <option value="openai">GPT</option>
          </select>

          {/* Connection status */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" />
            )}
          </div>

          {/* Action buttons */}
          <button
            onClick={resetChat}
            disabled={session.isLoading}
            className="p-1 hover:bg-green-600 bg-gray-400 rounded transition-colors disabled:opacity-50"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            disabled={session.isLoading}
            className="p-1 hover:bg-green-600 bg-gray-400 rounded transition-colors disabled:opacity-50"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Connection warning */}
      {!isOnline && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-yellow-700 text-sm">You&apos;re offline. Reconnect to continue chatting.</p>
        </div>
      )}

      {/* Messages area and include source*/}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scrollbar">
        {session.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {session.isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {quickSuggestions.length > 0 && (
        <div className="px-4 pb-2">
          <QuickSuggestions
            suggestions={quickSuggestions}
            onSuggestionClick={handleSuggestionClick}
            disabled={session.isLoading || !isOnline}
          />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              !isOnline 
                ? "Reconnect to send messages..." 
                : session.isLoading 
                  ? "RainBot is thinking..." 
                  : "Ask about Islamic finance, Sukuk investments..."
            }
            disabled={session.isLoading || !isOnline}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || session.isLoading || !isOnline}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
        
        {/* Session info */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Session: {session.sessionId || 'Not connected'}
          </p>
          <p className="text-xs text-gray-500">
            User ID: {session.userId} | Messages: {session.messages.length}
          </p>
        </div>
      </form>
    </div>
  );
};
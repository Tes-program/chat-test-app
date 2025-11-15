// src/components/ChatInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { Send, RefreshCw, Trash2, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickSuggestions } from './QuickSuggestions';
import { DocumentUpload } from './DocumentUpload';

export const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'openai'>('gemini');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    session,
    quickSuggestions,
    error,
    isInitialized,
    messagesEndRef,
    initializeChat,
    sendMessage,
    handleDocumentUpload,
    handleDocumentDelete,
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
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[650px] bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-primary text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xs md:text-sm">RB</span>
          </div>
          <div>
            <h2 className="font-semibold text-black text-sm md:text-base">RainBot</h2>
            <p className="text-xs text-green-500 hidden md:block">Islamic Finance AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
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
              <Wifi className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 md:w-4 md:h-4 text-red-300" />
            )}
          </div>

          {/* Action buttons */}
          <button
            onClick={resetChat}
            disabled={session.isLoading}
            className="p-1 hover:bg-green-600 bg-gray-400 rounded transition-colors disabled:opacity-50"
            title="Reset Chat"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          <button
            onClick={clearChat}
            disabled={session.isLoading}
            className="p-1 hover:bg-green-600 bg-gray-400 rounded transition-colors disabled:opacity-50"
            title="Clear Chat"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-2 md:p-3 bg-red-50 border-b border-red-200 flex-shrink-0">
          <p className="text-red-700 text-xs md:text-sm">{error}</p>
        </div>
      )}

      {/* Connection warning */}
      {!isOnline && (
        <div className="p-2 md:p-3 bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
          <p className="text-yellow-700 text-xs md:text-sm">You&apos;re offline. Reconnect to continue chatting.</p>
        </div>
      )}

      {/* Messages area - now takes remaining space */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 chat-scrollbar">
        {session.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {session.isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Document Upload Section */}
      <DocumentUpload
        sessionId={session.sessionId}
        documents={session.uploadedDocuments || []}
        onUploadSuccess={handleDocumentUpload}
        onDeleteDocument={handleDocumentDelete}
        disabled={session.isLoading || !isOnline}
      />

      {/* Quick suggestions - collapsible */}
      {quickSuggestions.length > 0 && (
        <div className="border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full px-3 md:px-4 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-xs md:text-sm font-medium text-gray-700">
              Quick Suggestions ({quickSuggestions.length})
            </span>
            {showSuggestions ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          {showSuggestions && (
            <div className="px-3 md:px-4 pb-3">
              <QuickSuggestions
                suggestions={quickSuggestions}
                onSuggestionClick={handleSuggestionClick}
                disabled={session.isLoading || !isOnline}
              />
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
        <div className="flex space-x-2 md:space-x-3">
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
            className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || session.isLoading || !isOnline}
            className="px-4 md:px-6 py-2 bg-primary border-2 text-black rounded-full hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm md:text-base"
          >
            <Send className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Send</span>
          </button>
        </div>
        
        {/* Session info */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 truncate">
            {session.uploadedDocuments && session.uploadedDocuments.length > 0 && (
              <span className="mr-2">📎 {session.uploadedDocuments.length} doc(s)</span>
            )}
            Session: {session.sessionId?.substring(0, 8) || 'Not connected'}...
          </p>
          <p className="text-xs text-gray-500">
            {session.messages.length} msgs
          </p>
        </div>
      </form>
    </div>
  );
};
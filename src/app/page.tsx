// src/app/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { useState, useEffect } from 'react';
import { chatAPI } from '@/utils/api';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [health, budget] = await Promise.all([
          chatAPI.getHealthCheck(),
          chatAPI.getBudgetStatus(),
        ]);
        setHealthStatus(health.data);
        setBudgetStatus(budget.data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2 md:p-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            RainBot Chat Test
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Islamic Finance AI Assistant - Testing Interface
          </p>
        </header>

        {/* Status display - Responsive */}
        <div className="w-full md:w-1/2 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <button
              onClick={() => setShowStatus(!showStatus)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm md:text-base">System Status</h2>
                <svg
                  className={`w-4 h-4 md:w-5 md:h-5 text-gray-500 transition-transform ${
                    showStatus ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showStatus && (healthStatus || budgetStatus) && (
              <div className="px-3 md:px-4 pb-3 md:pb-4 border-t w-full">
                <div className="mt-3 md:mt-4 space-y-3">
                  {healthStatus && (
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">System Health</h3>
                      <p className="text-xs md:text-sm text-gray-600">Status: {healthStatus.status}</p>
                      <p className="text-xs md:text-sm text-gray-600">Service: {healthStatus.service}</p>
                      <p className="text-xs md:text-sm text-gray-600">Version: {healthStatus.version}</p>
                    </div>
                  )}
                  
                  {budgetStatus && (
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg w-full">
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">AI Budget Status</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Usage: {budgetStatus.usagePercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Remaining: ${budgetStatus.remainingBudget.toFixed(4)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Recommended Model: {budgetStatus.recommendedModel}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budgetStatus.usagePercentage > 80 ? 'bg-red-500' :
                            budgetStatus.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetStatus.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main chat interface */}
        <ChatInterface />

        {/* Footer */}
        <footer className="text-center mt-4 md:mt-6">
          <p className="text-xs md:text-sm text-gray-500">
            Testing interface for Rain Investor Platform Chatbot API
          </p>
          <p className="text-xs text-gray-400 mt-1">
            User ID: 1 | API: {process.env.NEXT_PUBLIC_API_URL}
          </p>
        </footer>
      </div>
    </main>
  );
}
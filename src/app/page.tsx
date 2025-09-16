/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { useState, useEffect } from 'react';
import { chatAPI } from '@/utils/api';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);

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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            RainBot Chat Test
          </h1>
          <p className="text-gray-600">
            Islamic Finance AI Assistant - Testing Interface
          </p>
        </header>

        {/* Status display */}
        {(healthStatus || budgetStatus) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {healthStatus && (
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-800 mb-2">System Health</h3>
                <p className="text-sm text-gray-600">Status: {healthStatus.status}</p>
                <p className="text-sm text-gray-600">Service: {healthStatus.service}</p>
                <p className="text-sm text-gray-600">Version: {healthStatus.version}</p>
                </div>
            )}
            
            {budgetStatus && (
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-800 mb-2">AI Budget Status</h3>
                <p className="text-sm text-gray-600">
                  Usage: {budgetStatus.usagePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: ${budgetStatus.remainingBudget.toFixed(4)}
                </p>
                <p className="text-sm text-gray-600">
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
        )}

        {/* Main chat interface */}
        <ChatInterface />

        {/* Footer */}
        <footer className="text-center mt-6">
          <p className="text-sm text-gray-500">
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
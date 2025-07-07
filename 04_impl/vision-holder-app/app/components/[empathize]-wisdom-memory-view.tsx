'use client';

import React from 'react';
import { Brain } from 'lucide-react';

interface WisdomMemoryViewProps {
  className?: string;
}

export const WisdomMemoryView: React.FC<WisdomMemoryViewProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Wisdom Memory
          </h2>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">
          User preferences and AI insights will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default WisdomMemoryView;
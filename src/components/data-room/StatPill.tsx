import React from 'react';
import { cn } from '@/lib/utils';

interface StatPillProps {
  label: string;
  value: number | string;
  color: 'yellow' | 'blue' | 'orange' | 'green' | 'gray';
}

const colorClasses = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  orange: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  green: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  gray: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
};

export function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className={cn(
      "px-3 py-1.5 rounded-full border flex items-center gap-2",
      colorClasses[color]
    )}>
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

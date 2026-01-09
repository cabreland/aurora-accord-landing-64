import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClickableMetricCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  description: string;
  color: 'blue' | 'amber' | 'green' | 'red';
  onClick: () => void;
  isActive?: boolean;
}

const ClickableMetricCard: React.FC<ClickableMetricCardProps> = ({
  icon: Icon,
  value,
  label,
  description,
  color,
  onClick,
  isActive = false
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600 bg-blue-100',
      border: 'border-blue-200',
      activeBorder: 'border-blue-500',
      text: 'text-blue-600'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600 bg-amber-100',
      border: 'border-amber-200',
      activeBorder: 'border-amber-500',
      text: 'text-amber-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600 bg-green-100',
      border: 'border-green-200',
      activeBorder: 'border-green-500',
      text: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600 bg-red-100',
      border: 'border-red-200',
      activeBorder: 'border-red-500',
      text: 'text-red-600'
    }
  };

  const styles = colorStyles[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg p-4 border transition-all duration-200 cursor-pointer w-full text-left",
        "hover:scale-105 hover:shadow-lg",
        styles.bg,
        isActive ? `${styles.activeBorder} border-2 ring-2 ring-${color}-200` : styles.border
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </button>
  );
};

export default ClickableMetricCard;

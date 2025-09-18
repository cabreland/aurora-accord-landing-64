import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface DeveloperBadgeProps {
  className?: string;
}

export const DeveloperBadge: React.FC<DeveloperBadgeProps> = ({ className }) => {
  return (
    <Badge variant="outline" className={`border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 ${className}`}>
      <Shield className="w-3 h-3 mr-1" />
      Admin Dev Mode
    </Badge>
  );
};
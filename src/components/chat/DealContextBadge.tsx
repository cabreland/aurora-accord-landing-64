import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface DealContextBadgeProps {
  dealName: string;
}

export const DealContextBadge: React.FC<DealContextBadgeProps> = ({ dealName }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--muted))] rounded-lg mb-3">
      <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
      <span className="text-sm text-[hsl(var(--muted-foreground))]">
        Re: <span className="font-medium text-[hsl(var(--foreground))]">{dealName}</span>
      </span>
    </div>
  );
};

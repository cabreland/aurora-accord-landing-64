import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NDAStatCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  variant: 'active' | 'expiring' | 'expired' | 'total';
  onClick?: () => void;
}

export function NDAStatCard({ label, count, icon: Icon, variant, onClick }: NDAStatCardProps) {
  const variantStyles = {
    active: 'border-green-500/30 hover:border-green-500/50',
    expiring: 'border-warning/30 hover:border-warning/50',
    expired: 'border-destructive/30 hover:border-destructive/50',
    total: 'border-border hover:border-primary/30'
  };

  const iconStyles = {
    active: 'text-green-500 bg-green-500/10',
    expiring: 'text-warning bg-warning/10',
    expired: 'text-destructive bg-destructive/10',
    total: 'text-primary bg-primary/10'
  };

  const countStyles = {
    active: 'text-green-500',
    expiring: 'text-warning',
    expired: 'text-destructive',
    total: 'text-foreground'
  };

  return (
    <Card 
      className={cn(
        "bg-card border transition-all cursor-pointer hover:shadow-md",
        variantStyles[variant]
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn("text-3xl font-bold", countStyles[variant])}>
              {count}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
          <div className={cn("p-3 rounded-full", iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

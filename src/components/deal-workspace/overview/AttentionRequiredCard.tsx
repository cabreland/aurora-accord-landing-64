import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  ArrowRight,
  FolderOpen,
  Users,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AttentionAlert {
  id: string;
  severity: 'critical' | 'warning';
  type: 'documents' | 'team' | 'requests' | 'data-room';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AttentionRequiredCardProps {
  alerts: AttentionAlert[];
}

const getAlertIcon = (type: AttentionAlert['type']) => {
  switch (type) {
    case 'documents':
      return FileText;
    case 'team':
      return Users;
    case 'requests':
      return Clock;
    case 'data-room':
      return FolderOpen;
    default:
      return AlertCircle;
  }
};

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  const critical = alerts.filter(a => a.severity === 'critical');
  const warnings = alerts.filter(a => a.severity === 'warning');

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Attention Required
          </CardTitle>
          <div className="flex gap-2">
            {critical.length > 0 && (
              <Badge variant="destructive">
                {critical.length} Critical
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                {warnings.length} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {alerts.map(alert => {
          const Icon = getAlertIcon(alert.type);
          return (
            <Alert 
              key={alert.id}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
              className={cn(
                'flex items-start justify-between',
                alert.severity === 'warning' && 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-100'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-1.5 rounded-md',
                  alert.severity === 'critical' ? 'bg-destructive/20' : 'bg-amber-200/50'
                )}>
                  <Icon className={cn(
                    'h-4 w-4',
                    alert.severity === 'critical' ? 'text-destructive' : 'text-amber-700'
                  )} />
                </div>
                <AlertDescription className="flex-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm opacity-80 mt-0.5">{alert.description}</p>
                </AlertDescription>
              </div>
              {alert.onAction && alert.actionLabel && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={alert.onAction}
                  className="shrink-0 ml-4"
                >
                  {alert.actionLabel}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};

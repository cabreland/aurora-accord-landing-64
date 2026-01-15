import { AlertTriangle, Calendar, Bell, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, format } from 'date-fns';

interface ExpiringNDA {
  id: string;
  signer_name: string;
  signer_email: string;
  expires_at: string;
  companies?: { name: string };
}

interface ExpiringSoonAlertProps {
  ndas: ExpiringNDA[];
  onExtend: (id: string) => void;
  onRemind: (id: string) => void;
  onView: (id: string) => void;
  onSendAllReminders: () => void;
  isLoading?: boolean;
}

export function ExpiringSoonAlert({ 
  ndas, 
  onExtend, 
  onRemind, 
  onView, 
  onSendAllReminders,
  isLoading 
}: ExpiringSoonAlertProps) {
  if (ndas.length === 0) return null;

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-warning flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Expiring Soon ({ndas.length})
        </h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={onSendAllReminders}
          disabled={isLoading}
          className="border-warning/50 text-warning hover:bg-warning/10"
        >
          <Bell className="w-4 h-4 mr-2" />
          Send All Reminders
        </Button>
      </div>
      
      <div className="space-y-3">
        {ndas.map(nda => {
          const daysUntil = differenceInDays(new Date(nda.expires_at), new Date());
          
          return (
            <div 
              key={nda.id} 
              className="bg-card rounded-lg p-4 flex justify-between items-center border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center text-warning font-semibold">
                  {nda.signer_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {nda.signer_name}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground font-normal">
                      {nda.companies?.name || 'Portfolio Access'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      {daysUntil} {daysUntil === 1 ? 'day' : 'days'} left
                    </Badge>
                    <span className="text-muted-foreground">
                      Expires {format(new Date(nda.expires_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => onExtend(nda.id)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Extend
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRemind(nda.id)}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Remind
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onView(nda.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

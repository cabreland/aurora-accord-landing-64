import React from 'react';
import { 
  FinancingApplication, 
  FINANCING_STAGE_LABELS 
} from '@/hooks/useFinancing';
import { AlertTriangle, Clock, FileX, Ban, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface FinancingAttentionRequiredProps {
  applications: FinancingApplication[];
}

interface Alert {
  id: string;
  type: 'critical' | 'warning';
  icon: React.ElementType;
  title: string;
  description: string;
  applicationId: string;
  dealName: string;
}

export const FinancingAttentionRequired: React.FC<FinancingAttentionRequiredProps> = ({ applications }) => {
  const navigate = useNavigate();
  
  // Generate alerts based on application status
  const alerts: Alert[] = [];
  
  applications.forEach(app => {
    // Critical: Docs requested for more than 5 days
    if (app.stage === 'additional_docs_requested' && app.days_in_stage > 5) {
      alerts.push({
        id: `docs-${app.id}`,
        type: 'critical',
        icon: FileX,
        title: 'Documents overdue',
        description: `${app.days_in_stage} days waiting for documents`,
        applicationId: app.id,
        dealName: app.deal?.company_name || 'Unknown Deal'
      });
    }
    
    // Critical: Low health score
    if (app.health_score < 50) {
      alerts.push({
        id: `health-${app.id}`,
        type: 'critical',
        icon: AlertTriangle,
        title: 'Application at risk',
        description: `Health score: ${app.health_score}%`,
        applicationId: app.id,
        dealName: app.deal?.company_name || 'Unknown Deal'
      });
    }
    
    // Warning: Stalled in stage for too long
    if (app.days_in_stage > 14 && !['funded', 'declined', 'withdrawn'].includes(app.stage)) {
      alerts.push({
        id: `stalled-${app.id}`,
        type: 'warning',
        icon: Clock,
        title: 'Application stalled',
        description: `${app.days_in_stage} days in ${FINANCING_STAGE_LABELS[app.stage]}`,
        applicationId: app.id,
        dealName: app.deal?.company_name || 'Unknown Deal'
      });
    }
    
    // Warning: Closing date approaching
    if (app.closing_date) {
      const closingDate = new Date(app.closing_date);
      const daysUntilClosing = Math.ceil((closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilClosing > 0 && daysUntilClosing <= 7) {
        alerts.push({
          id: `closing-${app.id}`,
          type: 'warning',
          icon: Clock,
          title: 'Closing soon',
          description: `Closing in ${daysUntilClosing} days`,
          applicationId: app.id,
          dealName: app.deal?.company_name || 'Unknown Deal'
        });
      }
    }
  });
  
  // Sort: critical first, then by type
  const sortedAlerts = alerts.sort((a, b) => {
    if (a.type === 'critical' && b.type !== 'critical') return -1;
    if (a.type !== 'critical' && b.type === 'critical') return 1;
    return 0;
  });
  
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  
  if (sortedAlerts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Attention Required</h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No issues requiring attention</p>
          <p className="text-xs mt-1">All applications are on track</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="font-medium text-foreground">Attention Required</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
              {warningCount} warning
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sortedAlerts.slice(0, 5).map((alert) => (
          <div 
            key={alert.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:border-[#D4AF37]/30 ${
              alert.type === 'critical' 
                ? 'bg-red-500/5 border-red-500/20' 
                : 'bg-amber-500/5 border-amber-500/20'
            }`}
            onClick={() => navigate(`/financing/${alert.applicationId}`)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                <alert.icon className={`w-4 h-4 ${
                  alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{alert.dealName}</p>
                <p className={`text-xs ${
                  alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {alert.title} — {alert.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>
      
      {sortedAlerts.length > 5 && (
        <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground hover:text-foreground">
          View all {sortedAlerts.length} alerts
        </Button>
      )}
    </div>
  );
};

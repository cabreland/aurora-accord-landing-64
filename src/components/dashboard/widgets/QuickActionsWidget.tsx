import React from 'react';
import { WidgetContainer } from '../shared/WidgetContainer';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Zap, 
  Plus, 
  Upload, 
  UserPlus, 
  FileDown,
  Settings,
  Building2,
  FileText,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActionsWidget = () => {
  const { profile } = useUserProfile();
  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'admin' || profile?.role === 'editor';

  const primaryActions = [
    {
      label: 'Add New Deal',
      icon: Plus,
      path: '/deals?action=create',
      description: 'Create a new M&A opportunity',
      color: 'bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F]'
    },
    ...(isStaff ? [{
      label: 'Add Company',
      icon: Building2,
      path: '/companies?action=create',
      description: 'List a new company',
      color: 'bg-[#F28C38] hover:bg-[#F28C38]/80 text-[#FAFAFA]'
    }] : []),
    {
      label: 'Upload Documents',
      icon: Upload,
      path: '/documents?action=upload',
      description: 'Add deal documents',
      color: 'bg-[#22C55E] hover:bg-[#22C55E]/80 text-[#FAFAFA]'
    }
  ];

  const secondaryActions = [
    ...(isAdmin ? [{
      label: 'Invite Investors',
      icon: Mail,
      path: '/investor-invitations',
      description: 'Send deal invitations'
    }] : []),
    ...(isAdmin ? [{
      label: 'Invite User',
      icon: UserPlus,
      path: '/users?action=invite',
      description: 'Add team member'
    }] : []),
    {
      label: 'Export Reports',
      icon: FileDown,
      path: '/reports',
      description: 'Download analytics'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'Configure portal'
    }
  ];

  return (
    <WidgetContainer title="Quick Actions" icon={Zap}>
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <Button 
                className={`w-full justify-start h-auto p-3 ${action.color}`}
                size="sm"
              >
                <action.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{action.label}</div>
                  <div className="text-xs opacity-75 mt-0.5 truncate">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        {secondaryActions.length > 0 && (
          <div className="border-t border-border pt-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">More Actions</h4>
            <div className="space-y-1">
              {secondaryActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between bg-card/50 hover:bg-accent/50 h-8 px-2"
                    size="sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <action.icon className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs truncate">{action.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate ml-2">
                      {action.description}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium mb-1">Need Help?</p>
              <p className="text-xs text-muted-foreground mb-2 truncate">
                Access guides and support docs
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs"
              >
                View Docs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
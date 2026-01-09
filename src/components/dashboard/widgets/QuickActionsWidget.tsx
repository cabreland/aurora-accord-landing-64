import React from 'react';
import { WidgetContainer } from '../shared/WidgetContainer';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Zap, 
  Plus, 
  Upload, 
  UserPlus, 
  FileDown,
  Settings,
  Building2,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActionsWidget = () => {
  const { profile } = useUserProfile();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isStaff = isAdmin || profile?.role === 'editor';

  const primaryActions = [
    {
      label: 'Add New Deal',
      icon: Plus,
      path: '/deals?action=create',
      description: 'Create a new M&A opportunity',
      primary: true
    },
    ...(isStaff ? [{
      label: 'Add Company',
      icon: Building2,
      path: '/companies?action=create',
      description: 'List a new company',
      primary: false
    }] : []),
    {
      label: 'Upload Documents',
      icon: Upload,
      path: '/documents?action=upload',
      description: 'Add deal documents',
      primary: false
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
        {/* Primary Actions - Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.path} className="block">
              <div className={`h-full p-4 rounded-lg border transition-all duration-200 group cursor-pointer ${
                action.primary 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:-translate-y-0.5' 
                  : 'bg-secondary border-border hover:border-primary/30 hover:bg-muted'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  action.primary 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <action.icon className={`w-6 h-6 ${
                    action.primary ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>
                <div className={`font-bold text-sm mb-1 ${
                  action.primary ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {action.label}
                </div>
                <div className={`text-xs ${
                  action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Actions - Grid Layout */}
        {secondaryActions.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              More Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {secondaryActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <div className="bg-secondary hover:bg-muted border border-border hover:border-primary/30 rounded-lg p-3 transition-all duration-200 group cursor-pointer">
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-2" />
                    <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      {action.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};

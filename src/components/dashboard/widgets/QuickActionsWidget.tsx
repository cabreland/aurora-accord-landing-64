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
        {/* Primary Actions */}
        <div className="space-y-2">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <Button 
                className={`w-full justify-start h-auto p-3 transition-all duration-200 ${
                  action.primary 
                    ? 'bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] hover:scale-[1.02] shadow-md hover:shadow-lg' 
                    : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F4E4BC] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
                }`}
                size="sm"
              >
                <action.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{action.label}</div>
                  <div className={`text-xs mt-0.5 truncate ${
                    action.primary ? 'opacity-75' : 'opacity-60'
                  }`}>
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        {secondaryActions.length > 0 && (
          <div className="border-t border-[#D4AF37]/20 pt-3">
            <h4 className="text-sm font-semibold text-[#F4E4BC] mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
              More Actions
            </h4>
            <div className="space-y-1">
              {secondaryActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between bg-[#1A1F2E]/50 hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/20 h-9 px-3 transition-all duration-200 group"
                    size="sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <action.icon className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]/70 group-hover:text-[#D4AF37]" />
                      <span className="text-xs font-medium text-[#F4E4BC] truncate group-hover:text-[#FAFAFA]">{action.label}</span>
                    </div>
                    <span className="text-xs text-[#F4E4BC]/60 hidden sm:inline truncate ml-2 group-hover:text-[#F4E4BC]/80">
                      {action.description}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-r from-[#1A1F2E] to-[#2A2F3A] rounded-lg p-3 border border-[#D4AF37]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#F4E4BC] mb-1">Need Help?</p>
              <p className="text-xs text-[#F4E4BC]/70 mb-3">
                Access comprehensive guides, API documentation, and expert support resources
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-transparent border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all duration-200"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
};
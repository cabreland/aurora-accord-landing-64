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
  FileText
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
        <div className="space-y-3">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <Button 
                className={`w-full justify-start h-auto p-4 ${action.color}`}
              >
                <action.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs opacity-80 mt-1">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        {secondaryActions.length > 0 && (
          <div className="border-t border-[#D4AF37]/20 pt-4">
            <h4 className="text-sm font-medium text-[#F4E4BC] mb-3">More Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              {secondaryActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-[#2A2F3A] border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]"
                    size="sm"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{action.label}</span>
                    <span className="text-xs opacity-60">{action.description}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-[#1A1F2E] rounded-lg p-3 border border-[#D4AF37]/20">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#FAFAFA] font-medium mb-1">Need Help?</p>
              <p className="text-xs text-[#F4E4BC]/60 mb-2">
                Access guides, tutorials, and support documentation.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-transparent border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
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
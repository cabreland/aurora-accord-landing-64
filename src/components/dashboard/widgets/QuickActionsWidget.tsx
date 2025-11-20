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
        {/* Primary Actions - Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.path} className="block">
              <div className={`h-full p-4 rounded-lg border transition-all duration-200 group cursor-pointer ${
                action.primary 
                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] hover:shadow-lg hover:-translate-y-1' 
                  : 'bg-[#1A1F2E] border-[#D4AF37]/30 hover:border-[#D4AF37]/50 hover:bg-[#2A2F3A]'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  action.primary 
                    ? 'bg-[#0A0F0F]/20' 
                    : 'bg-[#D4AF37]/20'
                }`}>
                  <action.icon className={`w-6 h-6 ${
                    action.primary ? 'text-[#0A0F0F]' : 'text-[#D4AF37]'
                  }`} />
                </div>
                <div className={`font-bold text-sm mb-1 ${
                  action.primary ? 'text-[#0A0F0F]' : 'text-[#FAFAFA]'
                }`}>
                  {action.label}
                </div>
                <div className={`text-xs ${
                  action.primary ? 'text-[#0A0F0F]/70' : 'text-[#F4E4BC]/60'
                }`}>
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Actions - Grid Layout */}
        {secondaryActions.length > 0 && (
          <div className="border-t border-[#D4AF37]/20 pt-4">
            <h4 className="text-xs font-semibold text-[#F4E4BC]/70 mb-3 uppercase tracking-wider">
              More Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {secondaryActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <div className="bg-[#1A1F2E] hover:bg-[#2A2F3A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 rounded-lg p-3 transition-all duration-200 group cursor-pointer">
                    <action.icon className="w-5 h-5 text-[#D4AF37]/70 group-hover:text-[#D4AF37] mb-2" />
                    <div className="text-xs font-medium text-[#F4E4BC] group-hover:text-[#FAFAFA]">
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
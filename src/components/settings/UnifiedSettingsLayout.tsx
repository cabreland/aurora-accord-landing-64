import React, { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Settings, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Monitor,
  Palette,
  Cog,
  Users,
  Shield,
  Activity,
  FileText,
  Database,
  Bell,
  Key,
  Globe,
  Webhook,
  Download,
  Upload,
  Save,
  History
} from 'lucide-react';

// Import all setting components
import SystemOverviewTab from './SystemOverviewTab';
import BrandingTab from './BrandingTab';
import SystemSettingsTab from './SystemSettingsTab';
import UserManagementTab from './UserManagementTab';
import SessionMonitoringTab from './SessionMonitoringTab';
import UserActivityTab from './UserActivityTab';
import { EmailTemplatesTab } from './EmailTemplatesTab';
import AccessPolicyTab from './AccessPolicyTab';
import CustomFieldsTab from './CustomFieldsTab';
import DataRetentionTab from './DataRetentionTab';
import {
  RolePermissionsTab,
  RegistrationConfigTab,
  AuthenticationTab,
  AuditLoggingTab,
  SecurityMonitoringTab,
  DocumentPoliciesTab,
  FileStorageTab,
  VersionControlTab,
  EmailProviderTab,
  WebhookManagementTab,
  APISettingsTab
} from './stub-components';

interface SettingsSection {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  requiredRole?: 'super_admin' | 'admin' | 'editor';
}

interface SettingsGroup {
  title: string;
  sections: SettingsSection[];
  defaultOpen: boolean;
}

const settingsGroups: SettingsGroup[] = [
  {
    title: 'GENERAL',
    defaultOpen: true,
    sections: [
      { key: 'overview', title: 'System Overview', icon: Monitor, component: SystemOverviewTab },
      { key: 'branding', title: 'Branding & Theme', icon: Palette, component: BrandingTab },
      { key: 'platform', title: 'Platform Configuration', icon: Cog, component: SystemSettingsTab },
    ]
  },
  {
    title: 'USER MANAGEMENT',
    defaultOpen: false,
    sections: [
      { key: 'users', title: 'User Accounts', icon: Users, component: UserManagementTab, requiredRole: 'admin' },
      { key: 'roles', title: 'Role & Permissions', icon: Shield, component: RolePermissionsTab, requiredRole: 'admin' },
      { key: 'sessions', title: 'Session Monitoring', icon: Activity, component: SessionMonitoringTab, requiredRole: 'admin' },
      { key: 'activity', title: 'User Activity Logs', icon: History, component: UserActivityTab, requiredRole: 'admin' },
    ]
  },
  {
    title: 'INVESTOR PORTAL',
    defaultOpen: false,
    sections: [
      { key: 'registration', title: 'Registration Configuration', icon: FileText, component: RegistrationConfigTab },
      { key: 'email-templates', title: 'Email Templates', icon: Bell, component: EmailTemplatesTab },
      { key: 'access-policies', title: 'Access Policies', icon: Key, component: AccessPolicyTab },
    ]
  },
  {
    title: 'SECURITY & COMPLIANCE',
    defaultOpen: false,
    sections: [
      { key: 'authentication', title: 'Authentication Settings', icon: Shield, component: AuthenticationTab, requiredRole: 'admin' },
      { key: 'audit', title: 'Audit Logging', icon: FileText, component: AuditLoggingTab, requiredRole: 'admin' },
      { key: 'retention', title: 'Data Retention Policies', icon: Database, component: DataRetentionTab, requiredRole: 'admin' },
      { key: 'security-monitoring', title: 'Security Monitoring', icon: Activity, component: SecurityMonitoringTab, requiredRole: 'admin' },
    ]
  },
  {
    title: 'DOCUMENTS & DATA',
    defaultOpen: false,
    sections: [
      { key: 'document-policies', title: 'Document Management', icon: FileText, component: DocumentPoliciesTab },
      { key: 'custom-fields', title: 'Custom Fields', icon: Database, component: CustomFieldsTab },
      { key: 'file-storage', title: 'File Storage Settings', icon: Database, component: FileStorageTab, requiredRole: 'admin' },
      { key: 'version-control', title: 'Version Control Rules', icon: History, component: VersionControlTab },
    ]
  },
  {
    title: 'INTEGRATIONS',
    defaultOpen: false,
    sections: [
      { key: 'email-provider', title: 'Email Provider', icon: Bell, component: EmailProviderTab, requiredRole: 'admin' },
      { key: 'webhooks', title: 'Webhook Management', icon: Webhook, component: WebhookManagementTab, requiredRole: 'admin' },
      { key: 'api', title: 'API Settings', icon: Globe, component: APISettingsTab, requiredRole: 'admin' },
    ]
  }
];

interface UnifiedSettingsLayoutProps {
  activeSection?: string;
}

const UnifiedSettingsLayout: React.FC<UnifiedSettingsLayoutProps> = ({ 
  activeSection = 'overview' 
}) => {
  const { profile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    settingsGroups.forEach(group => {
      initial[group.title] = group.defaultOpen;
    });
    return initial;
  });

  const [currentSection, setCurrentSection] = useState(activeSection);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const hasAccess = (requiredRole?: 'super_admin' | 'admin' | 'editor') => {
    if (!requiredRole) return true;
    if (profile?.role === 'super_admin') return true;
    if (requiredRole === 'admin') return profile?.role === 'admin';
    if (requiredRole === 'editor') return ['admin', 'editor'].includes(profile?.role || '');
    return false;
  };

  const filteredGroups = settingsGroups.map(group => ({
    ...group,
    sections: group.sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
      const hasPermission = hasAccess(section.requiredRole);
      return matchesSearch && hasPermission;
    })
  })).filter(group => group.sections.length > 0);

  const currentSectionData = settingsGroups
    .flatMap(group => group.sections)
    .find(section => section.key === currentSection);

  const currentGroup = settingsGroups.find(group => 
    group.sections.some(section => section.key === currentSection)
  );

  const CurrentComponent = currentSectionData?.component || SystemOverviewTab;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {profile?.role?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Categories</h2>
            </div>
            
            {/* Navigation */}
            <div className="p-4 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredGroups.map((group) => (
                <Collapsible
                  key={group.title}
                  open={openGroups[group.title]}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50">
                    <span>{group.title}</span>
                    {openGroups[group.title] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1 mt-2">
                    {group.sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = currentSection === section.key;
                      
                      return (
                        <button
                          key={section.key}
                          onClick={() => setCurrentSection(section.key)}
                          className={`flex items-center gap-3 w-full p-3 text-sm rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-left">{section.title}</span>
                          {section.requiredRole && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {section.requiredRole === 'super_admin' ? 'Super' : section.requiredRole}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {/* Settings Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                Export Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Upload className="w-4 h-4" />
                Import Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink>Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentGroup && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink>{currentGroup.title}</BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentSectionData?.title || 'System Overview'}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <h2 className="text-xl font-semibold text-foreground mt-4">
                {currentSectionData?.title || 'System Overview'}
              </h2>
            </div>
            
            <div className="p-6">
              <CurrentComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSettingsLayout;
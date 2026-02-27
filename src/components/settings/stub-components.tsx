import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock } from 'lucide-react';
import { NDASettingsTab } from './NDASettingsTab';
import { CompanySettingsTab } from './CompanySettingsTab';
import { FormFieldsTab } from './FormFieldsTab';
import { EmailTemplatesTab } from './EmailTemplatesTab';
import { ValidationRulesTab } from './ValidationRulesTab';

const ComingSoonStub = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="font-medium text-foreground mb-1">Coming Soon</p>
        <p className="text-sm">This feature is being finalized for the next release.</p>
      </div>
    </CardContent>
  </Card>
);
export const RolePermissionsTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Role & Permissions Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="font-medium text-foreground mb-1">Coming Soon</p>
        <p className="text-sm">Role and permissions management is being finalized for the next release.</p>
      </div>
    </CardContent>
  </Card>
);

export const RegistrationConfigTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nda');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Registration Configuration</h2>
        <p className="text-muted-foreground">
          Configure all aspects of the investor registration process
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nda">NDA Content</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="form">Form Fields</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="nda">
          <NDASettingsTab />
        </TabsContent>

        <TabsContent value="company">
          <CompanySettingsTab />
        </TabsContent>

        <TabsContent value="form">
          <FormFieldsTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplatesTab />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationRulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const AuthenticationTab: React.FC = () => <ComingSoonStub title="Authentication Settings" />;
export const AuditLoggingTab: React.FC = () => <ComingSoonStub title="Audit Logging" />;
export const SecurityMonitoringTab: React.FC = () => <ComingSoonStub title="Security Monitoring" />;
export const DocumentPoliciesTab: React.FC = () => <ComingSoonStub title="Document Management Policies" />;
export const FileStorageTab: React.FC = () => <ComingSoonStub title="File Storage Settings" />;
export const VersionControlTab: React.FC = () => <ComingSoonStub title="Version Control Rules" />;
export const EmailProviderTab: React.FC = () => <ComingSoonStub title="Email Provider Configuration" />;
export const WebhookManagementTab: React.FC = () => <ComingSoonStub title="Webhook Management" />;
export const APISettingsTab: React.FC = () => <ComingSoonStub title="API Settings" />;

export default {
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
};
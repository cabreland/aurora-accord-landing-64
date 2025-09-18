import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NDASettingsTab } from './NDASettingsTab';
import { CompanySettingsTab } from './CompanySettingsTab';
import { FormFieldsTab } from './FormFieldsTab';
import { EmailTemplatesTab } from './EmailTemplatesTab';
import { ValidationRulesTab } from './ValidationRulesTab';

// Placeholder components for missing settings tabs
export const RolePermissionsTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Role & Permissions Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Role and permissions management interface coming soon.
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

export const AuthenticationTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Authentication Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Authentication settings interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const AuditLoggingTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Audit Logging</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Audit logging interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const SecurityMonitoringTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Security Monitoring</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Security monitoring interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const DocumentPoliciesTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Document Management Policies</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Document policies interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const FileStorageTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>File Storage Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        File storage settings interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const VersionControlTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Version Control Rules</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Version control interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const EmailProviderTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Email Provider Configuration</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Email provider configuration interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const WebhookManagementTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Webhook Management</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        Webhook management interface coming soon.
      </div>
    </CardContent>
  </Card>
);

export const APISettingsTab: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>API Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        API settings interface coming soon.
      </div>
    </CardContent>
  </Card>
);

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
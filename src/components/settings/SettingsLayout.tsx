
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, FileText, Shield, Target, Database, Bell, Clock } from 'lucide-react';
import BrandingTab from './BrandingTab';
import LegalNDATab from './LegalNDATab';
import AccessPolicyTab from './AccessPolicyTab';
import GrowthOpportunitiesTab from './GrowthOpportunitiesTab';
import CustomFieldsTab from './CustomFieldsTab';
import NotificationsTab from './NotificationsTab';
import DataRetentionTab from './DataRetentionTab';

const SettingsLayout: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings Management</h1>
          <p className="text-muted-foreground">
            Configure portal settings, legal documents, and system preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="branding" className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-card border border-border p-2">
            <TabsTrigger value="branding" className="w-full justify-start gap-2 py-3">
              <Palette className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="legal" className="w-full justify-start gap-2 py-3">
              <FileText className="w-4 h-4" />
              Legal & NDA
            </TabsTrigger>
            <TabsTrigger value="access" className="w-full justify-start gap-2 py-3">
              <Shield className="w-4 h-4" />
              Access Policy
            </TabsTrigger>
            <TabsTrigger value="growth" className="w-full justify-start gap-2 py-3">
              <Target className="w-4 h-4" />
              Growth Opportunities
            </TabsTrigger>
            <TabsTrigger value="fields" className="w-full justify-start gap-2 py-3">
              <Database className="w-4 h-4" />
              Custom Fields
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-2 py-3">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="retention" className="w-full justify-start gap-2 py-3">
              <Clock className="w-4 h-4" />
              Data Retention
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>

          <TabsContent value="legal">
            <LegalNDATab />
          </TabsContent>

          <TabsContent value="access">
            <AccessPolicyTab />
          </TabsContent>

          <TabsContent value="growth">
            <GrowthOpportunitiesTab />
          </TabsContent>

          <TabsContent value="fields">
            <CustomFieldsTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="retention">
            <DataRetentionTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsLayout;

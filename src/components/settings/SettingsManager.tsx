
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Target, Database, Sliders } from 'lucide-react';
import SystemSettingsTab from './SystemSettingsTab';
import GrowthOpportunitiesTab from './GrowthOpportunitiesTab';
import CustomFieldsTab from './CustomFieldsTab';

const SettingsManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings Management</h1>
          <p className="text-muted-foreground">
            Configure system settings, growth opportunities, and custom fields
          </p>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Growth Opportunities
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Custom Fields
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemSettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <GrowthOpportunitiesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Custom Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomFieldsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;

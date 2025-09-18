import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, FileText, Building, Mail, Shield, Cog } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { NDASettingsTab } from '@/components/settings/NDASettingsTab';
import { CompanySettingsTab } from '@/components/settings/CompanySettingsTab';
import { FormFieldsTab } from '@/components/settings/FormFieldsTab';
import { EmailTemplatesTab } from '@/components/settings/EmailTemplatesTab';
import { ValidationRulesTab } from '@/components/settings/ValidationRulesTab';

const RegistrationSettings: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Registration Settings
        </h1>
        <p className="text-muted-foreground">
          Configure all aspects of the investor registration process including NDA content, 
          form fields, email templates, and validation rules.
        </p>
      </div>

      <Tabs defaultValue="nda" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nda" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            NDA Content
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Info
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            Form Fields
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nda" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>NDA Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <NDASettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanySettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Form Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <FormFieldsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Template Management</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailTemplatesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationRulesTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegistrationSettings;
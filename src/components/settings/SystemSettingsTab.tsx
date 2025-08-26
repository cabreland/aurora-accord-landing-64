
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const SystemSettingsTab: React.FC = () => {
  const { settings, loading, updateSetting } = useSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const getSettingValue = (key: string, defaultValue: any = '') => {
    if (localSettings[key] !== undefined) {
      return localSettings[key];
    }
    const setting = settings.find(s => s.key === key);
    return setting?.value ?? defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(localSettings)) {
      await updateSetting(key, value);
    }
    setLocalSettings({});
  };

  const hasChanges = Object.keys(localSettings).length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card className="bg-muted/20 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Portal Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="portal_name">Portal Name</Label>
              <Input
                id="portal_name"
                value={getSettingValue('portal_name', 'Investor Portal')}
                onChange={(e) => handleSettingChange('portal_name', e.target.value)}
                placeholder="Investor Portal"
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="portal_description">Portal Description</Label>
              <Textarea
                id="portal_description"
                value={getSettingValue('portal_description', '')}
                onChange={(e) => handleSettingChange('portal_description', e.target.value)}
                placeholder="Welcome to our investor portal..."
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={getSettingValue('contact_email', '')}
                onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                placeholder="contact@company.com"
                className="bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Access & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require NDA Acceptance</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to accept NDA before viewing deal details
                </p>
              </div>
              <Switch
                checked={getSettingValue('require_nda', true)}
                onCheckedChange={(checked) => handleSettingChange('require_nda', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve Access Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve investor access requests
                </p>
              </div>
              <Switch
                checked={getSettingValue('auto_approve_access', false)}
                onCheckedChange={(checked) => handleSettingChange('auto_approve_access', checked)}
              />
            </div>

            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={getSettingValue('session_timeout', 60)}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value) || 60)}
                placeholder="60"
                className="bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                checked={getSettingValue('email_notifications', true)}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Access Request Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins when investors request access
                </p>
              </div>
              <Switch
                checked={getSettingValue('access_request_notifications', true)}
                onCheckedChange={(checked) => handleSettingChange('access_request_notifications', checked)}
              />
            </div>

            <div>
              <Label htmlFor="notification_email">Notification Email</Label>
              <Input
                id="notification_email"
                type="email"
                value={getSettingValue('notification_email', '')}
                onChange={(e) => handleSettingChange('notification_email', e.target.value)}
                placeholder="notifications@company.com"
                className="bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsTab;

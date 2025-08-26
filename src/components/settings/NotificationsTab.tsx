
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Mail } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const NotificationsTab: React.FC = () => {
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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure email notifications for portal events
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="email_from">From Email Address</Label>
          <Input
            id="email_from"
            type="email"
            value={getSettingValue('email_from', 'noreply@company.com')}
            onChange={(e) => handleSettingChange('email_from', e.target.value)}
            placeholder="noreply@yourcompany.com"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email address used for sending notifications
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Email Notification Types</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>New Access Request</Label>
              <p className="text-sm text-muted-foreground">
                Notify admins when investors request access
              </p>
            </div>
            <Switch
              checked={getSettingValue('notify_new_access_request', true)}
              onCheckedChange={(checked) => handleSettingChange('notify_new_access_request', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Access Decision Made</Label>
              <p className="text-sm text-muted-foreground">
                Notify investors when their access request is approved/denied
              </p>
            </div>
            <Switch
              checked={getSettingValue('notify_access_decided', true)}
              onCheckedChange={(checked) => handleSettingChange('notify_access_decided', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>New Document Uploaded</Label>
              <p className="text-sm text-muted-foreground">
                Notify relevant users when new documents are available
              </p>
            </div>
            <Switch
              checked={getSettingValue('notify_new_document', true)}
              onCheckedChange={(checked) => handleSettingChange('notify_new_document', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>NDA Accepted</Label>
              <p className="text-sm text-muted-foreground">
                Notify admins when users accept NDAs
              </p>
            </div>
            <Switch
              checked={getSettingValue('notify_nda_accepted', true)}
              onCheckedChange={(checked) => handleSettingChange('notify_nda_accepted', checked)}
            />
          </div>
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface NotificationsTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      broker_email_notifications: localSettings.broker_email_notifications,
      investor_email_notifications: localSettings.investor_email_notifications
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Broker Email Notifications</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Send email notifications to brokers for new messages
          </p>
        </div>
        <Switch
          checked={localSettings.broker_email_notifications}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, broker_email_notifications: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Investor Email Notifications</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Send email notifications to investors for broker replies
          </p>
        </div>
        <Switch
          checked={localSettings.investor_email_notifications}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, investor_email_notifications: checked })}
        />
      </div>

      <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
        <p className="text-sm font-medium mb-2">Email Notifications Include:</p>
        <ul className="text-sm text-[hsl(var(--muted-foreground))] space-y-1 list-disc list-inside">
          <li>New conversation messages</li>
          <li>Information requests</li>
          <li>Call scheduling requests</li>
          <li>Interest expressions</li>
        </ul>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

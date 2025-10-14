import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface SchedulingTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const SchedulingTab: React.FC<SchedulingTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      calendly_link: localSettings.calendly_link,
      enable_manual_scheduling: localSettings.enable_manual_scheduling
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Calendly Integration</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Optionally integrate with Calendly for automated scheduling
        </p>
        <Input
          value={localSettings.calendly_link || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, calendly_link: e.target.value })}
          placeholder="https://calendly.com/your-link"
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Leave empty to use manual scheduling
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Manual Scheduling</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Allow investors to request calls with date/time preferences
          </p>
        </div>
        <Switch
          checked={localSettings.enable_manual_scheduling}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enable_manual_scheduling: checked })}
        />
      </div>

      <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
        <p className="text-sm font-medium mb-2">Scheduling Behavior:</p>
        <ul className="text-sm text-[hsl(var(--muted-foreground))] space-y-1 list-disc list-inside">
          <li>If Calendly link is provided, clicking "Schedule Call" will open Calendly widget</li>
          <li>If no Calendly link, the manual scheduling form will be shown</li>
          <li>Manual scheduling creates call requests that brokers can review and schedule</li>
        </ul>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

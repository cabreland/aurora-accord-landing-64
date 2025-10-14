import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface BehaviorTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      auto_open_enabled: localSettings.auto_open_enabled,
      auto_open_delay: localSettings.auto_open_delay,
      show_online_status: localSettings.show_online_status,
      enable_typing_indicators: localSettings.enable_typing_indicators,
      enable_file_attachments: localSettings.enable_file_attachments,
      enable_emojis: localSettings.enable_emojis
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Auto-Open Widget</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Automatically open the widget when users visit the page
          </p>
        </div>
        <Switch
          checked={localSettings.auto_open_enabled}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, auto_open_enabled: checked })}
        />
      </div>

      {localSettings.auto_open_enabled && (
        <div>
          <Label className="text-base font-semibold">Auto-Open Delay</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
            Delay before auto-opening: {(localSettings.auto_open_delay / 1000).toFixed(1)}s
          </p>
          <Slider
            value={[localSettings.auto_open_delay]}
            onValueChange={([value]) => setLocalSettings({ ...localSettings, auto_open_delay: value })}
            min={0}
            max={30000}
            step={1000}
            className="w-full"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Show Online Status</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Display broker online/offline status in the widget
          </p>
        </div>
        <Switch
          checked={localSettings.show_online_status}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, show_online_status: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Typing Indicators</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Show "Broker is typing..." when they're composing a message
          </p>
        </div>
        <Switch
          checked={localSettings.enable_typing_indicators}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enable_typing_indicators: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">File Attachments</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Allow users to attach files in chat messages
          </p>
        </div>
        <Switch
          checked={localSettings.enable_file_attachments}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enable_file_attachments: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Emoji Picker</Label>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Enable emoji picker in the message input
          </p>
        </div>
        <Switch
          checked={localSettings.enable_emojis}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enable_emojis: checked })}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

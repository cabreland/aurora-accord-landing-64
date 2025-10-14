import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface ButtonConfigTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const ButtonConfigTab: React.FC<ButtonConfigTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      ask_button_label: localSettings.ask_button_label,
      info_button_label: localSettings.info_button_label,
      interest_button_label: localSettings.interest_button_label,
      call_button_label: localSettings.call_button_label
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Customize the labels for interaction buttons on deal cards
      </p>

      <div>
        <Label className="text-base font-semibold">Ask Button Label</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Opens the chat widget for questions
        </p>
        <Input
          value={localSettings.ask_button_label}
          onChange={(e) => setLocalSettings({ ...localSettings, ask_button_label: e.target.value })}
          placeholder="Ask Question"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Info Button Label</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Opens the information request modal
        </p>
        <Input
          value={localSettings.info_button_label}
          onChange={(e) => setLocalSettings({ ...localSettings, info_button_label: e.target.value })}
          placeholder="Request Info"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Interest Button Label</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Expresses interest in the deal
        </p>
        <Input
          value={localSettings.interest_button_label}
          onChange={(e) => setLocalSettings({ ...localSettings, interest_button_label: e.target.value })}
          placeholder="Express Interest"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Call Button Label</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Opens the call scheduling modal
        </p>
        <Input
          value={localSettings.call_button_label}
          onChange={(e) => setLocalSettings({ ...localSettings, call_button_label: e.target.value })}
          placeholder="Schedule Call"
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

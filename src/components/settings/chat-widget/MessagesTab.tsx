import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface MessagesTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      initial_greeting: localSettings.initial_greeting,
      away_message: localSettings.away_message,
      widget_title: localSettings.widget_title,
      placeholder_text: localSettings.placeholder_text,
      minimized_tooltip: localSettings.minimized_tooltip
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Widget Title</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Title shown in the widget header
        </p>
        <Input
          value={localSettings.widget_title}
          onChange={(e) => setLocalSettings({ ...localSettings, widget_title: e.target.value })}
          placeholder="Chat with Broker Team"
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Initial Greeting</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Message shown when users first open the chat
        </p>
        <Textarea
          value={localSettings.initial_greeting}
          onChange={(e) => setLocalSettings({ ...localSettings, initial_greeting: e.target.value })}
          placeholder="Hi! Have questions about a deal? We're here to help."
          rows={3}
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Away Message</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Message shown when brokers are offline
        </p>
        <Textarea
          value={localSettings.away_message}
          onChange={(e) => setLocalSettings({ ...localSettings, away_message: e.target.value })}
          placeholder="We're currently offline. Leave a message and we'll respond soon."
          rows={3}
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Input Placeholder</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Placeholder text in the message input field
        </p>
        <Input
          value={localSettings.placeholder_text}
          onChange={(e) => setLocalSettings({ ...localSettings, placeholder_text: e.target.value })}
          placeholder="Type your message..."
        />
      </div>

      <div>
        <Label className="text-base font-semibold">Minimized Tooltip</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Tooltip shown when hovering over the minimized widget button
        </p>
        <Input
          value={localSettings.minimized_tooltip}
          onChange={(e) => setLocalSettings({ ...localSettings, minimized_tooltip: e.target.value })}
          placeholder="Chat with us"
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface AppearanceTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, onUpdate, saving }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onUpdate({
      widget_position: localSettings.widget_position,
      primary_color: localSettings.primary_color,
      widget_size: localSettings.widget_size,
      bubble_style: localSettings.bubble_style
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Primary Color</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          Choose the primary color for your chat widget
        </p>
        <div className="flex items-center gap-3">
          <Input
            type="color"
            value={localSettings.primary_color}
            onChange={(e) => setLocalSettings({ ...localSettings, primary_color: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={localSettings.primary_color}
            onChange={(e) => setLocalSettings({ ...localSettings, primary_color: e.target.value })}
            className="flex-1"
            placeholder="#D4AF37"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Widget Position</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          Choose where the widget appears on the screen
        </p>
        <RadioGroup
          value={localSettings.widget_position}
          onValueChange={(value) => setLocalSettings({ ...localSettings, widget_position: value as any })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bottom-right" id="bottom-right" />
            <Label htmlFor="bottom-right" className="cursor-pointer">Bottom Right</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bottom-left" id="bottom-left" />
            <Label htmlFor="bottom-left" className="cursor-pointer">Bottom Left</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold">Widget Size</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          Choose the size of your chat widget
        </p>
        <RadioGroup
          value={localSettings.widget_size}
          onValueChange={(value) => setLocalSettings({ ...localSettings, widget_size: value as any })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small" className="cursor-pointer">Small (340px × 500px)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="cursor-pointer">Medium (380px × 600px)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large" className="cursor-pointer">Large (420px × 650px)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold">Bubble Style</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          Choose the style of the minimized widget button
        </p>
        <RadioGroup
          value={localSettings.bubble_style}
          onValueChange={(value) => setLocalSettings({ ...localSettings, bubble_style: value as any })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="circle" id="circle" />
            <Label htmlFor="circle" className="cursor-pointer">Circle</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rounded-square" id="rounded-square" />
            <Label htmlFor="rounded-square" className="cursor-pointer">Rounded Square</Label>
          </div>
        </RadioGroup>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

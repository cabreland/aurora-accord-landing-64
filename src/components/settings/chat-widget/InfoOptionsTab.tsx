import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, GripVertical } from 'lucide-react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';

interface InfoOptionsTabProps {
  settings: WidgetSettings;
  onUpdate: (updates: Partial<WidgetSettings>) => Promise<void>;
  saving: boolean;
}

export const InfoOptionsTab: React.FC<InfoOptionsTabProps> = ({ settings, onUpdate, saving }) => {
  const [options, setOptions] = useState<string[]>(settings.info_request_options);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate({ info_request_options: options });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Information Request Options</Label>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
          Customize the checkbox options shown in the info request modal
        </p>

        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-[hsl(var(--muted))] rounded-lg">
              <GripVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))] cursor-move" />
              <span className="flex-1 text-sm">{option}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveOption(index)}
                className="h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
          />
          <Button onClick={handleAddOption} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

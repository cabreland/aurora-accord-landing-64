
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Eye } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const LegalNDATab: React.FC = () => {
  const { settings, loading, updateSetting } = useSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

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

  const defaultNDATemplate = `# Non-Disclosure Agreement

This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] by and between [COMPANY_NAME] and the undersigned party.

## 1. Confidential Information
All information shared through this portal is considered confidential and proprietary.

## 2. Obligations
The receiving party agrees to:
- Keep all information strictly confidential
- Not disclose to any third parties
- Use information solely for evaluation purposes

## 3. Term
This agreement remains in effect for 3 years from the date of execution.

By accepting, you agree to be bound by these terms.`;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Legal & NDA Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure legal documents and non-disclosure agreement requirements
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Require NDA Acceptance</Label>
            <p className="text-sm text-muted-foreground">
              Force users to accept NDA before viewing deal details
            </p>
          </div>
          <Switch
            checked={getSettingValue('require_nda', true)}
            onCheckedChange={(checked) => handleSettingChange('require_nda', checked)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="nda_template">NDA Template (Markdown)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
          
          {showPreview ? (
            <div className="bg-background border border-border rounded-md p-4 min-h-[300px] prose prose-sm max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: getSettingValue('nda_template', defaultNDATemplate)
                    .replace(/\n/g, '<br>')
                    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                    .replace(/^- (.+)$/gm, '<li>$1</li>')
                }}
              />
            </div>
          ) : (
            <Textarea
              id="nda_template"
              value={getSettingValue('nda_template', defaultNDATemplate)}
              onChange={(e) => handleSettingChange('nda_template', e.target.value)}
              className="bg-background border-border min-h-[300px] font-mono text-sm"
              placeholder="Enter your NDA template in Markdown format..."
            />
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            Use [DATE] and [COMPANY_NAME] as placeholders that will be replaced automatically
          </p>
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

export default LegalNDATab;

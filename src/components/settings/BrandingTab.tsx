
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Upload, Palette, Check } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
  };
}

const colorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'M&A Portal (Default)',
    description: 'Gold and dark portal theme',
    colors: {
      primary: '45 84% 54%',
      primaryForeground: '162 14% 4%',
      secondary: '23 85% 59%',
      secondaryForeground: '162 14% 4%',
      accent: '45 84% 54%',
      accentForeground: '162 14% 4%',
      background: '191 14% 16%',
      foreground: '0 0% 98%',
      muted: '210 16% 20%',
      mutedForeground: '45 68% 85%',
      card: '211 18% 14%',
      cardForeground: '0 0% 98%',
      border: '210 16% 20%',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm ocean blue and teal',
    colors: {
      primary: '199 89% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '187 71% 45%',
      secondaryForeground: '0 0% 100%',
      accent: '172 66% 50%',
      accentForeground: '0 0% 100%',
      background: '200 50% 8%',
      foreground: '199 20% 92%',
      muted: '200 30% 18%',
      mutedForeground: '199 15% 65%',
      card: '200 40% 12%',
      cardForeground: '199 20% 92%',
      border: '200 25% 22%',
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    colors: {
      primary: '142 71% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '159 60% 40%',
      secondaryForeground: '0 0% 100%',
      accent: '173 58% 39%',
      accentForeground: '0 0% 100%',
      background: '150 30% 8%',
      foreground: '142 15% 92%',
      muted: '150 20% 18%',
      mutedForeground: '142 10% 65%',
      card: '150 25% 12%',
      cardForeground: '142 15% 92%',
      border: '150 18% 22%',
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and purple',
    colors: {
      primary: '24 95% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '291 64% 42%',
      secondaryForeground: '0 0% 100%',
      accent: '340 82% 52%',
      accentForeground: '0 0% 100%',
      background: '24 40% 8%',
      foreground: '24 15% 92%',
      muted: '24 25% 18%',
      mutedForeground: '24 10% 65%',
      card: '24 30% 12%',
      cardForeground: '24 15% 92%',
      border: '24 20% 22%',
    }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep purple and blue',
    colors: {
      primary: '263 70% 50%',
      primaryForeground: '0 0% 100%',
      secondary: '240 48% 42%',
      secondaryForeground: '0 0% 100%',
      accent: '280 60% 55%',
      accentForeground: '0 0% 100%',
      background: '240 50% 6%',
      foreground: '240 15% 92%',
      muted: '240 30% 16%',
      mutedForeground: '240 12% 65%',
      card: '240 40% 10%',
      cardForeground: '240 15% 92%',
      border: '240 25% 18%',
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional grey and blue',
    colors: {
      primary: '213 94% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '214 20% 35%',
      secondaryForeground: '0 0% 100%',
      accent: '213 70% 50%',
      accentForeground: '0 0% 100%',
      background: '214 30% 9%',
      foreground: '214 15% 91%',
      muted: '214 20% 20%',
      mutedForeground: '214 12% 62%',
      card: '214 25% 13%',
      cardForeground: '214 15% 91%',
      border: '214 18% 23%',
    }
  }
];

const BrandingTab: React.FC = () => {
  const { settings, loading, updateSetting } = useSettings();
  const { toast } = useToast();
  const { applyTheme, updateThemeColor } = useTheme();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [savedTheme, setSavedTheme] = useState<string>('default');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<Partial<ColorTheme['colors']>>({});

  useEffect(() => {
    // Check if user has a saved theme
    const savedThemeData = settings.find(s => s.key === 'active_theme');
    if (savedThemeData?.value) {
      setSelectedTheme(savedThemeData.value as string);
      setSavedTheme(savedThemeData.value as string);
    }
  }, [settings]);

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

  const handleThemePreview = (themeId: string) => {
    setSelectedTheme(themeId);
    setPreviewTheme(themeId);
    const theme = colorThemes.find(t => t.id === themeId);
    
    if (!theme) return;
    
    // Apply theme colors temporarily for preview
    applyTheme(theme.colors);
  };

  const handleSaveTheme = async () => {
    if (!selectedTheme) return;
    
    const theme = colorThemes.find(t => t.id === selectedTheme);
    if (!theme) return;

    try {
      // Save the theme ID
      await updateSetting('active_theme', selectedTheme);
      setSavedTheme(selectedTheme);
      setPreviewTheme(null);
      
      toast({
        title: 'Theme Saved',
        description: `${theme.name} theme has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save theme',
        variant: 'destructive',
      });
    }
  };

  const handleResetToDefault = async () => {
    const defaultTheme = colorThemes.find(t => t.id === 'default');
    if (!defaultTheme) return;

    try {
      // Reset to default theme
      await updateSetting('active_theme', 'default');
      setSelectedTheme('default');
      setSavedTheme('default');
      setPreviewTheme(null);
      
      // Apply default theme colors
      applyTheme(defaultTheme.colors);
      
      toast({
        title: 'Reset to Default',
        description: 'Theme has been reset to default successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset theme',
        variant: 'destructive',
      });
    }
  };


  const handleCustomColorChange = (colorKey: keyof ColorTheme['colors'], value: string) => {
    setCustomColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleSaveCustomColors = async () => {
    try {
      // Save each color individually for easier retrieval
      for (const [key, value] of Object.entries(customColors)) {
        await updateSetting(`${key}_color`, value);
      }
      
      // Also save as a combined object for backup
      await updateSetting('custom_theme_colors', customColors);
      
      // Apply theme colors using ThemeContext
      applyTheme({ ...colorThemes[0].colors, ...customColors } as ColorTheme['colors']);
      
      toast({
        title: 'Custom Colors Saved',
        description: 'Your custom color scheme has been applied instantly.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save custom colors',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        await updateSetting(key, value);
      }
      setLocalSettings({});
      
      toast({
        title: 'Settings Saved',
        description: 'Branding settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const hasChanges = Object.keys(localSettings).length > 0;
  const hasCustomColors = Object.keys(customColors).length > 0;
  const isPreviewing = previewTheme !== null && previewTheme !== savedTheme;

  return (
    <div className="space-y-6">
      {/* Theme Templates */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme Templates
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose a pre-designed color theme or customize your own
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPreviewing && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
              <div>
                <p className="font-medium text-foreground">Preview Mode</p>
                <p className="text-sm text-muted-foreground">
                  Click "Save Theme" to keep these changes
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveTheme}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Theme
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={handleResetToDefault}
              disabled={savedTheme === 'default'}
            >
              Reset to Default
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemePreview(theme.id)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedTheme === theme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-muted'
                }`}
              >
                {selectedTheme === theme.id && savedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                {selectedTheme === theme.id && savedTheme !== theme.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-muted border-2 border-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary">?</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-left">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground text-left">{theme.description}</p>
                  
                  {/* Color Preview */}
                  <div className="flex gap-1 mt-3">
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    />
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    />
                    <div 
                      className="w-8 h-8 rounded border border-border" 
                      style={{ backgroundColor: `hsl(${theme.colors.background})` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Color Overrides */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Custom Color Overrides</CardTitle>
          <CardDescription className="text-muted-foreground">
            Fine-tune individual colors to match your exact brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom_primary">Primary Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  id="custom_primary"
                  type="color"
                  value={customColors.primary ? `#${customColors.primary}` : '#5B8CFF'}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value.replace('#', ''))}
                  className="w-16 h-10 p-1 bg-background border-border"
                />
                <Input
                  value={customColors.primary || ''}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  placeholder="221 83% 53%"
                  className="bg-background border-border flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">HSL format: hue saturation% lightness%</p>
            </div>

            <div>
              <Label htmlFor="custom_accent">Accent Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  id="custom_accent"
                  type="color"
                  value={customColors.accent ? `#${customColors.accent}` : '#5B8CFF'}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value.replace('#', ''))}
                  className="w-16 h-10 p-1 bg-background border-border"
                />
                <Input
                  value={customColors.accent || ''}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  placeholder="221 83% 53%"
                  className="bg-background border-border flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom_secondary">Secondary Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  id="custom_secondary"
                  type="color"
                  value={customColors.secondary ? `#${customColors.secondary}` : '#3A4557'}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value.replace('#', ''))}
                  className="w-16 h-10 p-1 bg-background border-border"
                />
                <Input
                  value={customColors.secondary || ''}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  placeholder="217 19% 27%"
                  className="bg-background border-border flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom_background">Background Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  id="custom_background"
                  type="color"
                  value={customColors.background ? `#${customColors.background}` : '#0B0F14'}
                  onChange={(e) => handleCustomColorChange('background', e.target.value.replace('#', ''))}
                  className="w-16 h-10 p-1 bg-background border-border"
                />
                <Input
                  value={customColors.background || ''}
                  onChange={(e) => handleCustomColorChange('background', e.target.value)}
                  placeholder="218 50% 7%"
                  className="bg-background border-border flex-1"
                />
              </div>
            </div>
          </div>

          {hasCustomColors && (
            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                onClick={handleSaveCustomColors} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Apply Custom Colors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding Assets */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Branding Assets</CardTitle>
          <CardDescription className="text-muted-foreground">
            Customize your portal's brand identity and logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="brand_name">Portal Brand Name</Label>
            <Input
              id="brand_name"
              value={getSettingValue('brand_name', 'Investor Portal')}
              onChange={(e) => handleSettingChange('brand_name', e.target.value)}
              placeholder="Your Company Name"
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This name will appear in the header and throughout the portal
            </p>
          </div>

          <div>
            <Label htmlFor="brand_logo_url">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="brand_logo_url"
                value={getSettingValue('brand_logo_url', '')}
                onChange={(e) => handleSettingChange('brand_logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-background border-border"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload or provide a URL for your company logo
            </p>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Branding
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingTab;

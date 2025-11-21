import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeContextType {
  updateThemeColor: (key: string, value: string) => void;
  applyTheme: (colors: Record<string, string>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const applyTheme = (colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
  };

  const updateThemeColor = (key: string, value: string) => {
    const root = document.documentElement;
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Load active theme from settings
        const { data: themeData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'active_theme')
          .maybeSingle();

        // Load custom colors from settings
        const { data: customColorsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'custom_theme_colors')
          .maybeSingle();

        // Load brand colors from settings
        const { data: primaryColorData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'primary_color')
          .maybeSingle();

        const { data: secondaryColorData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'secondary_color')
          .maybeSingle();

        const { data: accentColorData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'accent_color')
          .maybeSingle();

        // Apply saved theme if exists
        if (themeData?.value) {
          console.log('Loading saved theme:', themeData.value);
        }

        // Apply custom colors if they exist
        const colorsToApply: Record<string, string> = {};

        if (customColorsData?.value && typeof customColorsData.value === 'object') {
          Object.assign(colorsToApply, customColorsData.value);
        }

        // Override with specific brand colors if they exist
        if (primaryColorData?.value) {
          colorsToApply.primary = primaryColorData.value as string;
        }
        if (secondaryColorData?.value) {
          colorsToApply.secondary = secondaryColorData.value as string;
        }
        if (accentColorData?.value) {
          colorsToApply.accent = accentColorData.value as string;
        }

        // Apply all colors to CSS variables
        if (Object.keys(colorsToApply).length > 0) {
          applyTheme(colorsToApply);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading theme...</div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ updateThemeColor, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

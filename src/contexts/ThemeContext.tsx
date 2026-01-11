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
        // Load active theme from settings - with timeout to prevent blocking UI
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Theme load timeout')), 3000)
        );

        const loadPromise = async () => {
          const [themeData, customColorsData, primaryColorData, secondaryColorData, accentColorData] = 
            await Promise.all([
              supabase.from('settings').select('value').eq('key', 'active_theme').maybeSingle(),
              supabase.from('settings').select('value').eq('key', 'custom_theme_colors').maybeSingle(),
              supabase.from('settings').select('value').eq('key', 'primary_color').maybeSingle(),
              supabase.from('settings').select('value').eq('key', 'secondary_color').maybeSingle(),
              supabase.from('settings').select('value').eq('key', 'accent_color').maybeSingle(),
            ]);

          // Apply saved theme if exists
          if (themeData?.data?.value) {
            console.log('Loading saved theme:', themeData.data.value);
          }

          // Apply custom colors if they exist
          const colorsToApply: Record<string, string> = {};

          if (customColorsData?.data?.value && typeof customColorsData.data.value === 'object') {
            Object.assign(colorsToApply, customColorsData.data.value);
          }

          // Override with specific brand colors if they exist
          if (primaryColorData?.data?.value) {
            colorsToApply.primary = primaryColorData.data.value as string;
          }
          if (secondaryColorData?.data?.value) {
            colorsToApply.secondary = secondaryColorData.data.value as string;
          }
          if (accentColorData?.data?.value) {
            colorsToApply.accent = accentColorData.data.value as string;
          }

          // Apply all colors to CSS variables
          if (Object.keys(colorsToApply).length > 0) {
            applyTheme(colorsToApply);
          }
        };

        await Promise.race([loadPromise(), timeoutPromise]);
      } catch (error) {
        // Log but don't block - theme loading is non-critical
        console.warn('Theme loading skipped:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Theme loading is now non-blocking - don't show loading state

  return (
    <ThemeContext.Provider value={{ updateThemeColor, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

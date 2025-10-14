import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WidgetPreviewProps {
  settings: WidgetSettings;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({ settings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeMap = {
    small: { width: 340, height: 500, button: 50 },
    medium: { width: 380, height: 600, button: 60 },
    large: { width: 420, height: 650, button: 70 }
  };

  const dimensions = sizeMap[settings.widget_size];

  return (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--muted))]/50 rounded-lg overflow-hidden">
      {/* Minimized State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "absolute transition-all duration-200 hover:scale-105",
            settings.widget_position === 'bottom-right' ? "bottom-6 right-6" : "bottom-6 left-6",
            settings.bubble_style === 'circle' ? "rounded-full" : "rounded-xl"
          )}
          style={{
            width: dimensions.button,
            height: dimensions.button,
            backgroundColor: settings.primary_color
          }}
        >
          <MessageSquare className="w-6 h-6 text-white mx-auto" />
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center bg-red-500 text-white border-2 border-white">
            3
          </Badge>
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div
          className={cn(
            "absolute bottom-6 shadow-2xl rounded-2xl overflow-hidden bg-white flex flex-col",
            settings.widget_position === 'bottom-right' ? "right-6" : "left-6"
          )}
          style={{
            width: dimensions.width,
            height: dimensions.height
          }}
        >
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: settings.primary_color }}
          >
            <div>
              <h3 className="font-semibold text-sm">{settings.widget_title}</h3>
              {settings.show_online_status && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs opacity-90">Online</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3 overflow-auto">
            {/* System Message */}
            <div className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              Today
            </div>

            {/* Greeting */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                B
              </div>
              <div className="bg-[hsl(var(--muted))] p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                <p className="text-sm">{settings.initial_greeting}</p>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 block">2:30 PM</span>
              </div>
            </div>

            {/* User Message */}
            <div className="flex items-start gap-2 justify-end">
              <div
                className="p-3 rounded-2xl rounded-tr-sm max-w-[80%]"
                style={{
                  backgroundColor: settings.primary_color + '1A',
                  borderColor: settings.primary_color + '33',
                  borderWidth: 1
                }}
              >
                <p className="text-sm">Can you tell me more about this deal?</p>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 block">2:31 PM</span>
              </div>
            </div>

            {/* Typing Indicator */}
            {settings.enable_typing_indicators && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  B
                </div>
                <div className="bg-[hsl(var(--muted))] p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={settings.placeholder_text}
                className="flex-1 px-3 py-2 bg-[hsl(var(--muted))] rounded-lg text-sm focus:outline-none"
                readOnly
              />
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: settings.primary_color }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

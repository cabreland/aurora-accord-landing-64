import React from 'react';
import { Settings, Eye, EyeOff, Building2, Activity, PieChart, Zap, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const widgetIcons = {
  deals: Building2,
  activity: Activity,
  pipeline: PieChart,
  actions: Zap,
  nda: FileText
};

import { DashboardWidget } from '@/types/dashboard';

interface WidgetCustomizerProps {
  widgets: DashboardWidget[];
  onToggleVisibility: (widgetId: string) => void;
  onReset: () => void;
}

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({ 
  widgets, 
  onToggleVisibility, 
  onReset 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Customize Widgets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#D4AF37]" />
            Dashboard Customization
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-[#F4E4BC] mb-4">Widget Visibility</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {widgets.map((widget) => (
                <WidgetToggleCard 
                  key={widget.id} 
                  widget={widget}
                  onToggle={() => onToggleVisibility(widget.id)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/20">
            <div className="text-sm text-[#F4E4BC]/60">
              {widgets.filter(w => w.visible).length} of {widgets.length} widgets visible
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface WidgetToggleCardProps {
  widget: DashboardWidget;
  onToggle: () => void;
}

const WidgetToggleCard = ({ widget, onToggle }: WidgetToggleCardProps) => {
  const IconComponent = widgetIcons[widget.type as keyof typeof widgetIcons] || Settings;
  
  return (
    <Card className={`
      transition-all duration-200 cursor-pointer
      ${widget.visible 
        ? 'bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/50' 
        : 'bg-gradient-to-b from-[#1A1F2E]/50 to-[#0A0F0F]/50 border-[#F4E4BC]/20'
      }
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg 
              ${widget.visible ? 'bg-[#D4AF37]/20' : 'bg-[#F4E4BC]/10'}
            `}>
              <IconComponent className={`
                w-5 h-5 
                ${widget.visible ? 'text-[#D4AF37]' : 'text-[#F4E4BC]/40'}
              `} />
            </div>
            <div>
              <CardTitle className={`
                text-sm font-semibold 
                ${widget.visible ? 'text-[#FAFAFA]' : 'text-[#F4E4BC]/40'}
              `}>
                {widget.title}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {widget.visible ? (
              <Eye className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <EyeOff className="w-4 h-4 text-[#F4E4BC]/40" />
            )}
            <Switch 
              checked={widget.visible} 
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={`
          text-xs 
          ${widget.visible ? 'text-[#F4E4BC]/60' : 'text-[#F4E4BC]/30'}
        `}>
          {widget.description}
        </p>
      </CardContent>
    </Card>
  );
};
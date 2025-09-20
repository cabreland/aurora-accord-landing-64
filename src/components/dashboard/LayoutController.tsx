import React from 'react';
import { Grid, List, LayoutGrid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { LayoutConfig, LAYOUT_PRESETS } from '@/types/dashboard';

interface LayoutControllerProps {
  currentLayout: LayoutConfig;
  onLayoutChange: (layout: LayoutConfig) => void;
}

const layoutIcons = {
  'auto-grid': Grid,
  'compact-grid': LayoutGrid,
  'masonry': Grid,
  'list': List
};

const layoutLabels = {
  'auto-grid': 'Auto Grid',
  'compact-grid': 'Compact Grid', 
  'masonry': 'Masonry',
  'list': 'List View'
};

export const LayoutController: React.FC<LayoutControllerProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  const currentPresetKey = Object.keys(LAYOUT_PRESETS).find(
    key => JSON.stringify(LAYOUT_PRESETS[key]) === JSON.stringify(currentLayout)
  ) || 'auto-grid';

  const CurrentIcon = layoutIcons[currentPresetKey as keyof typeof layoutIcons] || Grid;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
        >
          <CurrentIcon className="w-4 h-4 mr-2" />
          {layoutLabels[currentPresetKey as keyof typeof layoutLabels]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30">
        <div className="px-2 py-1.5 text-sm font-medium text-[#F4E4BC]">Layout Options</div>
        <Separator className="bg-[#D4AF37]/20" />
        {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => {
          const Icon = layoutIcons[key as keyof typeof layoutIcons];
          const isActive = key === currentPresetKey;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onLayoutChange(preset)}
              className={`
                flex items-center gap-3 px-3 py-2 cursor-pointer
                ${isActive 
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                  : 'text-[#F4E4BC] hover:bg-[#D4AF37]/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{layoutLabels[key as keyof typeof layoutLabels]}</span>
              {isActive && <div className="ml-auto w-2 h-2 bg-[#D4AF37] rounded-full" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
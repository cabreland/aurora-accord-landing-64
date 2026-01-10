import React, { useState } from 'react';
import { ArrowLeft, Search, FileDown, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataRoomTemplate } from '@/hooks/useDataRoom';

interface DataRoomHeaderProps {
  dealId: string;
  currentLocation: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBackToDeals: () => void;
  templates: DataRoomTemplate[];
  onApplyTemplate: (templateName: string) => Promise<boolean>;
  foldersExist: boolean;
  hideBackButton?: boolean;
}

export const DataRoomHeader: React.FC<DataRoomHeaderProps> = ({
  dealId,
  currentLocation,
  searchQuery,
  onSearchChange,
  onBackToDeals,
  templates,
  onApplyTemplate,
  foldersExist,
  hideBackButton = false,
}) => {
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const handleApplyTemplate = async (templateName: string) => {
    setApplyingTemplate(true);
    await onApplyTemplate(templateName);
    setApplyingTemplate(false);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {!hideBackButton && (
          <Button variant="ghost" size="icon" onClick={onBackToDeals}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Room</h1>
          <p className="text-muted-foreground text-sm">{currentLocation}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        {!foldersExist && templates.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={applyingTemplate}>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Apply Template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {templates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => handleApplyTemplate(template.name)}
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneItemProps {
  label: string;
  date: string | null;
  icon: string;
  canEdit?: boolean;
  onMark?: () => void;
  onDateChange?: (date: Date | null) => void;
  description?: string;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  label,
  date,
  icon,
  canEdit = false,
  onMark,
  onDateChange,
  description
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
  };

  const handleSave = () => {
    if (onDateChange && selectedDate) {
      onDateChange(selectedDate);
    }
    setIsEditing(false);
  };

  const handleClear = () => {
    if (onDateChange) {
      onDateChange(null);
    }
    setSelectedDate(undefined);
    setIsEditing(false);
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-all",
      date 
        ? "bg-primary/5 border-primary/20" 
        : "bg-muted/30 border-border/50 hover:border-border"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-lg",
          date ? "bg-primary/10" : "bg-muted"
        )}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {date ? (
          <>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-medium",
                label.includes('Closed') && "bg-green-500/20 text-green-700 dark:text-green-400"
              )}
            >
              {format(new Date(date), 'MMM d, yyyy')}
            </Badge>
            
            {canEdit && (
              <Popover open={isEditing} onOpenChange={setIsEditing}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                  <div className="flex justify-between p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClear}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        ) : (
          canEdit && onMark && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMark}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default MilestoneItem;

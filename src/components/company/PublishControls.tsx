import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Globe, Clock, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Company } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PublishControlsProps {
  company: Company;
  onUpdate: () => void;
}

const PublishControls: React.FC<PublishControlsProps> = ({ company, onUpdate }) => {
  const [isPublished, setIsPublished] = useState(company.is_published || false);
  const [publishAt, setPublishAt] = useState<Date | undefined>(
    company.publish_at ? new Date(company.publish_at) : undefined
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getPublishStatus = () => {
    if (!isPublished) {
      return { label: 'Draft', variant: 'secondary' as const, icon: EyeOff };
    }
    
    if (publishAt && publishAt > new Date()) {
      return { label: 'Scheduled', variant: 'default' as const, icon: Clock };
    }
    
    return { label: 'Live', variant: 'default' as const, icon: Globe };
  };

  const handleTogglePublish = async () => {
    setIsUpdating(true);
    try {
      const newPublishState = !isPublished;
      
      const { error } = await supabase
        .from('companies')
        .update({ 
          is_published: newPublishState,
          // Clear schedule if unpublishing
          publish_at: newPublishState ? publishAt?.toISOString() : null
        })
        .eq('id', company.id);

      if (error) throw error;

      setIsPublished(newPublishState);
      if (!newPublishState) {
        setPublishAt(undefined);
      }
      
      toast({
        title: "Success",
        description: `Company ${newPublishState ? 'published' : 'unpublished'} successfully`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSchedulePublish = async (date: Date | undefined) => {
    if (!isPublished) return; // Can only schedule if published
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          publish_at: date?.toISOString() || null
        })
        .eq('id', company.id);

      if (error) throw error;

      setPublishAt(date);
      setIsCalendarOpen(false);
      
      toast({
        title: "Success",
        description: date ? 
          `Company scheduled to publish ${format(date, 'PPP at p')}` : 
          'Publish schedule cleared - company is now live',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating publish schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update publish schedule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const status = getPublishStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Publishing Controls
          <Badge 
            variant={status.variant} 
            className={cn(
              status.label === 'Draft' && 'bg-gray-500/20 text-gray-400',
              status.label === 'Scheduled' && 'bg-amber-500/20 text-amber-400',
              status.label === 'Live' && 'bg-green-500/20 text-green-400'
            )}
          >
            {status.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Publish Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="publish-toggle" className="text-base font-medium">
              Publish Company
            </Label>
            <p className="text-sm text-muted-foreground">
              Make this company visible to investors
            </p>
          </div>
          <Switch
            id="publish-toggle"
            checked={isPublished}
            onCheckedChange={handleTogglePublish}
            disabled={isUpdating}
          />
        </div>

        {/* Schedule Controls */}
        {isPublished && (
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-base font-medium">Schedule Publishing</Label>
            <p className="text-sm text-muted-foreground">
              Optional: Set a future date when this company should become visible to investors.
              Leave empty to publish immediately.
            </p>
            
            <div className="flex items-center gap-4">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !publishAt && "text-muted-foreground"
                    )}
                    disabled={isUpdating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishAt ? format(publishAt, "PPP 'at' p") : "Publish immediately"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={publishAt}
                    onSelect={(date) => handleSchedulePublish(date)}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {publishAt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSchedulePublish(undefined)}
                  disabled={isUpdating}
                >
                  Clear Schedule
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground space-y-2">
            {status.label === 'Draft' && (
              <p>• Company is hidden from investors</p>
            )}
            {status.label === 'Scheduled' && publishAt && (
              <p>• Company will go live on {format(publishAt, 'PPP at p')}</p>
            )}
            {status.label === 'Live' && (
              <p>• Company is visible to investors now</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishControls;
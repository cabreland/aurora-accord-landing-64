import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Eye, EyeOff, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DealFormData } from './DealWizard';

interface PublishingStepProps {
  data: DealFormData;
  onChange: (updates: Partial<DealFormData>) => void;
  isValid: boolean;
}

export const PublishingStep: React.FC<PublishingStepProps> = ({
  data,
  onChange,
  isValid
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Publishing & Status</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how and when this deal will be available to investors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status">Deal Status</Label>
          <Select value={data.status} onValueChange={(value: any) => onChange({ status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div className="flex items-center">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Draft - Not visible to investors
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Active - Visible to investors
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Archived - No longer active
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {data.status === 'draft' && 'Deal will be saved but not visible to investors'}
            {data.status === 'active' && 'Deal will be immediately available to qualified investors'}
            {data.status === 'archived' && 'Deal will be moved to archived deals'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Deal Priority</Label>
          <Select value={data.priority} onValueChange={(value: any) => onChange({ priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-orange-500" />
                  High Priority
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            High priority deals appear first in investor feeds
          </p>
        </div>
      </div>

      {/* Publishing Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-muted rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="publish_immediately">Publish Immediately</Label>
            <p className="text-xs text-muted-foreground">
              Make this deal available to investors right after creation
            </p>
          </div>
          <Switch
            id="publish_immediately"
            checked={data.publish_immediately}
            onCheckedChange={(checked) => onChange({ publish_immediately: checked })}
          />
        </div>

        {!data.publish_immediately && (
          <div className="space-y-2">
            <Label>Scheduled Publish Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.scheduled_publish && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.scheduled_publish ? 
                    format(data.scheduled_publish, "PPP") : 
                    "Select date to publish"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.scheduled_publish || undefined}
                  onSelect={(date) => onChange({ scheduled_publish: date || null })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Deal will automatically become active on this date
            </p>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Publishing Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Status:</span>
            <span className={cn(
              "font-medium capitalize",
              data.status === 'active' ? 'text-green-600' : 
              data.status === 'draft' ? 'text-orange-600' : 
              'text-gray-600'
            )}>
              {data.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Priority Level:</span>
            <span className={cn(
              "font-medium capitalize",
              data.priority === 'high' ? 'text-orange-600' :
              data.priority === 'medium' ? 'text-blue-600' :
              'text-gray-600'
            )}>
              {data.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Publishing:</span>
            <span className="font-medium">
              {data.publish_immediately ? 
                'Immediate' : 
                data.scheduled_publish ? 
                  `Scheduled for ${format(data.scheduled_publish, "PPP")}` :
                  'Manual'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Status-specific notices */}
      {data.status === 'draft' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Draft Mode:</strong> This deal will be saved but not visible to investors. 
            You can edit and refine it before making it active.
          </p>
        </div>
      )}

      {data.status === 'active' && data.publish_immediately && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Ready to Publish:</strong> This deal will be immediately available to qualified investors 
            after creation.
          </p>
        </div>
      )}
    </div>
  );
};
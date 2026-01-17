import React, { useState } from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PublishDealButtonProps {
  companyName: string;
  dataRoomHealthPercentage: number;
  isPublishing: boolean;
  onPublish: () => void;
}

export const PublishDealButton: React.FC<PublishDealButtonProps> = ({
  companyName,
  dataRoomHealthPercentage,
  isPublishing,
  onPublish
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const canPublish = dataRoomHealthPercentage === 100;

  const handlePublish = () => {
    onPublish();
    setIsOpen(false);
  };

  if (!canPublish) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled
              className="gap-2 opacity-50 cursor-not-allowed"
              size="lg"
            >
              <Rocket className="h-5 w-5" />
              Publish Deal to Marketplace
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Complete data room to 100% before publishing</p>
            <p className="text-muted-foreground text-xs">
              Current: {dataRoomHealthPercentage}%
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="gap-2 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Rocket className="h-5 w-5" />
          Publish Deal to Marketplace
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Deal to Marketplace?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to publish <strong>{companyName}</strong> to the buyer marketplace? 
            This will make it visible to all qualified buyers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishDealButton;

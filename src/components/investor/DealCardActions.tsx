import React, { useState } from 'react';
import { Star, MessageSquare, Info, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useInvestorMessages } from '@/hooks/useInvestorMessages';
import { toast } from 'sonner';

interface DealCardActionsProps {
  dealId: string;
  companyName: string;
}

export const DealCardActions = ({ dealId, companyName }: DealCardActionsProps) => {
  const { isWatched, toggleWatchlist } = useWatchlist();
  const { sendMessage } = useInvestorMessages();
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(dealId);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // For now, send to a placeholder admin ID - in production, you'd fetch the broker/admin ID
    await sendMessage('placeholder-admin-id', message, dealId);
    setMessage('');
    setMessageOpen(false);
  };

  const handleRequestInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Information request sent to broker team');
  };

  const handleExpressInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Interest notification sent to broker team');
  };

  const handleScheduleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Call scheduling request sent to broker team');
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#D4AF37]/20">
      {/* Star/Watchlist Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStarClick}
        className="text-[#D4AF37] hover:text-[#F4E4BC] hover:bg-[#D4AF37]/10"
      >
        <Star className={`w-4 h-4 ${isWatched(dealId) ? 'fill-[#D4AF37]' : ''}`} />
      </Button>

      {/* Ask Question Button */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="text-[#F4E4BC] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Ask
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1A1F2E] border-[#D4AF37]/30">
          <DialogHeader>
            <DialogTitle className="text-[#FAFAFA]">Ask About {companyName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What would you like to know?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-[#2A2F3A] border-[#D4AF37]/20 text-[#FAFAFA]"
              rows={4}
            />
            <Button
              onClick={handleSendMessage}
              className="w-full bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#F4E4BC]"
            >
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request More Info */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRequestInfo}
        className="text-[#F4E4BC] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
      >
        <Info className="w-4 h-4 mr-1" />
        Info
      </Button>

      {/* Express Interest */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExpressInterest}
        className="text-[#F4E4BC] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
      >
        <Heart className="w-4 h-4 mr-1" />
        Interest
      </Button>

      {/* Schedule Call */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScheduleCall}
        className="text-[#F4E4BC] hover:text-[#F28C38] hover:bg-[#F28C38]/10"
      >
        <Calendar className="w-4 h-4 mr-1" />
        Call
      </Button>
    </div>
  );
};

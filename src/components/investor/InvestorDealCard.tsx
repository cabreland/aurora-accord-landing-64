import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Info, Heart, Calendar } from 'lucide-react';
import { getIndustryCategory } from '@/lib/industry-categories';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useInvestorMessages } from '@/hooks/useInvestorMessages';
import { toast } from 'sonner';
import { useState } from 'react';

interface InvestorDealCardProps {
  deal: {
    id: string;
    companyName: string;
    industry: string;
    description: string;
    revenue: string;
    ebitda: string;
    asking_price?: string;
  };
  onClick: () => void;
  isSelected?: boolean;
}

export const InvestorDealCard: React.FC<InvestorDealCardProps> = ({
  deal,
  onClick,
  isSelected = false,
}) => {
  const { isWatched, toggleWatchlist } = useWatchlist();
  const { sendMessage } = useInvestorMessages();
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const industryCategory = getIndustryCategory(deal.industry);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(deal.id);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    await sendMessage('placeholder-admin-id', message, deal.id);
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

  const formatFinancial = (value: string | undefined) => {
    if (!value) return 'Not disclosed';
    if (value.startsWith('$') || value.startsWith('USD')) return value;
    return `$${value}`;
  };

  const truncateDescription = (text: string, lines: number = 3) => {
    const maxLength = lines * 60; // Approximate 60 chars per line
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={cn(
        "relative w-[400px] bg-[hsl(var(--portal-card))] border rounded-lg p-6 transition-all duration-200 cursor-pointer",
        "hover:border-[hsl(var(--primary))] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
        isSelected ? "border-[hsl(var(--primary))] shadow-[0_0_20px_rgba(212,175,55,0.15)]" : "border-[hsl(var(--primary))]/30"
      )}
      onClick={onClick}
    >
      {/* Star Icon - Top Right */}
      <button
        onClick={handleStarClick}
        className="absolute top-4 right-4 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors"
      >
        <Star className={cn("w-5 h-5", isWatched(deal.id) && "fill-[hsl(var(--primary))]")} />
      </button>

      {/* Industry Badge - Top Left */}
      <div className="mb-3">
        <Badge 
          className="text-xs px-3 py-1 font-medium border-0"
          style={{
            color: industryCategory.color,
            backgroundColor: industryCategory.bgColor
          }}
        >
          {deal.industry || 'Digital Business'}
        </Badge>
      </div>

      {/* Company Name */}
      <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-3 pr-8">
        {deal.companyName}
      </h3>

      {/* Description */}
      <p className="text-sm text-[hsl(var(--text-primary))]/70 mb-6 leading-relaxed line-clamp-3">
        {truncateDescription(deal.description || 'No description available')}
      </p>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[hsl(var(--primary))]/20">
        <div>
          <div className="text-xs text-[hsl(var(--text-primary))]/60 mb-1">TTM Revenue</div>
          <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            {formatFinancial(deal.revenue)}
          </div>
        </div>
        <div>
          <div className="text-xs text-[hsl(var(--text-primary))]/60 mb-1">TTM Profit</div>
          <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            {formatFinancial(deal.ebitda)}
          </div>
        </div>
        <div>
          <div className="text-xs text-[hsl(var(--text-primary))]/60 mb-1">Asking Price</div>
          <div className="text-sm font-semibold text-[hsl(var(--primary))]">
            {formatFinancial(deal.asking_price)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Ask Question Button */}
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Ask
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/30">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--text-primary))]">
                Ask About {deal.companyName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What would you like to know?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                rows={4}
              />
              <Button
                onClick={handleSendMessage}
                className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
              >
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Info */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRequestInfo}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        >
          <Info className="w-4 h-4 mr-1" />
          Info
        </Button>

        {/* Express Interest */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpressInterest}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
        >
          <Heart className="w-4 h-4 mr-1" />
          Interest
        </Button>

        {/* Schedule Call */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleScheduleCall}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#F28C38] hover:bg-[#F28C38]/10"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Call
        </Button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Info, Heart, Calendar } from 'lucide-react';
import { getIndustryCategory } from '@/lib/industry-categories';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useChatWidget } from '@/contexts/ChatWidgetContext';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { RequestInfoModal } from '@/components/chat/RequestInfoModal';
import { ScheduleCallModal } from '@/components/chat/ScheduleCallModal';

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
  const { openWidget, setDealContext } = useChatWidget();
  const { settings } = useWidgetSettings();
  const industryCategory = getIndustryCategory(deal.industry);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [buttonLabels, setButtonLabels] = useState({
    ask: 'Ask',
    info: 'Info',
    interest: 'Interest',
    call: 'Call'
  });

  useEffect(() => {
    if (settings) {
      setButtonLabels({
        ask: settings.ask_button_label,
        info: settings.info_button_label,
        interest: settings.interest_button_label,
        call: settings.call_button_label
      });
    }
  }, [settings]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(deal.id);
  };

  const handleAsk = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDealContext({ id: deal.id, name: deal.companyName });
    await openWidget(deal.id, deal.companyName);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfoModal(true);
  };

  const handleInterest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to continue');
        return;
      }

      const { error } = await supabase
        .from('deal_interests' as any)
        .insert({
          deal_id: deal.id,
          investor_id: user.id
        } as any);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.info('You have already expressed interest in this deal');
        } else {
          throw error;
        }
      } else {
        toast.success('Interest expressed. A broker will contact you shortly.');
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast.error('Failed to express interest');
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCallModal(true);
  };

  const formatFinancial = (value: string | undefined) => {
    if (!value) return 'Not disclosed';
    if (value.startsWith('$') || value.startsWith('USD')) return value;
    return `$${value}`;
  };

  const truncateDescription = (text: string, lines: number = 3) => {
    const maxLength = lines * 60;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAsk}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          {buttonLabels.ask}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleInfo}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        >
          <Info className="w-4 h-4 mr-1" />
          {buttonLabels.info}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleInterest}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
        >
          <Heart className="w-4 h-4 mr-1" />
          {buttonLabels.interest}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#F28C38] hover:bg-[#F28C38]/10"
        >
          <Calendar className="w-4 h-4 mr-1" />
          {buttonLabels.call}
        </Button>
      </div>
      </div>

      {/* Modals - Outside card to prevent click bubbling */}
      <RequestInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        dealId={deal.id}
        dealName={deal.companyName}
      />
      
      <ScheduleCallModal
        open={showCallModal}
        onOpenChange={setShowCallModal}
        dealId={deal.id}
        dealName={deal.companyName}
      />
    </>
  );
};

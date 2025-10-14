import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Info, Heart, Calendar } from 'lucide-react';
import { getIndustryCategory } from '@/lib/industry-categories';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const industryCategory = getIndustryCategory(deal.industry);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(deal.id);
  };

  const handleDealInteraction = async (e: React.MouseEvent, actionType: string) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to continue');
        return;
      }

      // Check if conversation already exists for this investor + deal
      const { data: existing } = await supabase
        .from('conversations' as any)
        .select('id')
        .eq('investor_id', user.id)
        .eq('deal_id', deal.id)
        .maybeSingle();

      if (existing) {
        // Navigate to existing conversation
        navigate(`/investor-portal/messages/${(existing as any).id}`);
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations' as any)
          .insert({
            investor_id: user.id,
            deal_id: deal.id,
            deal_name: deal.companyName,
            subject: `${deal.companyName} - ${getActionLabel(actionType)}`,
            channel: 'platform',
            status: 'active',
            unread_count_broker: 1
          } as any)
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          toast.error('Failed to create conversation');
          return;
        }

        // Create initial message
        const initialMessage = getInitialMessage(actionType);

        await supabase
          .from('conversation_messages' as any)
          .insert({
            conversation_id: (newConv as any).id,
            sender_id: user.id,
            sender_type: 'investor',
            message_type: actionType,
            message_text: initialMessage
          } as any);

        // Navigate to new conversation
        navigate(`/investor-portal/messages/${(newConv as any).id}`);
      }
    } catch (error: any) {
      console.error('Error handling deal interaction:', error);
      toast.error('Something went wrong');
    }
  };

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      question: 'Question',
      info_request: 'Information Request',
      interest: 'Interest Expressed',
      call_request: 'Call Request'
    };
    return labels[actionType] || 'Inquiry';
  };

  const getInitialMessage = (actionType: string): string => {
    const messages: Record<string, string> = {
      question: '', // Empty for user to type their question
      info_request: 'I would like to request additional information about this opportunity.',
      interest: 'I am interested in learning more about this acquisition opportunity and would like to discuss next steps.',
      call_request: 'I would like to schedule a call to discuss this opportunity. Please let me know your availability.'
    };
    return messages[actionType] || '';
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDealInteraction(e, 'question')}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Ask
        </Button>

        {/* Request Info */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDealInteraction(e, 'info_request')}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        >
          <Info className="w-4 h-4 mr-1" />
          Info
        </Button>

        {/* Express Interest */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDealInteraction(e, 'interest')}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
        >
          <Heart className="w-4 h-4 mr-1" />
          Interest
        </Button>

        {/* Schedule Call */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDealInteraction(e, 'call_request')}
          className="flex-1 text-[hsl(var(--text-primary))] hover:text-[#F28C38] hover:bg-[#F28C38]/10"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Call
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { User, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ProfileHeaderProps {
  fullName: string;
  buyerType: string;
  memberSince: string;
  onEditClick: () => void;
}

const buyerTypeLabels: Record<string, string> = {
  'individual': 'Individual Investor',
  'family-office': 'Family Office',
  'pe-firm': 'Private Equity Firm',
  'vc-firm': 'Venture Capital Firm',
  'search-fund': 'Search Fund',
  'strategic': 'Strategic Buyer',
  'investment-group': 'Investment Group',
  'other': 'Other',
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fullName,
  buyerType,
  memberSince,
  onEditClick,
}) => {
  const formattedDate = memberSince 
    ? format(new Date(memberSince), 'MMMM yyyy')
    : 'N/A';

  return (
    <div className="relative">
      {/* Background Banner */}
      <div className="h-32 bg-gradient-to-r from-[hsl(var(--primary))]/20 via-[hsl(var(--primary))]/10 to-transparent rounded-t-xl" />
      
      {/* Profile Content */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 flex items-center justify-center border-4 border-background shadow-xl">
            <User className="w-12 h-12 text-[hsl(var(--primary-foreground))]" />
          </div>
          
          {/* Info */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold text-foreground">
              {fullName || 'Investor'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {buyerType && (
                <Badge variant="secondary" className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20">
                  {buyerTypeLabels[buyerType] || buyerType}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Member since {formattedDate}
              </span>
            </div>
          </div>
          
          {/* Edit Button */}
          <Button 
            onClick={onEditClick}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

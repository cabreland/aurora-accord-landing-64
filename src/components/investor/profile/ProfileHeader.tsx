import React, { useState } from 'react';
import { Edit, Calendar, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ProfilePictureUploader } from './ProfilePictureUploader';

interface ProfileHeaderProps {
  fullName: string;
  buyerType: string;
  memberSince: string;
  profilePictureUrl?: string | null;
  userId?: string;
  onEditClick: () => void;
  onPictureUpdated?: (newUrl: string | null) => void;
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

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fullName,
  buyerType,
  memberSince,
  profilePictureUrl,
  userId,
  onEditClick,
  onPictureUpdated,
}) => {
  const [showUploader, setShowUploader] = useState(false);
  
  const formattedDate = memberSince 
    ? format(new Date(memberSince), 'MMMM yyyy')
    : 'N/A';

  const handlePictureClick = () => {
    if (userId && onPictureUpdated) {
      setShowUploader(true);
    }
  };

  return (
    <div className="relative">
      {/* Background Banner */}
      <div className="h-32 bg-gradient-to-r from-[hsl(var(--primary))]/20 via-[hsl(var(--primary))]/10 to-transparent rounded-t-xl" />
      
      {/* Profile Content */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
          {/* Avatar */}
          <button
            type="button"
            onClick={handlePictureClick}
            disabled={!userId || !onPictureUpdated}
            className="relative group w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-default"
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={fullName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 flex items-center justify-center">
                <span className="text-2xl font-bold text-[hsl(var(--primary-foreground))]">
                  {getInitials(fullName)}
                </span>
              </div>
            )}
            
            {/* Hover Overlay */}
            {userId && onPictureUpdated && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </button>
          
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

      {/* Profile Picture Uploader Modal */}
      {userId && onPictureUpdated && (
        <ProfilePictureUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          currentPictureUrl={profilePictureUrl || null}
          userId={userId}
          onPictureUpdated={onPictureUpdated}
        />
      )}
    </div>
  );
};

import React from 'react';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface ReviewersCellProps {
  reviewerIds: string[];
  onAddReviewers?: () => void;
}

const ReviewersCell: React.FC<ReviewersCellProps> = ({ reviewerIds, onAddReviewers }) => {
  const { data: teamMembers = [] } = useTeamMembers();
  
  const reviewers = reviewerIds
    .map(id => teamMembers.find(m => m.user_id === id))
    .filter((m): m is (typeof teamMembers)[number] => m !== undefined);

  if (reviewers.length === 0) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddReviewers?.();
        }}
        className="text-gray-400 hover:text-gray-500 p-1 rounded transition-colors"
      >
        <Users className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="flex items-center gap-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onAddReviewers?.();
          }}
        >
          <div className="flex -space-x-1.5">
            {reviewers.slice(0, 3).map((reviewer) => (
              <Avatar key={reviewer.user_id} className="h-5 w-5 border border-white ring-1 ring-gray-100">
                <AvatarImage src={reviewer.profile_picture_url || undefined} />
                <AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-700 font-medium">
                  {reviewer.first_name?.[0]}{reviewer.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {reviewers.length > 3 && (
            <span className="text-[10px] text-gray-500 font-medium ml-0.5">
              +{reviewers.length - 3}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-900 text-white">
        <div className="text-xs font-medium mb-1">Reviewers</div>
        <div className="text-xs space-y-0.5">
          {reviewers.map(r => (
            <div key={r.user_id} className="text-gray-300">
              {r.first_name} {r.last_name}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ReviewersCell;

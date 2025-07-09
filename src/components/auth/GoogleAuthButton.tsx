import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface GoogleAuthButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const GoogleAuthButton = ({ onClick, loading }: GoogleAuthButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      variant="outline"
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 font-medium py-3"
    >
      <Mail className="mr-2 h-5 w-5" />
      Continue with Google
    </Button>
  );
};
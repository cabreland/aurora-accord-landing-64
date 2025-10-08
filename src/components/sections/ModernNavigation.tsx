import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModernNavigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-[#0A0F0F]/95 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">EX</span>
            </div>
            <span className="text-white font-bold text-xl">EXIT</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button className="text-gray-300 hover:text-white transition-colors">
              Products
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              Buy
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              Sell
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              FAQ
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-black font-semibold rounded-full"
            >
              Book a Call
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavigation;

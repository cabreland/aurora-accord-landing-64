import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ChevronDown, 
  BarChart3, FileSearch, Lock, GitMerge,
  Users, Building2, Briefcase, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DropdownItem {
  icon: React.ElementType;
  label: string;
  description: string;
}

const CleanNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const productsItems: DropdownItem[] = [
    { icon: BarChart3, label: 'Pipeline', description: 'Manage your deal flow' },
    { icon: FileSearch, label: 'Diligence', description: 'Track due diligence' },
    { icon: Lock, label: 'Data Room', description: 'Secure document sharing' },
    { icon: GitMerge, label: 'Integration', description: 'Post-close management' },
  ];

  const solutionsItems: DropdownItem[] = [
    { icon: Users, label: 'For Brokers', description: 'Streamline your process' },
    { icon: Building2, label: 'For Advisors', description: 'Advisory tools' },
    { icon: Briefcase, label: 'For M&A Firms', description: 'Enterprise solutions' },
    { icon: Layers, label: 'Roll-ups', description: 'Multi-deal management' },
  ];

  const renderDropdown = (items: DropdownItem[]) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2 rounded-xl bg-[#1a2744] shadow-xl border border-white/10"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href="#"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
            <item.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{item.label}</div>
            <div className="text-xs text-white/50">{item.description}</div>
          </div>
        </a>
      ))}
    </motion.div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">DealFlow</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Products Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                Products
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'products' && renderDropdown(productsItems)}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                Solutions
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'solutions' && renderDropdown(solutionsItems)}
              </AnimatePresence>
            </div>

            {/* Static Links */}
            <a href="#customers" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Customers
            </a>
            <a href="#resources" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Resources
            </a>
            <a href="#pricing" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-4">
                Request a demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CleanNavigation;

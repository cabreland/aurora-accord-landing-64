import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ArrowRight, ChevronDown, 
  BarChart3, FileSearch, Lock, GitMerge,
  Users, Building2, Briefcase, Layers,
  BookOpen, HelpCircle, Code, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DropdownItem {
  icon: React.ElementType;
  label: string;
  description: string;
}

interface DropdownMenu {
  label: string;
  items: DropdownItem[];
}

const EnhancedNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdowns: Record<string, DropdownMenu> = {
    products: {
      label: 'Products',
      items: [
        { icon: BarChart3, label: 'Pipeline', description: 'Manage your deal flow' },
        { icon: FileSearch, label: 'Diligence', description: 'Track due diligence' },
        { icon: Lock, label: 'Data Room', description: 'Secure document sharing' },
        { icon: GitMerge, label: 'Integration', description: 'Post-close management' },
      ]
    },
    solutions: {
      label: 'Solutions',
      items: [
        { icon: Users, label: 'For Brokers', description: 'Streamline your process' },
        { icon: Building2, label: 'For Advisors', description: 'Advisory tools' },
        { icon: Briefcase, label: 'For M&A Firms', description: 'Enterprise solutions' },
        { icon: Layers, label: 'Roll-ups', description: 'Multi-deal management' },
      ]
    },
    resources: {
      label: 'Resources',
      items: [
        { icon: BookOpen, label: 'Blog', description: 'Industry insights' },
        { icon: FileText, label: 'Case Studies', description: 'Success stories' },
        { icon: HelpCircle, label: 'Help Center', description: 'Support & guides' },
        { icon: Code, label: 'API Docs', description: 'Developer resources' },
      ]
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0C10]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0A0C10]" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">DealFlow</span>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {/* Dropdown Menus */}
            {Object.entries(dropdowns).map(([key, menu]) => (
              <div 
                key={key}
                className="relative"
                onMouseEnter={() => setActiveDropdown(key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors group">
                  {menu.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-[#1a1d24] border border-white/[0.08] shadow-2xl"
                    >
                      {menu.items.map((item) => (
                        <a
                          key={item.label}
                          href="#"
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.05] transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                            <item.icon className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{item.label}</div>
                            <div className="text-xs text-white/50">{item.description}</div>
                          </div>
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Standalone Links */}
            <a href="#features" className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors group">
              Features
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
            <a href="#comparison" className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors group">
              Why DealFlow
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
            <a href="#testimonials" className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors group">
              Testimonials
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
            <a href="#pricing" className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors group">
              Pricing
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/[0.05]">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0C10] hover:opacity-90 font-medium">
                Request Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EnhancedNavigation;

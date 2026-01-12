import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CleanNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dropdowns: Record<string, { label: string; items: { title: string; description: string }[] }> = {
    products: {
      label: 'Products',
      items: [
        { title: 'DealFlow Pipeline', description: 'End-to-end deal management' },
        { title: 'DealFlow Diligence', description: 'Due diligence tracking' },
        { title: 'DealFlow Integration', description: 'Post-close integration' },
      ],
    },
    solutions: {
      label: 'Solutions',
      items: [
        { title: 'For PE Firms', description: 'Portfolio company management' },
        { title: 'For Corporates', description: 'Strategic acquisitions' },
        { title: 'For Investment Banks', description: 'Deal advisory tools' },
      ],
    },
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0C10]/90 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Shield className="w-5 h-5 text-[#0A0C10]" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">DealFlow</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {Object.entries(dropdowns).map(([key, dropdown]) => (
              <div key={key} className="relative" onMouseEnter={() => setActiveDropdown(key)} onMouseLeave={() => setActiveDropdown(null)}>
                <button className="flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
                  {dropdown.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute top-full left-0 mt-2 w-72 bg-[#0D1117]/95 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-2xl p-2">
                      {dropdown.items.map((item) => (
                        <Link key={item.title} to="/auth" className="flex flex-col p-3 rounded-lg hover:bg-white/[0.04] transition-colors group">
                          <span className="text-sm font-medium text-white group-hover:text-[#D4AF37]">{item.title}</span>
                          <span className="text-xs text-white/40 mt-0.5">{item.description}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link to="#" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link to="#" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Resources</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/[0.04] text-sm">Sign in</Button></Link>
            <Link to="/auth"><Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-[#0A0C10] font-medium text-sm shadow-lg shadow-[#D4AF37]/20">Get started<ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CleanNavigation;

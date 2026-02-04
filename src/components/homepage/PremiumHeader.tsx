import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ntpLogoFull from '@/assets/ntp-logo-full.png';

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Next Tier', href: '#decision-path' },
  { label: 'FAQ', href: '#faq' },
];

const PremiumHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out
          ${isScrolled 
            ? 'py-3' 
            : 'py-4'
          }
        `}
      >
        {/* Solid black background */}
        <div 
          className={`
            absolute inset-0 
            bg-[#0A0C10]
            border-b border-[#D4AF37]/10
            transition-all duration-500
            ${isScrolled 
              ? 'shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
              : ''
            }
          `}
        />
        
        {/* Gold accent line at bottom */}
        <div 
          className={`
            absolute bottom-0 left-0 right-0 h-[1px]
            bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent
            transition-opacity duration-500
            ${isScrolled ? 'opacity-100' : 'opacity-60'}
          `}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a 
              href="#"
              className="relative z-10 flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={ntpLogoFull} 
                alt="Next Tier Partners" 
                className="h-16 md:h-20 w-auto object-contain"
              />
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <NavLink key={item.label} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <ApplyButton />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-10 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};

// NavLink with gold underline animation
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a
      href={href}
      className="relative group py-2"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <span className="text-[15px] font-medium text-white/60 group-hover:text-white transition-colors duration-300 tracking-[-0.01em]">
        {children}
      </span>
      
      {/* Gold underline animation */}
      <span 
        className="
          absolute bottom-0 left-0 w-full h-[2px]
          bg-gradient-to-r from-[#D4AF37] to-[#F5D67A]
          transform origin-left scale-x-0 
          group-hover:scale-x-100
          transition-transform duration-300 ease-out
        "
      />
    </a>
  );
};

// Premium Apply Button with gold gradient and glow
const ApplyButton = () => {
  return (
    <motion.a
      href="#apply"
      className="
        relative inline-flex items-center justify-center
        px-6 py-2.5
        text-[15px] font-semibold
        text-[#0A0C10]
        bg-gradient-to-r from-[#D4AF37] to-[#F5D67A]
        rounded-lg
        overflow-hidden
        shadow-[0_0_20px_rgba(212,175,55,0.3)]
        transition-all duration-300
        hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]
      "
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect on hover */}
      <span 
        className="
          absolute inset-0 
          bg-gradient-to-r from-transparent via-white/25 to-transparent
          transform -translate-x-full
          hover:translate-x-full
          transition-transform duration-700
        "
      />
      
      <span className="relative z-10 tracking-[-0.01em]">Apply Now</span>
    </motion.a>
  );
};

// Mobile Menu
const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <motion.div
      initial={false}
      animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: '100%' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        fixed inset-0 z-40 md:hidden
        ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-[#0A0C10]/95 backdrop-blur-[20px]"
        initial={false}
        animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
        onClick={onClose}
      />

      {/* Menu Content */}
      <motion.div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0A0C10] border-l border-[rgba(212,175,55,0.2)]"
        initial={false}
        animate={isOpen ? { x: 0 } : { x: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pt-24 px-8">
          <nav className="space-y-6">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="block text-2xl font-medium text-white/70 hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                initial={{ opacity: 0, x: 20 }}
                animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: isOpen ? 0.1 + index * 0.05 : 0 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <motion.div 
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: isOpen ? 0.3 : 0 }}
          >
            <a
              href="#apply"
              onClick={onClose}
              className="
                inline-flex items-center justify-center
                w-full px-8 py-4
                text-lg font-semibold
                text-[#0A0C10]
                bg-gradient-to-r from-[#D4AF37] to-[#F5D67A]
                rounded-lg
                shadow-[0_0_30px_rgba(212,175,55,0.4)]
              "
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Apply Now
            </a>
          </motion.div>

          {/* Gold accent decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumHeader;

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Linkedin, Twitter, Youtube, Mail } from 'lucide-react';

const CleanFooter = () => {
  const footerLinks = {
    Product: ['Features', 'Integrations', 'Pricing', 'Changelog'],
    Solutions: ['For PE Firms', 'For Corporates', 'For Investment Banks'],
    Resources: ['Documentation', 'Blog', 'Case Studies', 'Webinars'],
    Company: ['About', 'Careers', 'Press', 'Contact'],
  };

  return (
    <footer className="relative bg-[#0A0C10] border-t border-white/[0.06]">
      <div className="absolute top-0 left-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-6 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center"><Shield className="w-5 h-5 text-[#0A0C10]" /></div>
              <span className="text-lg font-semibold text-white">DealFlow</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">The modern M&A platform for deal management, due diligence, and post-close integration.</p>
            <div className="flex items-center gap-3">
              {[Linkedin, Twitter, Youtube, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"><Icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">{links.map((link) => <li key={link}><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">{link}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">© {new Date().getFullYear()} DealFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/30 hover:text-white/50">Privacy Policy</a>
            <a href="#" className="text-sm text-white/30 hover:text-white/50">Terms of Service</a>
            <a href="#" className="text-sm text-white/30 hover:text-white/50">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CleanFooter;

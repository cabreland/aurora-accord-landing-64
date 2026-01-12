import React from 'react';
import { Shield, Linkedin, Twitter, Youtube } from 'lucide-react';

const footerSections = [
  {
    title: 'Products',
    links: [
      'Pipeline Management',
      'Due Diligence Software',
      'Data Room Platform',
      'Integration Management',
      'Deal Flow Software',
    ],
  },
  {
    title: 'Solutions',
    links: [
      'For Brokers',
      'For Advisors',
      'For M&A Firms',
      'Roll-up Acquisitions',
    ],
  },
  {
    title: 'Company',
    links: [
      'About Us',
      'Pricing',
      'Case Studies',
      'Contact Sales',
      'Careers',
    ],
  },
  {
    title: 'Resources',
    links: [
      'Blog',
      'Help Center',
      'API Documentation',
      'M&A Playbook',
      'Templates & Checklists',
    ],
  },
  {
    title: 'Legal',
    links: [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
      'Security',
    ],
  },
];

const EnhancedFooter = () => {
  return (
    <footer className="bg-[#0A0C10] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0A0C10]" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">DealFlow</span>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              The modern platform for M&A professionals. Secure, efficient, and built for scale.
            </p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-sm text-white/50 hover:text-[#D4AF37] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2024 DealFlow. All rights reserved.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
              >
                <Linkedin className="w-5 h-5 text-white/60 hover:text-[#D4AF37]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
              >
                <Twitter className="w-5 h-5 text-white/60 hover:text-[#D4AF37]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
              >
                <Youtube className="w-5 h-5 text-white/60 hover:text-[#D4AF37]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;

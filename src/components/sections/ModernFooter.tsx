import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const ModernFooter = () => {
  const sections = [
    {
      title: "Exit",
      links: ["About Us", "How It Works", "Success Stories", "Contact"]
    },
    {
      title: "For Sellers",
      links: ["Sell Your Business", "Valuation", "Preparation Guide", "Resources"]
    },
    {
      title: "For Buyers",
      links: ["Browse Listings", "Due Diligence", "Financing Options", "Buyer Guide"]
    },
    {
      title: "Support",
      links: ["Help Center", "FAQ", "Documentation", "Terms of Service"]
    },
    {
      title: "Connect",
      links: ["Blog", "Newsletter", "Events", "Partners"]
    }
  ];

  return (
    <footer className="bg-[#0A0F0F] border-t border-gray-800 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">EX</span>
              </div>
              <span className="text-white font-bold text-xl">EXIT</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Sell your digital business in 60 days or less for no upfront cost.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 EXIT. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;

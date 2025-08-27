import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, User, Settings, DollarSign } from 'lucide-react';

const ProcessFlow = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-white text-center mb-20">
          Fast, safe, and easy
        </h2>
        
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
          
          {/* Sellers Column */}
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Sellers</h3>
            <p className="text-gray-300 mb-8">
              Maximize your exit with expert help from our team.
            </p>
            
            {/* Seller Cards */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-gray-400" />
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                <p className="text-white text-sm text-left">
                  Your startup listing is almost ready to go live! Last step is the asking price...
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                  <p className="text-white text-sm">Cool, here you go...</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center - Brokers with Arrows */}
          <div className="relative text-center">
            {/* Arrow pointing right (hidden on mobile) */}
            <ArrowRight className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-8 h-8 text-yellow-500 hidden lg:block" />
            
            {/* Hexagon Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 border-2 border-gray-600 rounded-2xl mb-6 mx-auto">
              <div className="w-12 h-12 border-2 border-white transform rotate-45"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6">
              Exclusive<br />Business<br />Brokers
            </h3>
            
            {/* Service Cards */}
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg px-6 py-3 border border-gray-700">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Expert Tooling</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg px-6 py-3 border border-gray-700">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-white">World-class support</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg px-6 py-3 border border-gray-700">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Escrow & Financing</span>
                </div>
              </div>
            </div>
            
            {/* Arrow pointing left (hidden on mobile) */}
            <ArrowLeft className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-8 h-8 text-yellow-500 hidden lg:block" />
          </div>
          
          {/* Buyers Column */}
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Buyers</h3>
            <p className="text-gray-300 mb-8">
              Find your ideal startup and make an offer in minutes.
            </p>
            
            {/* My Deals Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-white font-semibold mb-4 text-left">My Deals</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                  <span className="text-white text-sm">Cool SaaS</span>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span className="text-white text-sm">Rare Ecommerce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-16">
          <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-12 py-4 text-lg rounded-full shadow-lg">
            Apply to Sell →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;
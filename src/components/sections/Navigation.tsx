
import React from 'react';

const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-[#FFC107] text-black z-50 px-6 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-bold text-lg">M&A Automation Strategy</div>
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Overview</button>
          <button onClick={() => document.getElementById('phases')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Phases</button>
          <button onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Metrics</button>
          <button onClick={() => document.getElementById('investment')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline">Investment</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

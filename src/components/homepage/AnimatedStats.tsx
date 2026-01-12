import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  icon: React.ElementType;
}

const stats: Stat[] = [
  { value: 500, suffix: '+', label: 'Deals Closed', icon: BarChart3 },
  { value: 2.5, suffix: 'B+', prefix: '$', label: 'Transaction Volume', icon: TrendingUp },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', icon: Zap },
  { value: 50, suffix: '%', label: 'Faster Closings', icon: Clock },
];

const AnimatedCounter = ({ value, suffix, prefix = '', isInView }: { value: number; suffix: string; prefix?: string; isInView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const displayValue = value % 1 === 0 ? Math.floor(count) : count.toFixed(1);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
};

const AnimatedStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-16 bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#D4AF37]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#D4AF37] bg-clip-text text-transparent animate-pulse">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix} 
                      prefix={stat.prefix}
                      isInView={isInView} 
                    />
                  </span>
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;

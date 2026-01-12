import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, Globe } from 'lucide-react';

const badges = [
  { icon: Shield, label: 'SOC 2 Certified' },
  { icon: Lock, label: '256-bit Encryption' },
  { icon: Clock, label: '99.9% Uptime SLA' },
  { icon: Globe, label: 'GDPR Compliant' },
];

const TrustBadges = () => {
  return (
    <section className="relative py-12 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors"
            >
              <badge.icon className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-medium text-white/80">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;

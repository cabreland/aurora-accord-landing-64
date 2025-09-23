export interface IndustryCategory {
  key: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const digitalBusinessCategories: Record<string, IndustryCategory> = {
  saas: {
    key: 'saas',
    label: 'SaaS',
    description: 'Software as a Service, cloud platforms, B2B tools',
    color: 'hsl(217, 91%, 65%)', // Blue
    bgColor: 'hsl(217, 91%, 65% / 0.1)',
    borderColor: 'hsl(217, 91%, 65% / 0.3)'
  },
  ecommerce: {
    key: 'ecommerce',
    label: 'E-commerce',
    description: 'Online retail, marketplace, dropshipping, DTC brands',
    color: 'hsl(142, 76%, 36%)', // Green
    bgColor: 'hsl(142, 76%, 36% / 0.1)',
    borderColor: 'hsl(142, 76%, 36% / 0.3)'
  },
  'digital-agency': {
    key: 'digital-agency',
    label: 'Digital Agency',
    description: 'Marketing agencies, web development, SEO, PPC',
    color: 'hsl(262, 83%, 58%)', // Purple
    bgColor: 'hsl(262, 83%, 58% / 0.1)',
    borderColor: 'hsl(262, 83%, 58% / 0.3)'
  },
  'content-media': {
    key: 'content-media',
    label: 'Content & Media',
    description: 'Blogs, YouTube channels, podcasts, newsletters',
    color: 'hsl(346, 87%, 43%)', // Pink/Red
    bgColor: 'hsl(346, 87%, 43% / 0.1)',
    borderColor: 'hsl(346, 87%, 43% / 0.3)'
  },
  edtech: {
    key: 'edtech',
    label: 'EdTech',
    description: 'Online education, courses, learning platforms',
    color: 'hsl(32, 95%, 44%)', // Orange
    bgColor: 'hsl(32, 95%, 44% / 0.1)',
    borderColor: 'hsl(32, 95%, 44% / 0.3)'
  },
  fintech: {
    key: 'fintech',
    label: 'FinTech',
    description: 'Financial software, payment processing, crypto',
    color: 'hsl(43, 96%, 56%)', // Gold/Yellow
    bgColor: 'hsl(43, 96%, 56% / 0.1)',
    borderColor: 'hsl(43, 96%, 56% / 0.3)'
  },
  healthtech: {
    key: 'healthtech',
    label: 'HealthTech',
    description: 'Telemedicine, health apps, wellness platforms',
    color: 'hsl(168, 76%, 42%)', // Teal
    bgColor: 'hsl(168, 76%, 42% / 0.1)',
    borderColor: 'hsl(168, 76%, 42% / 0.3)'
  },
  martech: {
    key: 'martech',
    label: 'MarTech',
    description: 'Marketing tools, automation, analytics',
    color: 'hsl(291, 64%, 42%)', // Deep Purple
    bgColor: 'hsl(291, 64%, 42% / 0.1)',
    borderColor: 'hsl(291, 64%, 42% / 0.3)'
  },
  'mobile-apps': {
    key: 'mobile-apps',
    label: 'Mobile Apps',
    description: 'iOS/Android applications, app portfolios',
    color: 'hsl(199, 89%, 48%)', // Cyan
    bgColor: 'hsl(199, 89%, 48% / 0.1)',
    borderColor: 'hsl(199, 89%, 48% / 0.3)'
  },
  'online-services': {
    key: 'online-services',
    label: 'Online Services',
    description: 'Consulting, coaching, virtual services',
    color: 'hsl(24, 70%, 50%)', // Dark Orange
    bgColor: 'hsl(24, 70%, 50% / 0.1)',
    borderColor: 'hsl(24, 70%, 50% / 0.3)'
  },
  subscription: {
    key: 'subscription',
    label: 'Subscription',
    description: 'Membership sites, recurring revenue models',
    color: 'hsl(271, 81%, 56%)', // Violet
    bgColor: 'hsl(271, 81%, 56% / 0.1)',
    borderColor: 'hsl(271, 81%, 56% / 0.3)'
  },
  'affiliate-leadgen': {
    key: 'affiliate-leadgen',
    label: 'Affiliate/Lead Gen',
    description: 'Affiliate marketing, lead generation sites',
    color: 'hsl(339, 90%, 51%)', // Magenta
    bgColor: 'hsl(339, 90%, 51% / 0.1)',
    borderColor: 'hsl(339, 90%, 51% / 0.3)'
  }
};

export const getIndustryCategory = (industry?: string): IndustryCategory => {
  if (!industry) {
    return {
      key: 'other',
      label: 'Other',
      description: 'Other business category',
      color: 'hsl(var(--muted-foreground))',
      bgColor: 'hsl(var(--muted) / 0.1)',
      borderColor: 'hsl(var(--muted-foreground) / 0.3)'
    };
  }

  // Try to match industry string to our categories
  const industryLower = industry.toLowerCase();
  
  // Direct matches
  if (digitalBusinessCategories[industryLower]) {
    return digitalBusinessCategories[industryLower];
  }

  // Fuzzy matching for common variations
  if (industryLower.includes('saas') || industryLower.includes('software') || industryLower.includes('cloud')) {
    return digitalBusinessCategories.saas;
  }
  if (industryLower.includes('ecommerce') || industryLower.includes('e-commerce') || industryLower.includes('retail') || industryLower.includes('marketplace')) {
    return digitalBusinessCategories.ecommerce;
  }
  if (industryLower.includes('agency') || industryLower.includes('marketing') || industryLower.includes('seo') || industryLower.includes('ppc')) {
    return digitalBusinessCategories['digital-agency'];
  }
  if (industryLower.includes('content') || industryLower.includes('media') || industryLower.includes('blog') || industryLower.includes('podcast')) {
    return digitalBusinessCategories['content-media'];
  }
  if (industryLower.includes('education') || industryLower.includes('edtech') || industryLower.includes('course') || industryLower.includes('learning')) {
    return digitalBusinessCategories.edtech;
  }
  if (industryLower.includes('fintech') || industryLower.includes('finance') || industryLower.includes('payment') || industryLower.includes('crypto')) {
    return digitalBusinessCategories.fintech;
  }
  if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('wellness')) {
    return digitalBusinessCategories.healthtech;
  }
  if (industryLower.includes('martech') || industryLower.includes('analytics') || industryLower.includes('automation')) {
    return digitalBusinessCategories.martech;
  }
  if (industryLower.includes('mobile') || industryLower.includes('app') || industryLower.includes('ios') || industryLower.includes('android')) {
    return digitalBusinessCategories['mobile-apps'];
  }
  if (industryLower.includes('consulting') || industryLower.includes('coaching') || industryLower.includes('service')) {
    return digitalBusinessCategories['online-services'];
  }
  if (industryLower.includes('subscription') || industryLower.includes('membership') || industryLower.includes('recurring')) {
    return digitalBusinessCategories.subscription;
  }
  if (industryLower.includes('affiliate') || industryLower.includes('lead') || industryLower.includes('generation')) {
    return digitalBusinessCategories['affiliate-leadgen'];
  }

  // Default fallback
  return {
    key: 'other',
    label: industry,
    description: `${industry} business`,
    color: 'hsl(var(--muted-foreground))',
    bgColor: 'hsl(var(--muted) / 0.1)',
    borderColor: 'hsl(var(--muted-foreground) / 0.3)'
  };
};
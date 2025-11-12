// LeadAcademyReplica - Complete high-fidelity recreation of leadacademy.io
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  GraduationCap,
  Search,
  Users,
  CheckCircle,
  ChevronRight,
  Video,
  DollarSign,
  ShieldCheck,
  PlayCircle,
  X,
  ChevronDown,
  Crown,
  Play,
  Settings,
} from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import heroThumbnail from '@/assets/hero-video-thumbnail.png';

// Helper component for the feature banner pills
function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-[#0a1a37] to-[#010e21] border border-[#142d5c] text-sm text-white">
      <Icon className="w-4 h-4 text-[#3b82f6]" />
      <span>{label}</span>
    </div>
  );
}

// Announcement Bar Component
function AnnouncementBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-[#dbeafe] border-b border-[#93c5fd]">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center relative">
        <p className="text-[#0f172a] text-sm text-center">
          We offer a 7-day free trial for all people looking to join the Professor plan.
        </p>
        <button
          onClick={onClose}
          className="absolute right-6 text-[#0f172a] hover:text-[#334155] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Navigation bar
function NavBar() {
  return (
    <nav className="sticky top-0 z-30 bg-transparent backdrop-blur-sm border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#2563eb] text-xl font-bold">L</span>
          </div>
          <span className="font-semibold text-lg">Lead Academy</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#who" className="hover:text-white/80 transition-colors">Who Is it for?</a>
          <a href="#case-studies" className="hover:text-white/80 transition-colors flex items-center gap-1">
            Case Studies <ChevronDown className="w-4 h-4" />
          </a>
          <a href="#courses" className="hover:text-white/80 transition-colors">Courses</a>
          <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
          <a href="#tools" className="hover:text-white/80 transition-colors">Tools</a>
          <a href="#faq" className="hover:text-white/80 transition-colors">FAQ's</a>
        </div>
        <div className="hidden md:block">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#3b82f6] transition-colors text-white font-semibold px-6 py-2 rounded-full shadow-lg"
          >
            Start 7‑Day Trial
          </a>
        </div>
      </div>
    </nav>
  );
}

// Hero section with video card
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Feature Pills Row */}
      <div className="pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-[#031329] border border-white/10 rounded-full px-6 py-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Weekly Coaching Calls</span>
            </div>
            <div className="bg-[#031329] border border-white/10 rounded-full px-6 py-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Prerecorded Lead Gen Course</span>
            </div>
            <div className="bg-[#031329] border border-white/10 rounded-full px-6 py-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Lead Scrapers</span>
            </div>
            <div className="bg-[#031329] border border-white/10 rounded-full px-6 py-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Like Minded Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  An Exclusive Community For
                  <br />
                  Lead Generation Experts.
                </h1>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Learn cutting-edge lead generation strategies, access powerful tools, and connect
                  with a community of ambitious entrepreneurs scaling their businesses to 7-figures.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white font-semibold px-8 py-3 rounded-full shadow-xl transition-colors"
                  >
                    <Crown className="w-5 h-5" />
                    Start 7-Day Trial
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right: Video Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Curly Arrow SVG */}
              <svg
                className="absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-16 text-[#3b82f6] opacity-40 hidden lg:block"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 50 Q 25 20, 40 50 T 70 50 L 80 50 M 75 45 L 85 50 L 75 55"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Video Card with Hover Effect */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                <img
                  src={heroThumbnail}
                  alt="Lead Generation Success Story"
                  className="w-full h-auto"
                />
                {/* Play Button */}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform group">
                  <div className="w-16 h-16 bg-[#2563eb] rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1 fill-white" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section component for simple headings with optional subheading
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#010e21] mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

// Grid of success stories with thumbnails and captions
function SuccessStories() {
  const stories = [
    {
      image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80',
      title: '200% Better Using Lead Academy',
      caption: 'How Abdel Doubled His B2B Cold Email Campaign Performance',
    },
    {
      image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=80',
      title: 'Closed 6 Clients Using Lead Academy',
      caption: 'How Kareem Closed 6 Medtech Clients in 1 Month',
    },
    {
      image: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=600&q=80',
      title: '$26,000/month in Two Months',
      caption: 'Sebastian went from $0 to $26k MRR in 2 Months',
    },
    {
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80',
      title: '100K Pipeline Using Lead Academy',
      caption: 'Marc Made $100K at 17 Years Old',
    },
    {
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
      title: '47 Calls in 1 Week',
      caption: 'Sam Helps Raise VC Capital Using Lead Academy',
    },
    {
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      title: '20K Client Revenue',
      caption: 'Marvin Added $20K Revenue to His Agency',
    },
  ];
  return (
    <section id="case-studies" className="py-20 bg-[url('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center bg-fixed">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Success Stories from Our Members"
          subtitle="We let the results speak for themselves. Discover the real stories from our community."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <div className="relative">
                <img src={story.image} alt={story.title} className="w-full h-48 object-cover" />
                <PlayCircle className="w-16 h-16 text-white absolute inset-0 m-auto drop-shadow-md" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-lg mb-1 text-[#010e21]">{story.title}</h3>
                <p className="text-sm text-gray-600 flex-1">{story.caption}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1 text-[#3b82f6] font-medium">
                  Read More <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-6 py-3 rounded-full shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> Start 7‑Day Trial
          </a>
        </div>
      </div>
    </section>
  );
}

// Two large video result cards section
function RealResults() {
  const cards = [
    {
      image: 'https://images.unsplash.com/photo-1590080875112-58da4e1af8d4?auto=format&fit=crop&w=900&q=80',
      title: 'From $0 to $40K MRR in 6 Months',
      caption: 'How Alex Went From $0→$40k/mo in 6 months',
    },
    {
      image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=900&q=80',
      title: 'From Zero to $30K/month',
      caption: 'How Daniel went from $0→$30k/mo in 4 months',
    },
  ];
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title="Real results, Real voices — see what our students are saying."
          subtitle="We let the results speak for themselves. Discover the real stories from our course."
        />
        <div className="grid md:grid-cols-2 gap-12">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative">
                <img src={card.image} alt={card.title} className="w-full h-60 object-cover" />
                <PlayCircle className="w-16 h-16 text-white absolute inset-0 m-auto drop-shadow-xl" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2 text-[#010e21]">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-6 py-3 rounded-full shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> Start 7‑Day Trial
          </a>
        </div>
      </div>
    </section>
  );
}

// Who Is For section with three gradient cards
function WhoSection() {
  const items = [
    {
      title: 'Beginners',
      description:
        "We'll walk you through the essentials - from building your offer to booking your first calls. No fluff, just proven systems to launch your first client-generating machine.",
    },
    {
      title: 'Entrepreneurs',
      description:
        "We'll show you how to turn cold outreach into a repeatable, scalable growth engine - backed by the same systems we use to scale our own agency.",
    },
    {
      title: 'Business Owners',
      description:
        'Plug into the exact frameworks that are helping founders simplify operations, increase lead flow, and reclaim their time - without adding more complexity.',
    },
  ];
  return (
    <section className="py-20 bg-white" id="who">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title="Who Is Lead Academy For?"
          subtitle="In Lead Academy, we pull back the curtain on the strategies we can't reveal online, including actual sales calls and a genuine peek inside our agency operations."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="relative rounded-2xl p-6 bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#1d4ed8] text-white shadow-lg overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)]" />
              <h3 className="text-xl font-semibold mb-2 z-10 relative">{item.title}</h3>
              <p className="text-sm leading-relaxed z-10 relative">{item.description}</p>
              <div className="mt-4 z-10 relative">
                <a href="#" className="inline-block bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full shadow transition-colors">
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Two paths section with connecting arrow and two cards
function TwoPathsSection() {
  return (
    <section className="py-20 bg-gray-50" id="two-paths">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#010e21] mb-4">The Two Paths</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          You can either spend months trying to figure it all out yourself - or plug into a proven system that already books qualified calls weekly. One path costs time and frustration. The other costs $197.
        </p>
        {/* arrow connecting cards */}
        <div className="relative flex flex-col items-center">
          <svg className="w-60 h-60 text-blue-300 absolute top-0" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M50 150 Q100 50 150 150" />
            <polyline points="135,135 150,150 165,135" />
            <polyline points="35,135 50,150 65,135" />
          </svg>
        </div>
        <div className="grid md:grid-cols-2 gap-12 mt-20">
          {/* Left card */}
          <div className="bg-gradient-to-br from-[#1e3a8a] via-[#0f1e55] to-[#04163a] text-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <div className="relative mb-6 w-40 h-40">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80"
                alt="Path A"
                className="rounded-xl w-full h-full object-cover"
              />
            </div>
            <h3 className="text-3xl font-bold mb-4">Pay $10,000</h3>
            <p className="text-center text-sm max-w-xs mb-6">
              Spend years figuring it out yourself—buying courses, testing tools, burning domains—just to end up with slow results and expensive lessons.
            </p>
            <button className="bg-gray-800 text-white px-6 py-2 rounded-full opacity-70 cursor-not-allowed mb-2">Figure It Out Alone</button>
          </div>
          {/* Right card */}
          <div className="bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <div className="relative mb-6 w-40 h-40">
              <img
                src="https://images.unsplash.com/photo-1523267040442-5bcd9f29b58c?auto=format&fit=crop&w=400&q=80"
                alt="Path B"
                className="rounded-xl w-full h-full object-cover"
              />
            </div>
            <h3 className="text-3xl font-bold mb-4">Pay $197</h3>
            <p className="text-center text-sm max-w-xs mb-6">
              Get instant access to the exact strategies, systems, and scripts we use to book qualified sales calls every week—without wasting time or money.
            </p>
            <button className="bg-white text-[#010e21] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">Start 7‑Day Trial</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// What comes with Lead Academy section (4 cards)
function WhatComesSection() {
  const cards = [
    {
      title: 'The Lead Academy Program',
      description:
        'Unlock the full suite of Lead Academy with over 24 hours of on-demand lead generation content, constantly updated to stay relevant.',
      image: 'https://images.unsplash.com/photo-1564865878688-997aa0be6bfd?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Data Scrapers & Tools',
      description:
        'Get unlimited access to essential data scrapers and lead generation tools designed to streamline your campaign creation process.',
      image: 'https://images.unsplash.com/photo-1559027615-0785ab4f47c1?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Exclusive Discord Access',
      description:
        'Have exclusive Discord access to the founders for personalized guidance on cold email strategies, sales, and more.',
      image: 'https://images.unsplash.com/photo-1542327897-099f5da3dcb8?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Weekly Coaching Calls',
      description:
        'Join our weekly coaching calls to gain targeted, actionable advice that\'s directly applicable to growing your business.',
      image: 'https://images.unsplash.com/photo-1581091870621-6c3e1b36c3e1?auto=format&fit=crop&w=800&q=80',
    },
  ];
  return (
    <section className="py-20 bg-gray-100" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="What comes with Lead Academy?"
          subtitle="Lead Academy is a lot more than just a course."
        />
        <div className="grid md:grid-cols-2 gap-12">
          {cards.map((card, idx) => (
            <div key={idx} className="relative bg-white rounded-3xl shadow-xl overflow-hidden p-6">
              {/* Background pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.15),transparent)]" />
              <img src={card.image} alt="graphic" className="w-24 h-24 object-cover rounded-lg mb-4" />
              <h3 className="text-xl font-semibold text-[#010e21] mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Tools section: sample grid of tools
function ToolsSection() {
  const tools = [
    {
      icon: '✉️',
      title: 'Email Retriever',
      description: 'Extract all emails from any website within minutes.',
    },
    {
      icon: '📝',
      title: 'Job Title Formatter',
      description: 'Automatically normalize job titles using AI.',
    },
    {
      icon: '📊',
      title: 'Waterfall Enrichment',
      description: 'Find all emails via Apollo.io & other databases.',
    },
    {
      icon: '💼',
      title: 'Crunchbase Scraper',
      description: 'Access to over 13M software companies.',
    },
    {
      icon: '⭐',
      title: 'Trust Pilot Scraper',
      description: 'Access to local business reviews categorized by service type.',
    },
    {
      icon: '🏢',
      title: 'BBB Scraper',
      description: 'Access to over 1M BBB accredited local businesses.',
    },
  ];
  return (
    <section id="tools" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Lead Academy Tools"
          subtitle="We offer a diverse range of data scrapers and lead generation tools designed to streamline and simplify your campaign creation process."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#1d4ed8] text-white rounded-3xl p-6 shadow-xl flex flex-col"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm flex-1">{tool.description}</p>
              <div className="mt-4">
                <span className="inline-block bg-white/10 px-3 py-1 text-xs rounded-full">
                  Available in Professor Plan
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing section with three plans
function PricingSection() {
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      per: 'month',
      features: ['Free Community', 'Free Course Content'],
      cta: 'Start for Free',
      background: 'bg-white',
      highlight: false,
    },
    {
      name: 'Professor Plan',
      price: '$197',
      per: 'month',
      features: [
        'One Weekly Coaching Call',
        'Full Lead Academy Toolkit',
        'Full Course Content Access',
        'Access to Founders',
        'Lead Academy Community',
        'Progress Tracking',
        'Email Support',
      ],
      cta: 'Get Access',
      background: 'bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white',
      highlight: true,
    },
    {
      name: 'Council Plan',
      price: '$1,997',
      per: '6 months',
      features: [
        'Everything From The Professor Plan',
        '1‑on‑1 Coaching Sessions',
        'Contract Templates',
        'Landing Page Templates',
        'Real Sales Calls',
        'Real Onboarding Calls',
        'Inbox Manager System',
        'Email Script Bank',
        'Lead List Bank',
        'VSL Template',
        'Lead Academy API Access',
        'Council Private Channel',
      ],
      cta: 'Get Access',
      background: 'bg-white',
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="The Lead Academy Pricing"
          subtitle="We have a plan for everyone."
        />
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl shadow-xl overflow-hidden p-8 ${plan.background} ${plan.highlight ? 'transform scale-105 lg:-mt-6' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 px-4 py-1 bg-[#1e3a8a] text-xs text-white rounded-bl-lg rounded-tr-3xl">
                  Most Popular
                </div>
              )}
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-[#010e21]'}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#010e21]'}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>/{plan.per}</span>
              </div>
              <button
                className={`w-full py-2 px-4 rounded-full font-semibold text-center mb-6 ${plan.highlight ? 'bg-white text-[#010e21] hover:bg-gray-100' : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'}`}
              >
                {plan.cta}
              </button>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, idf) => (
                  <li key={idf} className="flex items-start gap-3">
                    <CheckCircle className={`w-4 h-4 mt-0.5 ${plan.highlight ? 'text-white' : 'text-[#3b82f6]'}`} />
                    <span className={`${plan.highlight ? 'text-white' : 'text-gray-700'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-16 space-x-8">
          <div className="flex items-center gap-2">
            <img src="https://seeklogo.com/images/W/whop-logo-FD80C39667-seeklogo.com.png" alt="Whop" className="w-16 h-auto opacity-80" />
            <span className="text-gray-600 text-xs">Rated 5 Stars (49)</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://1000logos.net/wp-content/uploads/2022/08/Trustpilot-Logo-2012.png" alt="Trustpilot" className="w-16 h-auto opacity-80" />
            <span className="text-gray-600 text-xs">Rated 4.5 Stars (40)</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="w-12" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Mastercard-logo.png" alt="Mastercard" className="w-12" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/PayPal_logo.svg" alt="PayPal" className="w-16" />
        </div>
      </div>
    </section>
  );
}

// Simple testimonial carousel (static)
function TestimonialsSection() {
  const testimonials = [
    {
      video: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      quote: 'As soon as I joined all of my questions were answered with precision. The community is amazing & the founders are amazing.',
      name: 'Tamerlan',
      company: 'AutoFye',
    },
    {
      video: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      quote: "I've gotten value from this course that even courses costing $997 or $3,000 couldn't provide.",
      name: 'Ayyan',
      company: 'Nexaconsulting',
    },
    {
      video: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      quote: 'Within 15 minutes I\'ve gotten more value than any other course I\'ve taken.',
      name: 'Michael',
      company: 'InventoryPanda',
    },
  ];
  return (
    <section className="py-20 bg-gray-100" id="testimonials">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <SectionHeading
          title="Just let our results speak for themselves."
          subtitle="Lead Academy members dominate across all industries. From local business, to fortune 500 corporations."
        />
        <div className="relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 flex-1 max-w-md">
                <div className="relative mb-4">
                  <img src={t.video} alt="testimonial" className="w-full h-48 object-cover rounded-xl" />
                  <PlayCircle className="w-14 h-14 text-white absolute inset-0 m-auto drop-shadow-lg" />
                </div>
                <p className="text-sm text-gray-700 mb-4">"{t.quote}"</p>
                <p className="text-sm font-semibold text-[#010e21]">{t.name} <span className="text-gray-500">from {t.company}</span></p>
              </div>
            ))}
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <span key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
        <div className="mt-12">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-6 py-3 rounded-full shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> Start 7‑Day Trial
          </a>
        </div>
      </div>
    </section>
  );
}

// FAQ section using Radix Accordion
function FAQSection() {
  const faqs = [
    {
      question: 'What is included in the free trial?',
      answer: "During your 7-day free trial you'll get full access to the Lead Academy platform, including the entire course and tool suite. You can cancel at any time.",
    },
    {
      question: 'Can I cancel my membership at any time?',
      answer: 'Yes. Your membership is billed monthly and you can cancel at any time without penalty. You\'ll retain access for the remainder of your billing cycle.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Due to the digital nature of our product and instant access to proprietary materials we do not offer refunds. However, you can try the platform for free for 7 days.',
    },
    {
      question: 'Do I get one‑on‑one support?',
      answer: 'Our Professor and Council plans include group coaching calls and community support. One‑on‑one coaching is available in the Council plan.',
    },
  ];
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="If you still have questions after reading through our FAQ, feel free to reach out via our support chat."
        />
        <Accordion.Root type="single" collapsible className="space-y-4">
          {faqs.map((faq, idx) => (
            <Accordion.Item key={idx} value={`faq-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden">
              <Accordion.Header className="flex">
                <Accordion.Trigger className="flex-1 flex items-center justify-between px-4 py-3 text-left text-[#010e21] font-medium hover:bg-gray-50">
                  {faq.question}
                  <span className="ml-4 transition-transform duration-300 data-[state=open]:rotate-180">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-4 py-3 text-sm text-gray-600 border-t bg-gray-50">
                {faq.answer}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

// Final call to action section
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join Lead Academy?</h2>
          <p className="text-lg mb-6 max-w-md">
            Get instant access to everything you need to scale your lead generation agency. Start your 7‑day free trial today and see the difference for yourself.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-white text-[#010e21] hover:bg-gray-100 font-semibold px-6 py-3 rounded-full shadow-md"
          >
            <ShieldCheck className="w-5 h-5" /> Start 7‑Day Trial
          </a>
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-6">
          <img
            src="https://images.unsplash.com/photo-1539884352749-56c5b27aeb85?auto=format&fit=crop&w=400&q=80"
            alt="App screenshot 1"
            className="w-40 h-80 object-cover rounded-2xl shadow-2xl"
          />
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
            alt="App screenshot 2"
            className="w-40 h-80 object-cover rounded-2xl shadow-2xl hidden md:block"
          />
        </div>
      </div>
    </section>
  );
}

// Footer component
function Footer() {
  return (
    <footer className="bg-[#010e21] text-gray-400 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white font-bold text-xl rounded-md px-2 py-1">L</span>
          <span className="text-white font-semibold text-lg">Lead Academy</span>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} Lead Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Main page component assembling all pieces
export default function HomePageA() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  return (
    <div className="font-inter antialiased bg-gradient-to-br from-[#020617] via-[#03204b] to-[#0b4ed8]">
      {announcementVisible && <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />}
      <NavBar />
      <HeroSection />
      <SuccessStories />
      <RealResults />
      <WhoSection />
      <TwoPathsSection />
      <WhatComesSection />
      <ToolsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

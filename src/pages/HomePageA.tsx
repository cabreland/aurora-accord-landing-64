/* HomePageA.tsx
 * Test page recreating LeadAcademy design with accurate tokens
 * Based on uploaded LeadAcademyAccurate.jsx
 */

import React from "react";

// DESIGN TOKENS (from LeadAcademy extraction)
// Primary Navy: #072253, #02368c, #000918, #010e21
// Accent Blue: #0655de, #2071ff, #3059ff
// Text colors: #fff (white), rgb(62, 72, 89) for muted
// Border radius: 10px
// Container: 1280px max-width
// Fonts: Inter (headings), General Sans (body)

const Container = ({ className = "", children, maxWidth = "1280px" }: { className?: string; children: React.ReactNode; maxWidth?: string }) => (
  <div className={`mx-auto w-full px-4 md:px-6 lg:px-8 ${className}`} style={{ maxWidth }}>
    {children}
  </div>
);

const Nav = () => (
  <header className="sticky top-0 z-50 bg-[#010e21]/95 backdrop-blur border-b border-white/10">
    <Container className="flex h-16 items-center justify-between">
      <a href="#" className="font-semibold text-xl tracking-tight text-white">Lead Academy</a>
      <nav className="hidden md:flex items-center gap-6">
        <a href="#tools" className="text-sm text-white/80 hover:text-white transition">Tools</a>
        <a href="#success" className="text-sm text-white/80 hover:text-white transition">Success Stories</a>
        <a href="#pricing" className="text-sm text-white/80 hover:text-white transition">Pricing</a>
        <a href="#faq" className="text-sm text-white/80 hover:text-white transition">FAQ</a>
      </nav>
      <a 
        href="#pricing" 
        className="inline-flex items-center rounded-[10px] px-5 py-2.5 text-sm font-semibold bg-[#2071ff] text-white hover:bg-[#3059ff] transition"
      >
        Start 7-Day Trial
      </a>
    </Container>
  </header>
);

const Hero = () => (
  <section id="hero" className="relative overflow-hidden bg-[#010e21]">
    <Container className="py-20 md:py-28 lg:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="text-sm font-medium tracking-tight text-white/70">
          An Exclusive Community For Lead Generation Experts
        </div>
        <h1 
          className="font-inter text-[40px] md:text-[44px] lg:text-[52px] font-semibold leading-[120%] tracking-tight text-white"
          style={{ letterSpacing: '-0.03em' }}
        >
          Lead Academy Tools
        </h1>
        <p className="text-lg md:text-xl leading-[140%] text-[rgb(62,72,89)] max-w-3xl mx-auto">
          We offer a diverse range of data scrapers and lead generation tools designed to streamline and simplify your campaign creation process.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <a 
            href="#pricing" 
            className="inline-flex items-center rounded-[10px] bg-[#2071ff] text-white px-6 py-3 text-base font-semibold hover:bg-[#3059ff] transition"
          >
            Start 7-Day Trial
          </a>
          <a 
            href="#tools" 
            className="inline-flex items-center rounded-[10px] border border-white/20 text-white px-6 py-3 text-base font-semibold hover:bg-white/5 transition"
          >
            View Tools
          </a>
        </div>
      </div>
    </Container>
  </section>
);

const FeaturesGrid = () => {
  const items = [
    {title:"Data Scrapers", desc:"Extract targeted business data from multiple sources automatically.", icon:"🔍"},
    {title:"Email Finder", desc:"Discover verified email addresses for your prospects.", icon:"📧"},
    {title:"Lead Enrichment", desc:"Enhance your leads with additional data points and insights.", icon:"✨"},
    {title:"CRM Integration", desc:"Seamlessly connect with your existing tools and workflows.", icon:"🔗"},
    {title:"List Builder", desc:"Build and manage targeted prospect lists at scale.", icon:"📋"},
    {title:"Export Tools", desc:"Export your data in any format you need.", icon:"📤"},
  ];

  return (
    <section id="tools" className="bg-[#f0f4fb]">
      <Container className="py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight text-[#010e21]">
            Lead Academy Tools
          </h2>
          <p className="text-lg leading-[140%] text-[rgb(62,72,89)]">
            Everything you need to generate high-quality leads
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <div 
              key={i} 
              className="rounded-[10px] bg-white border border-black/5 p-6 hover:shadow-lg transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-[#010e21] mb-2">{f.title}</h3>
              <p className="text-sm leading-[150%] text-[rgb(62,72,89)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

const VideoTestimonials = () => {
  const videos = [
    {
      resultText: "$0 TO $40K MRR",
      resultSubtext: "IN 6 MONTHS",
      caption: "How Alex Went From $0-$40k/mo in 6 months",
    },
    {
      resultText: "FROM ZERO TO $30K/MONTH",
      resultSubtext: "USING LEAD ACADEMY",
      caption: "Sarah's Journey to $30k Monthly Revenue",
    },
  ];

  const logos = ["Borks", "Forge", "Intellivise", "Infinite", "UDC", "Crescent Labs"];

  return (
    <section id="testimonials-video" className="bg-white">
      <Container className="py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">
          <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight text-[#010e21]">
            Real results, Real voices — see what our students are saying
          </h2>
          <p className="text-lg leading-[140%] text-[rgb(62,72,89)]">
            We let the results speak for themselves...
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {videos.map((video, i) => (
            <div 
              key={i} 
              className="group relative rounded-[10px] overflow-hidden bg-gray-900 aspect-video flex items-center justify-center hover:scale-[1.02] transition cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#072253] to-[#010e21]" />
              
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-[#010e21] ml-1" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 3l8 5-8 5V3z"/>
                </svg>
              </div>
              
              <div className="absolute top-6 left-6 right-6 z-20">
                <div className="text-white font-bold text-2xl md:text-3xl leading-tight">
                  {video.resultText}
                </div>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[#2071ff] text-white text-sm font-semibold">
                  {video.resultSubtext}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium">{video.caption}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {logos.map((logo, i) => (
              <div key={i} className="text-gray-500 font-semibold text-sm">
                {logo}
              </div>
            ))}
          </div>
          <p className="text-sm text-[rgb(62,72,89)]">Our members work with billion dollar companies all around the world</p>
          <a 
            href="#pricing"
            className="inline-flex items-center rounded-[10px] bg-[#2071ff] text-white px-6 py-3 text-base font-semibold hover:bg-[#3059ff] transition"
          >
            Start 7-Day Trial
          </a>
        </div>
      </Container>
    </section>
  );
};

const SuccessStories = () => {
  const cases = [
    {
      resultText: "200% BETTER",
      accentText: "USING LEAD ACADEMY",
      description: "Increased lead quality by 200% in first 30 days",
    },
    {
      resultText: "CLOSED 6 CLIENTS",
      accentText: "USING LEAD ACADEMY",
      description: "Closed 6 high-ticket clients in 60 days",
    },
    {
      resultText: "$100M SALES PIPELINE",
      accentText: "BUILT WITH LEAD ACADEMY",
      description: "Built a $100M qualified sales pipeline",
    },
  ];

  return (
    <section id="success" className="bg-[#f0f4fb]">
      <Container className="py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight text-[#010e21]">
            Success Stories from Our Members
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <div 
              key={i}
              className="group rounded-[10px] bg-white border border-black/5 overflow-hidden hover:shadow-xl transition cursor-pointer"
            >
              <div className="relative aspect-video bg-gradient-to-br from-[#072253] to-[#010e21] flex items-center justify-center">
                <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-5 h-5 text-[#010e21] ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 3l8 5-8 5V3z"/>
                  </svg>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white font-bold text-2xl md:text-3xl mb-2">
                      {c.resultText}
                    </div>
                    <div className="text-[#2071ff] font-bold text-lg">
                      {c.accentText}
                    </div>
                    <svg className="w-12 h-12 mx-auto mt-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17l9.2-9.2M17 17V7h-10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm leading-[150%] text-[rgb(62,72,89)]">
                  {c.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name:"FREE PLAN",
      price:"$0",
      period:"/forever",
      features:[
        "Community Access",
        "Free Content Library",
        "Basic Tools Access",
        "Weekly Newsletters"
      ],
      cta:"Get Started",
      popular: false
    },
    {
      name:"PROFESSOR PLAN",
      price:"$197",
      period:"/month",
      features:[
        "Full Course Access",
        "All Premium Tools",
        "Private Discord",
        "Weekly Live Calls",
        "1-on-1 Support",
        "Templates & Scripts"
      ],
      cta:"Start 7-Day Trial",
      popular: true
    },
    {
      name:"COUNCIL PLAN",
      price:"$1,997",
      period:"/6 months",
      subPrice: "or $332/mo financing",
      features:[
        "Everything in Professor",
        "VIP Council Access",
        "Priority Support",
        "Monthly 1-on-1 Calls",
        "Done-For-You Templates",
        "Early Access to New Tools"
      ],
      cta:"Apply Now",
      popular: false
    },
  ];

  return (
    <section id="pricing" className="bg-white">
      <Container className="py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight text-[#010e21]">
            The Lead Academy Pricing
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-[10px] border-2 p-8 flex flex-col relative ${
                plan.popular 
                  ? 'border-[#2071ff] shadow-xl scale-105' 
                  : 'border-black/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2071ff] text-white text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-sm font-bold text-[rgb(62,72,89)] mb-2">{plan.name}</div>
              <div className="mb-1">
                <span className="text-4xl font-bold text-[#010e21]">{plan.price}</span>
                <span className="text-lg text-[rgb(62,72,89)]">{plan.period}</span>
              </div>
              {plan.subPrice && (
                <div className="text-sm text-[rgb(62,72,89)] mb-6">{plan.subPrice}</div>
              )}
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-[#2071ff] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-[rgb(62,72,89)]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a 
                href="#cta"
                className={`w-full text-center rounded-[10px] px-6 py-3 text-base font-semibold transition ${
                  plan.popular
                    ? 'bg-[#2071ff] text-white hover:bg-[#3059ff]'
                    : 'bg-[#010e21] text-white hover:bg-[#072253]'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

const FAQ = () => {
  const items = [
    {q:"What's the difference between plans?", a:"Free gives you community access. Professor unlocks full training + tools. Council adds VIP access and 1-on-1 support."},
    {q:"Is there financing available?", a:"Yes! Council Plan offers 6-month payment plans at $332/month."},
    {q:"How many weekly calls are included?", a:"Professor and Council members get access to weekly group coaching calls."},
    {q:"Can I cancel anytime?", a:"Yes, monthly plans can be canceled anytime. No long-term contracts."},
    {q:"Do you offer a money-back guarantee?", a:"Yes! Try Professor Plan free for 7 days. Full refund if not satisfied."},
    {q:"What tools are included?", a:"Data scrapers, email finders, lead enrichment, CRM integrations, and more. Full list in the Tools section."},
  ];

  return (
    <section id="faq" className="bg-[#f0f4fb]">
      <Container className="py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight text-[#010e21]">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, i) => (
            <details 
              key={i} 
              className="group rounded-[10px] bg-white border border-black/5 p-6 hover:shadow-md transition"
            >
              <summary className="cursor-pointer text-lg font-semibold text-[#010e21] flex items-center justify-between">
                {item.q}
                <svg 
                  className="w-5 h-5 text-[rgb(62,72,89)] group-open:rotate-180 transition" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-[150%] text-[rgb(62,72,89)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
};

const CTA = () => (
  <section id="cta" className="bg-[#010e21] text-white">
    <Container className="py-20 md:py-28 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="font-inter text-[40px] md:text-[44px] font-semibold leading-[120%] tracking-tight">
          Enjoy a completely free 7 day trial
        </h2>
        <p className="text-lg text-white/70">No credit card required. Cancel anytime.</p>
        <a 
          href="#pricing"
          className="inline-flex items-center rounded-[10px] bg-[#2071ff] text-white px-8 py-4 text-lg font-semibold hover:bg-[#3059ff] transition"
        >
          Start Your Free Trial
        </a>
      </div>
    </Container>
  </section>
);

const Footer = () => (
  <footer className="bg-[#010e21] border-t border-white/10">
    <Container className="py-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-sm text-white/60">
        © {new Date().getFullYear()} Lead Academy. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-sm">
        <a href="#" className="text-white/60 hover:text-white transition">Privacy</a>
        <a href="#" className="text-white/60 hover:text-white transition">Terms</a>
        <a href="#" className="text-white/60 hover:text-white transition">Contact</a>
      </div>
    </Container>
  </footer>
);

const HomePageA = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Inter']">
      <Nav />
      <main>
        <Hero />
        <FeaturesGrid />
        <VideoTestimonials />
        <SuccessStories />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePageA;

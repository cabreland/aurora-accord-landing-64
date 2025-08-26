
// Convert mock deals to InvestorDeal format for Demo page compatibility
export const mockDeals = [
  {
    id: "mock-1",
    companyName: "TechFlow Solutions",
    industry: "SaaS",
    revenue: "$8.5M",
    ebitda: "$2.1M",
    stage: "NDA Signed",
    progress: 75,
    priority: "High",
    location: "Austin, TX",
    fitScore: 92,
    lastUpdated: "2 hours ago",
    description: "B2B workflow automation platform with 500+ enterprise clients",
    foundedYear: "2018",
    teamSize: "45",
    reasonForSale: "Founder retirement",
    growthOpportunities: ["International expansion", "Product diversification"],
    foundersMessage: "Looking for the right buyer to take our platform to the next level.",
    founderName: "John Smith",
    idealBuyerProfile: "Strategic acquirer in the SaaS space",
    rollupPotential: "High - complementary to other workflow tools",
    marketTrends: "Strong demand for automation tools",
    profitMargin: "25%",
    customerCount: "500+",
    recurringRevenue: "95%",
    cacLtvRatio: "1:12",
    highlights: ["Market leader", "Recurring revenue", "Strong team"],
    risks: ["Market competition", "Key customer concentration"],
    documents: [
      { name: "Executive Summary.pdf", type: "PDF", size: "2.4 MB", lastUpdated: "2 days ago" }
    ]
  },
  {
    id: "mock-2",
    companyName: "Green Energy Corp",
    industry: "Clean Tech",
    revenue: "$12.3M",
    ebitda: "$3.8M",
    stage: "Discovery Call",
    progress: 45,
    priority: "Medium",
    location: "Denver, CO",
    fitScore: 87,
    lastUpdated: "1 day ago",
    description: "Solar panel manufacturing with proprietary efficiency technology",
    foundedYear: "2015",
    teamSize: "120",
    reasonForSale: "Strategic partnership opportunity",
    growthOpportunities: ["Technology licensing", "Geographic expansion"],
    foundersMessage: "Seeking a partner to scale our innovative technology globally.",
    founderName: "Sarah Johnson",
    idealBuyerProfile: "Energy company or private equity",
    rollupPotential: "Medium - fits renewable energy portfolios",
    marketTrends: "Growing demand for clean energy",
    profitMargin: "31%",
    customerCount: "200+",
    recurringRevenue: "60%",
    cacLtvRatio: "1:8",
    highlights: ["Proprietary technology", "Growing market", "Strong margins"],
    risks: ["Regulatory changes", "Supply chain dependencies"],
    documents: [
      { name: "Financial Statements.pdf", type: "PDF", size: "3.2 MB", lastUpdated: "1 week ago" }
    ]
  },
  // Add more mock deals with full InvestorDeal properties...
  {
    id: "mock-3",
    companyName: "MedDevice Innovations",
    industry: "Healthcare",
    revenue: "$15.7M",
    ebitda: "$4.2M",
    stage: "Due Diligence",
    progress: 85,
    priority: "High",
    location: "Boston, MA",
    fitScore: 95,
    lastUpdated: "4 hours ago",
    description: "FDA-approved medical devices for cardiac monitoring",
    foundedYear: "2012",
    teamSize: "85",
    reasonForSale: "Exit strategy",
    growthOpportunities: ["International markets", "New product lines"],
    foundersMessage: "Ready to pass the torch to accelerate growth.",
    founderName: "Dr. Michael Chen",
    idealBuyerProfile: "Medical device company",
    rollupPotential: "High - synergies with medical portfolios",
    marketTrends: "Aging population driving demand",
    profitMargin: "27%",
    customerCount: "150+",
    recurringRevenue: "40%",
    cacLtvRatio: "1:15",
    highlights: ["FDA approved", "Strong IP portfolio", "Experienced team"],
    risks: ["Regulatory compliance", "Reimbursement changes"],
    documents: [
      { name: "Clinical Data.pdf", type: "PDF", size: "5.1 MB", lastUpdated: "3 days ago" }
    ]
  }
];

export type MockDeal = typeof mockDeals[0];

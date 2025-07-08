// Mock data for deals - can be replaced with real API calls later
export const mockDeals = [
  {
    id: 1,
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
    description: "B2B workflow automation platform with 500+ enterprise clients"
  },
  {
    id: 2,
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
    description: "Solar panel manufacturing with proprietary efficiency technology"
  },
  {
    id: 3,
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
    description: "FDA-approved medical devices for cardiac monitoring"
  },
  {
    id: 4,
    companyName: "RetailTech Systems",
    industry: "Retail",
    revenue: "$6.2M",
    ebitda: "$1.5M",
    stage: "Qualified Lead",
    progress: 25,
    priority: "Medium",
    location: "Miami, FL",
    fitScore: 78,
    lastUpdated: "3 days ago",
    description: "Point-of-sale and inventory management for retail chains"
  },
  {
    id: 5,
    companyName: "DataSecure Analytics",
    industry: "Cybersecurity",
    revenue: "$9.8M",
    ebitda: "$2.7M",
    stage: "NDA Signed",
    progress: 60,
    priority: "High",
    location: "Seattle, WA",
    fitScore: 89,
    lastUpdated: "1 day ago",
    description: "Enterprise data protection and analytics platform"
  },
  {
    id: 6,
    companyName: "LogiChain Solutions",
    industry: "Logistics",
    revenue: "$18.2M",
    ebitda: "$5.1M",
    stage: "Discovery Call",
    progress: 30,
    priority: "Medium",
    location: "Chicago, IL",
    fitScore: 82,
    lastUpdated: "2 days ago",
    description: "Supply chain optimization software for manufacturing"
  }
];

export type MockDeal = typeof mockDeals[0];
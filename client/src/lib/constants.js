// Tab categories configuration
export const TAB_CATEGORIES = [
  {
    id: 'no_website',
    label: 'No Website',
    icon: 'globe-lock',
    description: 'Businesses without a website',
    pitchAngle: 'No web presence — full website build',
    color: '#818cf8',
  },
  {
    id: 'weak_seo',
    label: 'Weak SEO',
    icon: 'search-x',
    description: 'Websites with poor SEO performance',
    pitchAngle: 'Website invisible on Google — SEO retainer',
    color: '#f59e0b',
  },
  {
    id: 'agentic_ai',
    label: 'Agentic AI',
    icon: 'bot',
    description: 'Companies needing AI automation',
    pitchAngle: 'Replace manual processes with AI agents',
    color: '#06b6d4',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'wrench',
    description: 'Neglected websites needing care',
    pitchAngle: 'Site is live but unmaintained — care plan',
    color: '#f97316',
  },
  {
    id: 'erp',
    label: 'ERP',
    icon: 'database',
    description: 'Companies needing ERP systems',
    pitchAngle: 'Custom ERP — one system instead of spreadsheets',
    color: '#22c55e',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: 'shopping-cart',
    description: 'E-commerce stores needing modernization',
    pitchAngle: 'Modernize your e-commerce — conversion optimization',
    color: '#ec4899',
  },
  {
    id: 'legacy_tech',
    label: 'Legacy Tech',
    icon: 'code-xml',
    description: 'Outdated tech stacks needing rebuild',
    pitchAngle: 'Full tech stack rebuild — modern, secure, fast',
    color: '#8b5cf6',
  },
  {
    id: 'rfp_watch',
    label: 'RFP Watch',
    icon: 'file-text',
    description: 'Government & institutional RFPs',
    pitchAngle: null,
    color: '#14b8a6',
  },
];

export const OUTREACH_STATUSES = [
  { id: 'new', label: 'New', color: '#818cf8' },
  { id: 'contacted', label: 'Contacted', color: '#06b6d4' },
  { id: 'responded', label: 'Responded', color: '#fbbf24' },
  { id: 'meeting_booked', label: 'Meeting Booked', color: '#22c55e' },
  { id: 'won', label: 'Won', color: '#4ade80' },
  { id: 'lost', label: 'Lost', color: '#f87171' },
];

export const REGIONS = [
  { id: 'local', label: 'Local (India)' },
  { id: 'international', label: 'International' },
];

export const INDUSTRIES = [
  'Healthcare', 'Education', 'Retail', 'Real Estate', 'Restaurant & Food',
  'IT Services', 'Manufacturing', 'Logistics', 'Hospitality', 'Agriculture',
  'E-commerce', 'Government', 'Finance', 'Textiles', 'Distribution',
  'Health & Fitness', 'Automotive', 'Construction', 'Media', 'Other',
];

export const SOURCES = [
  { id: 'google_places', label: 'Google Places' },
  { id: 'manual', label: 'Manual Entry' },
  { id: 'directory', label: 'Directory' },
  { id: 'justdial', label: 'Justdial' },
  { id: 'indiamart', label: 'IndiaMART' },
  { id: 'csv_import', label: 'CSV Import' },
];

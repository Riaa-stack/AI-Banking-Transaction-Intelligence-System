/**
 * intelFeedService.js
 * Provides authentic, professional banking, security, credit card,
 * and financial telemetry photography assets.
 */

export const REAL_BANKING_IMAGES = [
  {
    id: 'real-1',
    src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    alt: 'Secure POS Credit Card Transaction Terminal',
    title: 'POS Terminal Security'
  },
  {
    id: 'real-2',
    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    alt: 'Cybersecurity Threat Detection Code Monitor',
    title: 'Real-Time Neural Defense'
  },
  {
    id: 'real-3',
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    alt: 'Financial Market Data & Transaction Graph',
    title: 'Ledger Velocity Analytics'
  },
  {
    id: 'real-4',
    src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    alt: 'Matrix Network Encryption Node',
    title: 'Encrypted Packet Tunneling'
  },
  {
    id: 'real-5',
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    alt: 'Biometric Access Control & Identity Verification',
    title: 'Biometric Auth Protocol'
  },
  {
    id: 'real-6',
    src: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise Server Data Infrastructure',
    title: 'Cloud Edge Nodes'
  },
  {
    id: 'real-7',
    src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    alt: 'Datacenter Server LED Security Lights',
    title: 'Zero-Trust Infrastructure'
  },
  {
    id: 'real-8',
    src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    alt: 'Modern Central Banking Headquarters',
    title: 'Institutional Clearing'
  },
  {
    id: 'real-9',
    src: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=800&auto=format&fit=crop&q=80',
    alt: 'Mobile Online Banking Interface',
    title: 'Customer Banking Portal'
  },
  {
    id: 'real-10',
    src: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80',
    alt: 'Capital Liquidity Growth Graph',
    title: 'Liquidity Forecasting'
  },
  {
    id: 'real-11',
    src: 'https://images.unsplash.com/photo-1556742049-0a67daf4095a?w=800&auto=format&fit=crop&q=80',
    alt: 'Contactless Merchant Smart Card Payment',
    title: 'EMV Fraud Shield'
  },
  {
    id: 'real-12',
    src: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise Risk Management Command Center',
    title: 'SOC Remediation Team'
  }
];

export const FALLBACK_INTEL_ITEMS = REAL_BANKING_IMAGES;

export async function fetchBankingIntelFeed() {
  return REAL_BANKING_IMAGES;
}

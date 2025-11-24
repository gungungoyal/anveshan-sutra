import { Organization } from "@shared/api";

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Future Educators Foundation",
    type: "NGO",
    website: "https://futureteachers.org",
    headquarters: "Uttar Pradesh",
    region: "Northern India",
    focusAreas: ["Education", "Livelihood"],
    mission:
      "Empowering rural communities through quality education and skill development programs.",
    description:
      "Future Educators Foundation works across Uttar Pradesh and Madhya Pradesh, providing educational resources and teacher training to over 50 schools. We focus on making quality education accessible to underprivileged children.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Village Teacher Training Initiative",
        year: 2023,
        description: "Trained 500+ teachers in modern teaching methodologies",
      },
      {
        title: "Digital Literacy Program",
        year: 2023,
        description: "Provided computer training to 2000+ students",
      },
    ],
    fundingType: "recipient",
    targetBeneficiaries: ["School Children 6-18", "Rural Teachers"],
    partnerHistory: ["UNICEF", "Global Fund for Education"],
    confidence: 92,
  },
  {
    id: "org-002",
    name: "Health for All Initiative",
    type: "Foundation",
    website: "https://healthforall.org",
    headquarters: "Maharashtra",
    region: "Western India",
    focusAreas: ["Health", "Environment"],
    mission:
      "Ensuring access to quality healthcare in underserved communities across India.",
    description:
      "Health for All Initiative operates mobile clinics and trains community health workers in rural Maharashtra and Gujarat. We focus on preventive care and health education.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Mobile Health Clinics",
        year: 2024,
        description: "Serving 10000+ patients annually across 50 villages",
      },
      {
        title: "Community Health Worker Training",
        year: 2023,
        description: "Trained 300+ local health workers",
      },
    ],
    fundingType: "mixed",
    targetBeneficiaries: ["Rural Communities", "Women & Children"],
    partnerHistory: ["WHO", "Gates Foundation"],
    confidence: 88,
  },
  {
    id: "org-003",
    name: "Green Earth Collective",
    type: "NGO",
    website: "https://greenearthcollective.in",
    headquarters: "Karnataka",
    region: "Southern India",
    focusAreas: ["Environment", "Livelihood"],
    mission:
      "Promoting sustainable livelihoods through environmental conservation.",
    description:
      "Green Earth Collective works on reforestation, organic farming, and sustainable tourism in Western Ghats. We engage local communities in conservation efforts.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Reforestation Program",
        year: 2024,
        description: "Planted 100000+ trees and protected 5000 hectares",
      },
      {
        title: "Organic Farming Collective",
        year: 2023,
        description: "Supporting 200+ farmers in sustainable agriculture",
      },
    ],
    fundingType: "recipient",
    targetBeneficiaries: ["Farmers", "Forest Communities"],
    partnerHistory: ["IUCN", "Rainforest Alliance"],
    confidence: 85,
  },
  {
    id: "org-004",
    name: "Tech Skills Academy",
    type: "Incubator",
    website: "https://techskillsacademy.com",
    headquarters: "Bangalore",
    region: "Southern India",
    focusAreas: ["Technology", "Livelihood"],
    mission:
      "Building tech talent from underrepresented communities through bootcamp and mentorship.",
    description:
      "Tech Skills Academy runs intensive coding bootcamps and provides job placement support. We have trained 2000+ developers from low-income backgrounds.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Full Stack Development Bootcamp",
        year: 2024,
        description: "85% job placement rate, 500+ students graduated",
      },
      {
        title: "Women in Tech Initiative",
        year: 2023,
        description: "30% female cohort with dedicated mentorship",
      },
    ],
    fundingType: "mixed",
    targetBeneficiaries: ["Youth 18-30", "Women Developers"],
    partnerHistory: ["Google", "Microsoft"],
    confidence: 90,
  },
  {
    id: "org-005",
    name: "ACIC Innovation Hub",
    type: "Incubator",
    website: "https://acicinnovation.org",
    headquarters: "Delhi",
    region: "Northern India",
    focusAreas: ["Technology", "Governance"],
    mission:
      "Accelerating social enterprises solving India's critical challenges through innovation.",
    description:
      "ACIC Innovation Hub supports 50+ social enterprises annually through mentorship, funding, and network access. We focus on scalable solutions for governance, education, and livelihood.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Accelerator Program",
        year: 2024,
        description: "Supporting 50+ social enterprises with $2M in funding",
      },
      {
        title: "Innovation Fellowship",
        year: 2023,
        description: "100+ fellows trained in social enterprise management",
      },
    ],
    fundingType: "provider",
    targetBeneficiaries: ["Social Entrepreneurs", "Startups"],
    partnerHistory: ["Omidyar Network", "World Economic Forum"],
    confidence: 91,
  },
  {
    id: "org-006",
    name: "Vocational Skills India",
    type: "NGO",
    website: "https://vocationalskillsindia.org",
    headquarters: "Andhra Pradesh",
    region: "Southern India",
    focusAreas: ["Livelihood", "Education"],
    mission:
      "Providing vocational training to youth for employment and entrepreneurship.",
    description:
      "Vocational Skills India runs training centers in rural Andhra Pradesh, offering courses in construction, hospitality, and healthcare. We have trained 10000+ youth.",
    verificationStatus: "unverified",
    projects: [
      {
        title: "Construction Skills Program",
        year: 2024,
        description: "Training 500+ construction workers with certification",
      },
      {
        title: "Healthcare Assistant Course",
        year: 2023,
        description: "80% placement rate among healthcare trainees",
      },
    ],
    fundingType: "recipient",
    targetBeneficiaries: ["Youth 16-30", "Rural Communities"],
    partnerHistory: ["NITI Aayog"],
    confidence: 72,
  },
  {
    id: "org-007",
    name: "Women Empowerment Network",
    type: "NGO",
    website: "https://womenempowermentnet.in",
    headquarters: "Rajasthan",
    region: "Western India",
    focusAreas: ["Livelihood", "Governance"],
    mission:
      "Empowering rural women through self-help groups and economic opportunities.",
    description:
      "WEN facilitates self-help groups across Rajasthan, providing microfinance, business training, and market linkages. We support 5000+ women entrepreneurs.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Self-Help Group Network",
        year: 2024,
        description: "Supporting 500+ SHGs with $5M in microfinance",
      },
      {
        title: "Women Entrepreneur Bootcamp",
        year: 2023,
        description: "Trained 1000+ women in business and financial literacy",
      },
    ],
    fundingType: "mixed",
    targetBeneficiaries: ["Rural Women", "Entrepreneurs"],
    partnerHistory: ["NABARD", "Acumen Fund"],
    confidence: 87,
  },
  {
    id: "org-008",
    name: "Youth Leadership Foundation",
    type: "Foundation",
    website: "https://youthleadership.org",
    headquarters: "Tamil Nadu",
    region: "Southern India",
    focusAreas: ["Education", "Governance"],
    mission:
      "Developing next-generation leaders through civic engagement and skills training.",
    description:
      "YLF runs leadership programs in schools, colleges, and communities across Tamil Nadu. We focus on youth civic engagement and social responsibility.",
    verificationStatus: "verified",
    projects: [
      {
        title: "School Leadership Program",
        year: 2024,
        description: "Engaging 10000+ school students in civic activities",
      },
      {
        title: "College Fellowship",
        year: 2023,
        description: "50+ college leaders selected as change agents",
      },
    ],
    fundingType: "provider",
    targetBeneficiaries: ["Youth 12-25", "Students"],
    partnerHistory: ["India Together", "Ashoka"],
    confidence: 84,
  },
  {
    id: "org-009",
    name: "Clean Water Foundation",
    type: "Foundation",
    website: "https://cleanwaterfoundation.org",
    headquarters: "Bihar",
    region: "Eastern India",
    focusAreas: ["Health", "Environment"],
    mission:
      "Ensuring access to safe drinking water and sanitation in rural communities.",
    description:
      "Clean Water Foundation builds and maintains water systems in rural Bihar, benefiting 50000+ people. We also provide hygiene education and community training.",
    verificationStatus: "verified",
    projects: [
      {
        title: "Water System Installation",
        year: 2024,
        description: "Built 200+ water systems benefiting 50000+ people",
      },
      {
        title: "Hygiene Education Program",
        year: 2023,
        description: "Trained 2000+ community health volunteers",
      },
    ],
    fundingType: "recipient",
    targetBeneficiaries: ["Rural Communities", "Women & Children"],
    partnerHistory: ["Water Aid", "USAID"],
    confidence: 89,
  },
  {
    id: "org-010",
    name: "Digital Innovation Lab",
    type: "Incubator",
    website: "https://digitalinnovationlab.in",
    headquarters: "Hyderabad",
    region: "Southern India",
    focusAreas: ["Technology", "Governance"],
    mission:
      "Enabling digital solutions for social good through innovation and collaboration.",
    description:
      "DIL works with social enterprises to develop tech solutions for governance, healthcare, and education. We provide technical support, funding, and market linkages.",
    verificationStatus: "pending",
    projects: [
      {
        title: "Social Tech Accelerator",
        year: 2024,
        description: "Supporting 30+ tech-based social enterprises",
      },
      {
        title: "Civic Tech Initiative",
        year: 2023,
        description: "Developing digital solutions for local governance",
      },
    ],
    fundingType: "provider",
    targetBeneficiaries: ["Social Entrepreneurs", "Communities"],
    partnerHistory: ["Google.org", "Facebook Social Impact"],
    confidence: 79,
  },
];

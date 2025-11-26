import { FocusArea } from "@shared/api";

export const mockFocusAreas: FocusArea[] = [
  {
    id: "fa-001",
    name: "Education",
    icon: "book",
    description: "Education and learning programs",
  },
  {
    id: "fa-002",
    name: "Health",
    icon: "heart",
    description: "Healthcare and wellness initiatives",
  },
  {
    id: "fa-003",
    name: "Environment",
    icon: "leaf",
    description: "Climate and environmental conservation",
  },
  {
    id: "fa-004",
    name: "Technology",
    icon: "code",
    description: "Technology and digital innovation",
  },
  {
    id: "fa-005",
    name: "Livelihood",
    icon: "briefcase",
    description: "Economic development and employment",
  },
  {
    id: "fa-006",
    name: "Governance",
    icon: "building",
    description: "Governance and policy advocacy",
  },
  {
    id: "fa-007",
    name: "Water & Sanitation",
    icon: "droplet",
    description: "Water and sanitation access",
  },
  {
    id: "fa-008",
    name: "Agriculture",
    icon: "sprout",
    description: "Agricultural development and sustainability",
  },
  {
    id: "fa-009",
    name: "Women Empowerment",
    icon: "star",
    description: "Gender equality and women rights",
  },
  {
    id: "fa-010",
    name: "Disability",
    icon: "accessibility",
    description: "Disability rights and accessibility",
  },
];

export const focusAreaMap = new Map(mockFocusAreas.map((fa) => [fa.id, fa]));

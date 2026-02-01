/**
 * Mock Organizations for Dashboard
 * Static data only — used to render UI without real data.
 */

export interface DashboardOrganization {
    id: string;
    name: string;
    type: "NGO" | "CSR" | "Incubator";
    focusArea: string;
    geography: string;
    fitScore: number;
    createdAt: string;
    reason: string;
}

export const mockDashboardOrganizations: DashboardOrganization[] = [
    {
        id: "org-001",
        name: "Shakti Rural Foundation",
        type: "NGO",
        focusArea: "Education",
        geography: "Rajasthan",
        fitScore: 91,
        createdAt: "2026-01-30T10:30:00Z",
        reason: "Matches your focus area and geography",
    },
    {
        id: "org-002",
        name: "Tata Social Initiatives",
        type: "CSR",
        focusArea: "Livelihood",
        geography: "Maharashtra",
        fitScore: 87,
        createdAt: "2026-01-29T14:15:00Z",
        reason: "Strong alignment with your mission",
    },
    {
        id: "org-003",
        name: "IIM Ventures Accelerator",
        type: "Incubator",
        focusArea: "Technology",
        geography: "Karnataka",
        fitScore: 84,
        createdAt: "2026-01-28T09:00:00Z",
        reason: "Active in your region",
    },
    {
        id: "org-004",
        name: "Green Horizon Trust",
        type: "NGO",
        focusArea: "Environment",
        geography: "Kerala",
        fitScore: 76,
        createdAt: "2026-01-25T16:45:00Z",
        reason: "Similar focus area",
    },
    {
        id: "org-005",
        name: "Infosys Foundation",
        type: "CSR",
        focusArea: "Health",
        geography: "Pan-India",
        fitScore: 73,
        createdAt: "2026-01-20T11:30:00Z",
        reason: "Operates in your target regions",
    },
    {
        id: "org-006",
        name: "Startup Odisha",
        type: "Incubator",
        focusArea: "Governance",
        geography: "Odisha",
        fitScore: 64,
        createdAt: "2026-01-18T08:00:00Z",
        reason: "Potential collaboration opportunity",
    },
    {
        id: "org-007",
        name: "Mahindra Rise CSR",
        type: "CSR",
        focusArea: "Education",
        geography: "Gujarat",
        fitScore: 52,
        createdAt: "2026-01-15T13:20:00Z",
        reason: "Partial focus area overlap",
    },
    {
        id: "org-008",
        name: "Nav Jeevan Samiti",
        type: "NGO",
        focusArea: "Health",
        geography: "Bihar",
        fitScore: 47,
        createdAt: "2026-01-10T10:00:00Z",
        reason: "Regional presence match",
    },
    {
        id: "org-009",
        name: "Atal Incubation Centre",
        type: "Incubator",
        focusArea: "Technology",
        geography: "Delhi NCR",
        fitScore: 38,
        createdAt: "2026-01-05T15:30:00Z",
        reason: "Related sector activity",
    },
    {
        id: "org-010",
        name: "Rural Development Forum",
        type: "NGO",
        focusArea: "Livelihood",
        geography: "Uttar Pradesh",
        fitScore: 29,
        createdAt: "2025-12-28T09:45:00Z",
        reason: "Limited alignment",
    },
];

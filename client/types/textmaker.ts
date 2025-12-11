export interface ProcessingJob {
    id: string;
    type: 'text-extraction' | 'powerpoint' | 'research-paper' | 'dashboard';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    fileName?: string;
    result?: string | object;
    createdAt: Date;
}

export interface ExtractedData {
    summary: string;
    keyPoints: string[];
    entities: {
        people: string[];
        organizations: string[];
        locations: string[];
        dates: string[];
        amounts: string[];
    };
    keywords: Array<{
        term: string;
        frequency: number;
        relevance: number;
    }>;
    tables: Array<{
        title: string;
        headers: string[];
        rows: string[][];
    }>;
    relationships: Array<{
        subject: string;
        predicate: string;
        object: string;
    }>;
}

export interface PowerPointConfig {
    type: 'deep' | 'summarized';
    theme: 'corporate' | 'creative' | 'minimal' | 'vibrant' | 'ai-generated';
    includeImages: boolean;
    slideCount?: number;
}

export interface SlideData {
    id: number;
    type: 'title' | 'content' | 'chart' | 'two-column' | 'agenda';
    title: string;
    subtitle?: string;
    content?: string[];
    leftContent?: string[];
    rightContent?: string[];
    chartType?: string;
    data?: {
        labels: string[];
        values: number[];
    };
    layout: string;
}

export interface ResearchPaperConfig {
    format: 'ieee' | 'apa' | 'mla';
    sections: string[];
    citations: Citation[];
    includeAbstract: boolean;
    includeTables: boolean;
}

export interface Citation {
    id: string;
    type: 'journal' | 'conference' | 'book' | 'website';
    authors: string[];
    title: string;
    journal?: string;
    year: number;
    pages?: string;
    doi?: string;
    url?: string;
}

export interface DashboardConfig {
    chartTypes: string[];
    layout: 'grid' | 'flow';
    interactivity: boolean;
    exportFormat: 'powerbi' | 'pdf' | 'interactive';
}

export interface ProjectData {
    id: string;
    name: string;
    description: string;
    extractedData?: ExtractedData;
    generatedOutputs: {
        powerpoint?: string;
        researchPaper?: string;
        dashboard?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

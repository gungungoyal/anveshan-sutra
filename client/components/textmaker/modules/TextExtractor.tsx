import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/FileUpload';
import ProcessingQueue from '@/components/ProcessingQueue';
import { 
  FileText, 
  Brain, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign,
  Hash,
  Network,
  Table,
  Download,
  Eye,
  Filter,
  Search,
  Zap
} from 'lucide-react';
import { ExtractedData, ProcessingJob } from '@/types';

export default function TextExtractor() {
  const [files, setFiles] = useState<File[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingMode, setProcessingMode] = useState<'quick' | 'deep'>('quick');
  const [filters, setFilters] = useState({
    entityTypes: {
      people: true,
      organizations: true,
      locations: true,
      dates: true,
      amounts: true
    },
    keywordMinFrequency: 3,
    relevanceThreshold: 70
  });

  // Mock extracted data for demonstration
  const mockExtractedData: ExtractedData = {
    summary: "This quarterly report shows strong financial performance with 15% revenue growth driven by new product launches and market expansion. Key achievements include entering the Asian market, launching three new products, and increasing the sales team by 40%. However, challenges remain with supply chain delays and increased competition affecting margins.",
    keyPoints: [
      "Revenue increased by 15% compared to previous quarter",
      "Successfully launched three new products in Q4",
      "Expanded operations into Asian markets",
      "Sales team grew by 40% to support expansion",
      "Supply chain delays impacted delivery times",
      "Increased competition pressuring profit margins"
    ],
    entities: {
      people: ["John Smith (CEO)", "Sarah Johnson (CFO)", "Michael Chen (VP Sales)", "Dr. Emily Rodriguez"],
      organizations: ["Tesla Inc.", "Microsoft Corporation", "Harvard University", "Goldman Sachs"],
      locations: ["New York", "San Francisco", "Tokyo", "London", "Singapore"],
      dates: ["Q4 2024", "January 15, 2024", "March 2024", "December 2023"],
      amounts: ["$2.5M revenue", "$500K profit", "15% growth", "40% increase"]
    },
    keywords: [
      { term: "revenue", frequency: 12, relevance: 95 },
      { term: "growth", frequency: 8, relevance: 88 },
      { term: "market", frequency: 15, relevance: 82 },
      { term: "product", frequency: 10, relevance: 79 },
      { term: "sales", frequency: 7, relevance: 75 },
      { term: "expansion", frequency: 6, relevance: 72 }
    ],
    tables: [
      {
        title: "Quarterly Financial Summary",
        headers: ["Metric", "Q3 2024", "Q4 2024", "Change"],
        rows: [
          ["Revenue", "$2.2M", "$2.5M", "+15%"],
          ["Profit", "$440K", "$500K", "+14%"],
          ["Customers", "1,200", "1,450", "+21%"],
          ["Market Share", "12%", "14%", "+2%"]
        ]
      },
      {
        title: "Product Performance",
        headers: ["Product", "Units Sold", "Revenue", "Growth"],
        rows: [
          ["Product A", "850", "$850K", "+25%"],
          ["Product B", "650", "$975K", "+18%"],
          ["Product C", "400", "$680K", "+12%"]
        ]
      }
    ],
    relationships: [
      { subject: "Company", predicate: "expanded into", object: "Asian market" },
      { subject: "Sales team", predicate: "increased by", object: "40%" },
      { subject: "Supply chain delays", predicate: "impacted", object: "delivery times" },
      { subject: "New products", predicate: "contributed to", object: "revenue growth" }
    ]
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleProcess = () => {
    const newJob: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text-extraction',
      status: 'processing',
      progress: 0,
      fileName: files[0]?.name,
      createdAt: new Date()
    };

    setProcessingJobs(prev => [...prev, newJob]);

    // Simulate processing
    setTimeout(() => {
      setProcessingJobs(prev => 
        prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', progress: 100 }
            : job
        )
      );
      setExtractedData(mockExtractedData);
    }, 3000);
  };

  const filteredKeywords = extractedData?.keywords.filter(
    keyword => 
      keyword.frequency >= filters.keywordMinFrequency &&
      keyword.relevance >= filters.relevanceThreshold
  ) || [];

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'people': return <Users className="w-4 h-4" />;
      case 'organizations': return <Brain className="w-4 h-4" />;
      case 'locations': return <MapPin className="w-4 h-4" />;
      case 'dates': return <Calendar className="w-4 h-4" />;
      case 'amounts': return <DollarSign className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Module 1</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Text Extraction & Summarization</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract insights from documents with AI-powered analysis, entity recognition, and smart summarization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
            <FileUpload 
              onFileSelect={handleFileSelect}
              acceptedTypes={['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg']}
              maxFiles={3}
              maxSize={10}
            />
          </Card>

          {/* Processing Options */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Options</h2>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Processing Mode
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${
                      processingMode === 'quick' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setProcessingMode('quick')}
                  >
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">Quick Summary</h3>
                        <p className="text-sm text-gray-500">Fast processing (5-10s)</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-4 cursor-pointer transition-all ${
                      processingMode === 'deep' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setProcessingMode('deep')}
                  >
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">Deep Extraction</h3>
                        <p className="text-sm text-gray-500">Thorough analysis (30-60s)</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Button 
                onClick={handleProcess}
                disabled={files.length === 0}
                className="w-full"
                size="lg"
              >
                <Brain className="w-4 h-4 mr-2" />
                Start AI Processing
              </Button>
            </div>
          </Card>

          {/* Processing Queue */}
          {processingJobs.length > 0 && (
            <ProcessingQueue 
              jobs={processingJobs}
              onDownload={(jobId) => console.log('Download:', jobId)}
              onPreview={(jobId) => console.log('Preview:', jobId)}
            />
          )}
        </div>

        {/* Right Column - Filters */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Filter className="w-5 h-5 inline mr-2" />
              Result Filters
            </h2>
            
            <div className="space-y-6">
              {/* Entity Type Filters */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Entity Types
                </Label>
                <div className="space-y-3">
                  {Object.entries(filters.entityTypes).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getEntityIcon(type)}
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setFilters(prev => ({
                            ...prev,
                            entityTypes: { ...prev.entityTypes, [type]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword Frequency */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Min Keyword Frequency: {filters.keywordMinFrequency}
                </Label>
                <Slider
                  value={[filters.keywordMinFrequency]}
                  onValueChange={([value]) =>
                    setFilters(prev => ({ ...prev, keywordMinFrequency: value }))
                  }
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Relevance Threshold */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Relevance Threshold: {filters.relevanceThreshold}%
                </Label>
                <Slider
                  value={[filters.relevanceThreshold]}
                  onValueChange={([value]) =>
                    setFilters(prev => ({ ...prev, relevanceThreshold: value }))
                  }
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          {extractedData && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Extraction Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Key Points</span>
                  <Badge variant="secondary">{extractedData.keyPoints.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Keywords</span>
                  <Badge variant="secondary">{filteredKeywords.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Entities</span>
                  <Badge variant="secondary">
                    {Object.values(extractedData.entities).flat().length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tables</span>
                  <Badge variant="secondary">{extractedData.tables.length}</Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Results */}
      {extractedData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Extraction Results</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="relationships">Relations</TabsTrigger>
              <TabsTrigger value="keypoints">Key Points</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Summary</h3>
                <p className="text-gray-700 leading-relaxed">{extractedData.summary}</p>
              </div>
            </TabsContent>

            <TabsContent value="entities" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(extractedData.entities).map(([type, items]) => {
                  if (!filters.entityTypes[type as keyof typeof filters.entityTypes]) return null;
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center space-x-2 mb-3">
                        {getEntityIcon(type)}
                        <h4 className="font-semibold text-gray-900 capitalize">{type}</h4>
                        <Badge variant="outline">{items.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Keywords & Frequency</h3>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input placeholder="Search keywords..." className="w-64" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKeywords.map((keyword, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{keyword.term}</span>
                        <Badge variant="outline">{keyword.frequency}x</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Relevance:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${keyword.relevance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{keyword.relevance}%</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tables" className="mt-6">
              <div className="space-y-6">
                {extractedData.tables.map((table, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{table.title}</h4>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            {table.headers.map((header, headerIndex) => (
                              <th key={headerIndex} className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-gray-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="relationships" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detected Relationships</h3>
                <div className="space-y-3">
                  {extractedData.relationships.map((relation, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-blue-600">{relation.subject}</span>
                        <Network className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{relation.predicate}</span>
                        <Network className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-green-600">{relation.object}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keypoints" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Points</h3>
                <div className="space-y-3">
                  {extractedData.keyPoints.map((point, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                        <p className="text-gray-700 leading-relaxed">{point}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
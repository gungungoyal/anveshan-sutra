import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';
import ProcessingQueue from '@/components/ProcessingQueue';
import { 
  FileImage, 
  BookOpen, 
  Quote, 
  FileText, 
  Plus,
  Trash2,
  Eye,
  Download,
  Settings,
  GraduationCap,
  Search,
  Link,
  Calendar,
  User
} from 'lucide-react';
import { ResearchPaperConfig, Citation, ProcessingJob } from '@/types';

export default function ResearchPaperGenerator() {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [config, setConfig] = useState<ResearchPaperConfig>({
    format: 'ieee',
    sections: ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion'],
    citations: [],
    includeAbstract: true,
    includeTables: true
  });
  const [newCitation, setNewCitation] = useState<Partial<Citation>>({
    type: 'journal',
    authors: [],
    title: '',
    year: new Date().getFullYear()
  });
  const [authorInput, setAuthorInput] = useState('');

  const formats = [
    {
      id: 'ieee',
      name: 'IEEE',
      description: 'Engineering & Computer Science',
      features: ['Two-column layout', 'Numbered citations', 'Technical focus'],
      example: '[1] J. Smith, "Title," Journal, vol. 1, no. 2, pp. 3-4, 2024.'
    },
    {
      id: 'apa',
      name: 'APA',
      description: 'Psychology & Social Sciences',
      features: ['Single column', 'Author-year citations', 'Running head'],
      example: 'Smith, J. (2024). Title. Journal, 1(2), 3-4.'
    },
    {
      id: 'mla',
      name: 'MLA',
      description: 'Humanities & Literature',
      features: ['Works cited', 'In-text citations', 'No abstract'],
      example: 'Smith, John. "Title." Journal, vol. 1, no. 2, 2024, pp. 3-4.'
    }
  ];

  const sectionOptions = [
    { id: 'abstract', name: 'Abstract', required: false },
    { id: 'introduction', name: 'Introduction', required: true },
    { id: 'literature-review', name: 'Literature Review', required: false },
    { id: 'methodology', name: 'Methodology', required: false },
    { id: 'results', name: 'Results', required: false },
    { id: 'discussion', name: 'Discussion', required: false },
    { id: 'conclusion', name: 'Conclusion', required: true },
    { id: 'acknowledgments', name: 'Acknowledgments', required: false },
    { id: 'appendix', name: 'Appendix', required: false }
  ];

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const addAuthor = () => {
    if (authorInput.trim()) {
      setNewCitation(prev => ({
        ...prev,
        authors: [...(prev.authors || []), authorInput.trim()]
      }));
      setAuthorInput('');
    }
  };

  const removeAuthor = (index: number) => {
    setNewCitation(prev => ({
      ...prev,
      authors: prev.authors?.filter((_, i) => i !== index) || []
    }));
  };

  const addCitation = () => {
    if (newCitation.title && newCitation.authors && newCitation.authors.length > 0) {
      const citation: Citation = {
        id: Math.random().toString(36).substr(2, 9),
        type: newCitation.type as Citation['type'],
        authors: newCitation.authors,
        title: newCitation.title,
        journal: newCitation.journal,
        year: newCitation.year || new Date().getFullYear(),
        pages: newCitation.pages,
        doi: newCitation.doi,
        url: newCitation.url
      };

      setConfig(prev => ({
        ...prev,
        citations: [...prev.citations, citation]
      }));

      // Reset form
      setNewCitation({
        type: 'journal',
        authors: [],
        title: '',
        year: new Date().getFullYear()
      });
    }
  };

  const removeCitation = (citationId: string) => {
    setConfig(prev => ({
      ...prev,
      citations: prev.citations.filter(c => c.id !== citationId)
    }));
  };

  const handleGenerate = () => {
    const newJob: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'research-paper',
      status: 'processing',
      progress: 0,
      fileName: files[0]?.name || 'research-paper.docx',
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
    }, 5000);
  };

  const toggleSection = (sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const formatCitationPreview = (citation: Citation) => {
    const authorsStr = citation.authors.join(', ');
    
    switch (config.format) {
      case 'ieee':
        return `${authorsStr}, "${citation.title}," ${citation.journal || 'Journal'}, ${citation.year}.`;
      case 'apa':
        return `${authorsStr} (${citation.year}). ${citation.title}. ${citation.journal || 'Journal'}.`;
      case 'mla':
        return `${authorsStr}. "${citation.title}." ${citation.journal || 'Journal'}, ${citation.year}.`;
      default:
        return citation.title;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
          <FileImage className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">Module 3</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Research Paper Generator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate properly formatted academic papers with automatic citations and bibliography management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input & Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Input */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Research Content</h2>
            
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="extracted">Use Extracted Data</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paper-title">Paper Title</Label>
                      <Input
                        id="paper-title"
                        placeholder="Enter your research paper title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author-name">Author(s)</Label>
                      <Input
                        id="author-name"
                        placeholder="Your name and affiliation"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="research-content">Research Content</Label>
                    <Textarea
                      id="research-content"
                      placeholder="Enter your research findings, methodology, results, and analysis..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={10}
                      className="resize-none mt-1"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Include your research question, methodology, findings, and conclusions
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['.pdf', '.docx', '.txt']}
                  maxFiles={3}
                  maxSize={10}
                />
              </TabsContent>

              <TabsContent value="extracted" className="mt-4">
                <Card className="p-4 border-dashed border-2 border-gray-300">
                  <div className="text-center space-y-3">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-900">No extracted data available</h3>
                      <p className="text-sm text-gray-500">
                        Use Module 1 (Text Extraction) first to extract research data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Go to Text Extraction
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Format Configuration */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <Settings className="w-5 h-5 inline mr-2" />
              Paper Format
            </h2>
            
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Citation Format
                </Label>
                <RadioGroup
                  value={config.format}
                  onValueChange={(value: 'ieee' | 'apa' | 'mla') => 
                    setConfig(prev => ({ ...prev, format: value }))
                  }
                >
                  <div className="space-y-3">
                    {formats.map((format) => (
                      <Card key={format.id} className={`p-4 cursor-pointer transition-all ${
                        config.format === format.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={format.id} id={format.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Label htmlFor={format.id} className="font-semibold cursor-pointer">
                                {format.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {format.description}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {format.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                              {format.example}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Section Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Paper Sections
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {sectionOptions.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {section.name}
                        </span>
                        {section.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <Switch
                        checked={config.sections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                        disabled={section.required}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-gray-700">Include Abstract</Label>
                    <p className="text-sm text-gray-500">Add a summary section at the beginning</p>
                  </div>
                  <Switch
                    checked={config.includeAbstract}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, includeAbstract: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-gray-700">Include Tables</Label>
                    <p className="text-sm text-gray-500">Auto-format detected data tables</p>
                  </div>
                  <Switch
                    checked={config.includeTables}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, includeTables: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Citation Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <Quote className="w-5 h-5 inline mr-2" />
              Citations & References
            </h2>
            
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add">Add Citation</TabsTrigger>
                <TabsTrigger value="import">Import BibTeX</TabsTrigger>
                <TabsTrigger value="search">Scholar Search</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="citation-type">Citation Type</Label>
                      <Select
                        value={newCitation.type}
                        onValueChange={(value: Citation['type']) =>
                          setNewCitation(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="journal">Journal Article</SelectItem>
                          <SelectItem value="conference">Conference Paper</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="citation-year">Year</Label>
                      <Input
                        id="citation-year"
                        type="number"
                        value={newCitation.year}
                        onChange={(e) => setNewCitation(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="citation-title">Title</Label>
                    <Input
                      id="citation-title"
                      value={newCitation.title}
                      onChange={(e) => setNewCitation(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter the title of the work"
                    />
                  </div>

                  <div>
                    <Label>Authors</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        placeholder="Enter author name"
                        onKeyPress={(e) => e.key === 'Enter' && addAuthor()}
                      />
                      <Button onClick={addAuthor} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {newCitation.authors && newCitation.authors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newCitation.authors.map((author, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{author}</span>
                            <button
                              onClick={() => removeAuthor(index)}
                              className="ml-1 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="citation-journal">Journal/Venue</Label>
                      <Input
                        id="citation-journal"
                        value={newCitation.journal || ''}
                        onChange={(e) => setNewCitation(prev => ({ ...prev, journal: e.target.value }))}
                        placeholder="Journal or conference name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="citation-pages">Pages</Label>
                      <Input
                        id="citation-pages"
                        value={newCitation.pages || ''}
                        onChange={(e) => setNewCitation(prev => ({ ...prev, pages: e.target.value }))}
                        placeholder="e.g., 123-145"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="citation-doi">DOI</Label>
                      <Input
                        id="citation-doi"
                        value={newCitation.doi || ''}
                        onChange={(e) => setNewCitation(prev => ({ ...prev, doi: e.target.value }))}
                        placeholder="10.1000/xyz123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="citation-url">URL</Label>
                      <Input
                        id="citation-url"
                        value={newCitation.url || ''}
                        onChange={(e) => setNewCitation(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <Button onClick={addCitation} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Citation
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="import" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Import BibTeX File</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a .bib file to automatically import all citations
                    </p>
                    <Button variant="outline">
                      Choose BibTeX File
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input placeholder="Search Google Scholar..." className="flex-1" />
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Search for academic papers and automatically import citation information
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Citations List */}
            {config.citations.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Added Citations ({config.citations.length})</h4>
                  <Badge variant="outline">{config.format.toUpperCase()} Format</Badge>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {config.citations.map((citation) => (
                    <Card key={citation.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-mono text-gray-700 leading-relaxed">
                            {formatCitationPreview(citation)}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {citation.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {citation.year}
                            </Badge>
                            {citation.doi && (
                              <Badge variant="outline" className="text-xs">
                                <Link className="w-3 h-3 mr-1" />
                                DOI
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCitation(citation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Button 
            onClick={handleGenerate}
            disabled={textInput.trim() === '' && files.length === 0}
            className="w-full"
            size="lg"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Generate Research Paper
          </Button>

          {/* Processing Queue */}
          {processingJobs.length > 0 && (
            <ProcessingQueue 
              jobs={processingJobs}
              onDownload={(jobId) => console.log('Download:', jobId)}
              onPreview={(jobId) => console.log('Preview:', jobId)}
            />
          )}
        </div>

        {/* Right Column - Preview & Stats */}
        <div className="space-y-6">
          {/* Paper Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paper Configuration</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Format</span>
                <Badge variant="secondary">{config.format.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sections</span>
                <Badge variant="secondary">{config.sections.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Citations</span>
                <Badge variant="secondary">{config.citations.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Abstract</span>
                <Badge variant={config.includeAbstract ? 'default' : 'secondary'}>
                  {config.includeAbstract ? 'Included' : 'Excluded'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tables</span>
                <Badge variant={config.includeTables ? 'default' : 'secondary'}>
                  {config.includeTables ? 'Auto-format' : 'Manual'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Format Guidelines */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Format Guidelines
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              {config.format === 'ieee' && (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Two-column layout with 10pt font</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Numbered citations [1], [2], etc.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Figures and tables must be referenced</span>
                  </div>
                </>
              )}
              
              {config.format === 'apa' && (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>12pt Times New Roman, double-spaced</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Author-year citations (Smith, 2024)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Running head on every page</span>
                  </div>
                </>
              )}
              
              {config.format === 'mla' && (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>12pt Times New Roman, double-spaced</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>In-text citations (Author Page#)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Works Cited page at the end</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Word Helper */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Word Helper
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Need help formatting in Microsoft Word? Get step-by-step tutorials.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Add Page Numbers
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Create Two Columns
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Insert Citations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Format References
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

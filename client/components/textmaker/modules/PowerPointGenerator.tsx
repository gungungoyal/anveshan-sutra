import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FileUpload from '@/components/FileUpload';
import ProcessingQueue from '@/components/ProcessingQueue';
import { 
  Presentation, 
  Palette, 
  Image, 
  Layers, 
  Sparkles,
  Eye,
  Download,
  Settings,
  FileText,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { PowerPointConfig, ProcessingJob, SlideData } from '@/types';

interface Theme {
  id: 'corporate' | 'creative' | 'minimal' | 'vibrant' | 'ai-generated';
  name: string;
  description: string;
  colors: string[];
  preview: string;
}

export default function PowerPointGenerator() {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [config, setConfig] = useState<PowerPointConfig>({
    type: 'deep',
    theme: 'corporate',
    includeImages: true,
    slideCount: 10
  });
  const [previewSlides, setPreviewSlides] = useState<SlideData[]>([]);

  const themes: Theme[] = [
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional blue and gray theme',
      colors: ['#1e40af', '#64748b', '#f8fafc'],
      preview: 'bg-gradient-to-br from-blue-600 to-blue-800'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Vibrant purple and blue theme',
      colors: ['#7c3aed', '#2563eb', '#f0f9ff'],
      preview: 'bg-gradient-to-br from-purple-600 to-blue-600'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean black and white theme',
      colors: ['#000000', '#6b7280', '#ffffff'],
      preview: 'bg-gradient-to-br from-gray-900 to-gray-600'
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Energetic orange and blue theme',
      colors: ['#ea580c', '#2563eb', '#fef3c7'],
      preview: 'bg-gradient-to-br from-orange-500 to-blue-500'
    },
    {
      id: 'ai-generated',
      name: 'AI Generated',
      description: 'Custom theme based on content',
      colors: ['#10b981', '#8b5cf6', '#f3e8ff'],
      preview: 'bg-gradient-to-br from-emerald-500 to-purple-500'
    }
  ];

  const mockSlides: SlideData[] = [
    {
      id: 1,
      type: 'title',
      title: 'Quarterly Business Review',
      subtitle: 'Q4 2024 Performance Analysis',
      layout: 'title-slide'
    },
    {
      id: 2,
      type: 'agenda',
      title: 'Agenda',
      content: [
        'Executive Summary',
        'Financial Performance',
        'Market Analysis',
        'Key Achievements',
        'Challenges & Solutions',
        'Future Outlook'
      ],
      layout: 'bullet-list'
    },
    {
      id: 3,
      type: 'content',
      title: 'Executive Summary',
      content: [
        '15% revenue growth in Q4 2024',
        'Successful expansion into Asian markets',
        'Three new product launches',
        'Sales team increased by 40%'
      ],
      layout: 'bullet-list'
    },
    {
      id: 4,
      type: 'chart',
      title: 'Revenue Growth Trend',
      chartType: 'line',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [2000000, 2200000, 2100000, 2500000]
      },
      layout: 'chart-focus'
    },
    {
      id: 5,
      type: 'two-column',
      title: 'Market Analysis',
      leftContent: [
        'Market Share: 14% (+2%)',
        'Customer Base: 1,450 (+21%)',
        'Geographic Expansion: 3 new regions'
      ],
      rightContent: [
        'Competitive Position: Strong',
        'Brand Recognition: Improved',
        'Customer Satisfaction: 94%'
      ],
      layout: 'two-column'
    }
  ];

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleGenerate = () => {
    const newJob: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'powerpoint',
      status: 'processing',
      progress: 0,
      fileName: files[0]?.name || 'text-input.txt',
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
      setPreviewSlides(mockSlides);
    }, 4000);
  };

  const renderSlidePreview = (slide: SlideData) => {
    const selectedTheme = themes.find(t => t.id === config.theme);
    
    return (
      <Card key={slide.id} className="p-4 aspect-video bg-white shadow-lg">
        <div className={`h-full rounded-lg p-6 text-white ${selectedTheme?.preview}`}>
          {slide.type === 'title' && (
            <div className="flex flex-col justify-center h-full text-center">
              <h1 className="text-2xl font-bold mb-2">{slide.title}</h1>
              <p className="text-lg opacity-90">{slide.subtitle}</p>
            </div>
          )}
          
          {slide.type === 'content' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
              <ul className="space-y-2">
                {slide.content?.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {slide.type === 'chart' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 h-32 flex items-center justify-center">
                <BarChart3 className="w-16 h-16 opacity-70" />
              </div>
            </div>
          )}
          
          {slide.type === 'two-column' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-1">
                    {slide.leftContent?.map((item: string, index: number) => (
                      <li key={index} className="text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1">
                    {slide.rightContent?.map((item: string, index: number) => (
                      <li key={index} className="text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {slide.type === 'agenda' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
              <div className="grid grid-cols-2 gap-2">
                {slide.content?.map((item: string, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="mr-2">{index + 1}.</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center">
          <Badge variant="outline" className="text-xs">
            Slide {slide.id}
          </Badge>
        </div>
      </Card>

    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
          <Presentation className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Module 2</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">PowerPoint Generator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create professional presentations automatically from your content with AI-powered design and layout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input & Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Source */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Source</h2>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="extracted">Use Extracted Data</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['.pdf', '.docx', '.txt']}
                  maxFiles={1}
                  maxSize={5}
                />
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                  <Label htmlFor="text-input">Enter your content</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Paste your content here or describe what you want to present..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    Tip: Include key points, data, and any specific topics you want to cover
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="extracted" className="mt-4">
                <Card className="p-4 border-dashed border-2 border-gray-300">
                  <div className="text-center space-y-3">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-900">No extracted data available</h3>
                      <p className="text-sm text-gray-500">
                        Use Module 1 (Text Extraction) first to extract data from documents
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

          {/* Presentation Configuration */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <Settings className="w-5 h-5 inline mr-2" />
              Presentation Settings
            </h2>
            
            <div className="space-y-6">
              {/* Presentation Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Presentation Type
                </Label>
                <RadioGroup
                  value={config.type}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, type: value as 'deep' | 'summarized' }))
                  }
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Card className={`p-4 cursor-pointer transition-all ${
                      config.type === 'deep' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deep" id="deep" />
                        <div>
                          <Label htmlFor="deep" className="font-medium cursor-pointer">
                            Deep Presentation
                          </Label>
                          <p className="text-sm text-gray-500">10-15 detailed slides</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className={`p-4 cursor-pointer transition-all ${
                      config.type === 'summarized' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="summarized" id="summarized" />
                        <div>
                          <Label htmlFor="summarized" className="font-medium cursor-pointer">
                            Summarized
                          </Label>
                          <p className="text-sm text-gray-500">5-8 concise slides</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Slide Count */}
              {config.type === 'deep' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Target Slide Count: {config.slideCount}
                  </Label>
                  <Slider
                    value={[config.slideCount || 10]}
                    onValueChange={([value]) =>
                      setConfig(prev => ({ ...prev, slideCount: value }))
                    }
                    max={20}
                    min={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>8 slides</span>
                    <span>20 slides</span>
                  </div>
                </div>
              )}

              {/* Include Images */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-gray-600" />
                  <div>
                    <Label className="font-medium text-gray-700">Include Images</Label>
                    <p className="text-sm text-gray-500">Add relevant images from Unsplash</p>
                  </div>
                </div>
                <Switch
                  checked={config.includeImages}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, includeImages: checked }))
                  }
                />
              </div>
            </div>
          </Card>

          {/* Theme Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <Palette className="w-5 h-5 inline mr-2" />
              Theme Selection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`p-4 cursor-pointer transition-all ${
                    config.theme === theme.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, theme: theme.id }))}
                >
                  <div className="space-y-3">
                    <div className={`h-16 rounded-lg ${theme.preview} flex items-center justify-center`}>
                      <Presentation className="w-8 h-8 text-white opacity-80" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                      <p className="text-sm text-gray-500">{theme.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {theme.id === 'ai-generated' && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Powered
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Button 
            onClick={handleGenerate}
            disabled={files.length === 0 && textInput.trim() === ''}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Presentation
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
          {/* Quick Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Slides</span>
                <Badge variant="secondary">
                  {config.type === 'deep' ? `${config.slideCount}` : '5-8'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing Time</span>
                <Badge variant="secondary">~30-45s</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Theme</span>
                <Badge variant="secondary">
                  {themes.find(t => t.id === config.theme)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Images</span>
                <Badge variant={config.includeImages ? 'default' : 'secondary'}>
                  {config.includeImages ? 'Included' : 'Text Only'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Lightbulb className="w-5 h-5 inline mr-.
2" />
              Pro Tips
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Include key data points and statistics for better charts</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Mention your target audience for appropriate tone</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Deep presentations work best for detailed analysis</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>AI-generated themes adapt to your content automatically</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Slide Preview */}
      {previewSlides.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Presentation Preview</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Full Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PPTX
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewSlides.map((slide) => renderSlidePreview(slide))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {previewSlides.length} slides • Click "Full Preview" to see the complete presentation
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

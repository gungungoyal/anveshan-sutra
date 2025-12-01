import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProcessingQueue from '@/components/ProcessingQueue';
import { 
  FileText, 
  Presentation, 
  FileImage, 
  BarChart3,
  ArrowRight,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { ProcessingJob } from '@/types';

export default function Dashboard() {
  const [recentJobs] = useState<ProcessingJob[]>([
    {
      id: '1',
      type: 'text-extraction',
      status: 'completed',
      progress: 100,
      fileName: 'quarterly-report.pdf',
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      type: 'powerpoint',
      status: 'processing',
      progress: 65,
      fileName: 'market-analysis.docx',
      createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
    },
    {
      id: '3',
      type: 'dashboard',
      status: 'pending',
      progress: 0,
      fileName: 'sales-data.csv',
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    }
  ]);

  const modules = [
    {
      id: 'text-extraction',
      name: 'Text Extraction & Summarization',
      description: 'Extract insights from documents with AI-powered analysis',
      icon: FileText,
      path: '/text-extraction',
      color: 'from-blue-500 to-blue-600',
      features: ['OCR Processing', 'Entity Recognition', 'Smart Summarization', 'Keyword Extraction'],
      badge: 'Most Popular'
    },
    {
      id: 'powerpoint',
      name: 'PowerPoint Generator',
      description: 'Create stunning presentations automatically from your content',
      icon: Presentation,
      path: '/powerpoint',
      color: 'from-green-500 to-green-600',
      features: ['Multiple Themes', 'Auto Layout', 'Image Integration', 'Deep Analysis'],
      badge: 'New'
    },
    {
      id: 'research-paper',
      name: 'Research Paper Generator',
      description: 'Generate properly formatted academic papers with citations',
      icon: FileImage,
      path: '/research-paper',
      color: 'from-purple-500 to-purple-600',
      features: ['IEEE/APA/MLA', 'Citation Management', 'Auto Formatting', 'Bibliography'],
      badge: null
    },
    {
      id: 'dashboard',
      name: 'Power BI Dashboard',
      description: 'Transform data into interactive visual dashboards',
      icon: BarChart3,
      path: '/dashboard',
      color: 'from-orange-500 to-orange-600',
      features: ['AI Chart Suggestions', 'Interactive Filters', 'Power BI Export', 'Real-time Updates'],
      badge: 'Pro'
    }
  ];

  const stats = [
    {
      label: 'Documents Processed',
      value: '2,847',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      label: 'Presentations Created',
      value: '1,234',
      change: '+8%',
      icon: Presentation,
      color: 'text-green-600'
    },
    {
      label: 'Papers Generated',
      value: '456',
      change: '+23%',
      icon: FileImage,
      color: 'text-purple-600'
    },
    {
      label: 'Dashboards Built',
      value: '789',
      change: '+15%',
      icon: BarChart3,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI-Powered Content Processing</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Welcome to AI Content Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your documents into presentations, papers, and dashboards with the power of artificial intelligence
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Modules */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Processing Modules</h2>
          <Badge variant="outline" className="text-xs">
            4 Modules Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {module.badge && (
                      <Badge variant={module.badge === 'New' ? 'default' : 'secondary'} className="text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-gray-700">Key Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Zap className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link to={module.path}>
                    <Button className="w-full group-hover:bg-blue-600 transition-colors">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProcessingQueue 
            jobs={recentJobs}
            onDownload={(jobId) => console.log('Download:', jobId)}
            onPreview={(jobId) => console.log('Preview:', jobId)}
            onRetry={(jobId) => console.log('Retry:', jobId)}
          />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/text-extraction">
                <FileText className="w-4 h-4 mr-2" />
                Extract Text
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/powerpoint">
                <Presentation className="w-4 h-4 mr-2" />
                Create Presentation
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/research-paper">
                <FileImage className="w-4 h-4 mr-2" />
                Generate Paper
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Build Dashboard
              </Link>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>1,247 users online</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4" />
              <span>Avg. processing time: 45s</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
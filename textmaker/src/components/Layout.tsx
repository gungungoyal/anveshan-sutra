import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Presentation, 
  FileImage, 
  BarChart3, 
  Menu, 
  X,
  Brain,
  Zap,
  Settings,
  History
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modules = [
    {
      id: 'text-extraction',
      name: 'Text Extraction',
      description: 'AI-powered text summarization and data extraction',
      icon: FileText,
      path: '/text-extraction',
      color: 'bg-blue-500'
    },
    {
      id: 'powerpoint',
      name: 'PowerPoint Generator',
      description: 'Create professional presentations automatically',
      icon: Presentation,
      path: '/powerpoint',
      color: 'bg-green-500'
    },
    {
      id: 'research-paper',
      name: 'Research Paper',
      description: 'Generate formatted academic papers',
      icon: FileImage,
      path: '/research-paper',
      color: 'bg-purple-500'
    },
    {
      id: 'dashboard',
      name: 'Power BI Dashboard',
      description: 'Interactive data visualization dashboards',
      icon: BarChart3,
      path: '/dashboard',
      color: 'bg-orange-500'
    }
  ];

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Brain },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  // Auto-collapse sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
    setSidebarCollapsed(true);
  }, [location]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const closeSidebar = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
      setSidebarCollapsed(true);
    }, 300); // Small delay to allow for smooth transitions
  };

  const cancelCloseSidebar = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar toggle button - only visible when collapsed */}
      {sidebarCollapsed && (
        <button
          ref={toggleButtonRef}
          className="fixed left-4 top-4 z-50 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300"
          onMouseEnter={() => {
            cancelCloseSidebar();
            setSidebarOpen(true);
          }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-8 h-8 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'
        }`}
        onMouseEnter={cancelCloseSidebar}
        onMouseLeave={closeSidebar}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Content Hub</h1>
                <p className="text-sm text-gray-500">Processing Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSidebarOpen(false);
                setSidebarCollapsed(true);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Navigation
              </h2>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                AI Modules
              </h2>
              <div className="space-y-3">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isActive = location.pathname === module.path;
                  return (
                    <Link key={module.id} to={module.path}>
                      <Card className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                              {module.name}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                v1.0.0
              </Badge>
              <div className="text-xs text-gray-500">
                Powered by AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex-1 flex flex-col"
        onMouseEnter={() => {
          if (!sidebarOpen) {
            setSidebarCollapsed(true);
          }
        }}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">AI Content Hub</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
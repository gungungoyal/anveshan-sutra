import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ProcessingJob } from '@/types';

interface ProcessingQueueProps {
  jobs: ProcessingJob[];
  onDownload?: (jobId: string) => void;
  onPreview?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  className?: string;
}

export default function ProcessingQueue({ 
  jobs, 
  onDownload, 
  onPreview, 
  onRetry,
  className = ''
}: ProcessingQueueProps) {
  const [localJobs, setLocalJobs] = useState<ProcessingJob[]>(jobs);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  // Simulate real-time updates for processing jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.status === 'processing' && job.progress < 100) {
            const increment = Math.random() * 15;
            const newProgress = Math.min(job.progress + increment, 100);
            
            if (newProgress >= 100) {
              return {
                ...job,
                progress: 100,
                status: Math.random() > 0.1 ? 'completed' : 'failed' // 90% success rate
              };
            }
            
            return { ...job, progress: newProgress };
          }
          return job;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getJobTypeLabel = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'text-extraction':
        return 'Text Extraction';
      case 'powerpoint':
        return 'PowerPoint';
      case 'research-paper':
        return 'Research Paper';
      case 'dashboard':
        return 'Dashboard';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ProcessingJob['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (localJobs.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No processing jobs</h3>
          <p className="text-gray-500">
            Upload files and start processing to see jobs here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Processing Queue
        </h3>
        <Badge variant="outline" className="text-xs">
          {localJobs.length} jobs
        </Badge>
      </div>

      <div className="space-y-4">
        {localJobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-4 space-y-3">
            {/* Job Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(job.status)}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {getJobTypeLabel(job.type)}
                  </h4>
                  {job.fileName && (
                    <p className="text-xs text-gray-500">{job.fileName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(job.status)}
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(job.createdAt)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {(job.status === 'processing' || job.status === 'pending') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {job.status === 'pending' ? 'Waiting to start...' : 'Processing...'}
                  </span>
                  <span className="font-medium">{Math.round(job.progress)}%</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            {job.status === 'completed' && (
              <div className="flex items-center space-x-2 pt-2">
                {onPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(job.id)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(job.id)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            )}

            {job.status === 'failed' && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-red-600">
                  Processing failed. Please try again.
                </p>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(job.id)}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
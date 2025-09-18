'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Network, Clock, 
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloudWatchMetricsProps {
  buildId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface MetricData {
  timestamp: Date;
  value: number;
}

interface Metrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    trend: 'up' | 'down' | 'stable';
    history: MetricData[];
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    used: number;
    total: number;
    history: MetricData[];
  };
  network: {
    inbound: number;
    outbound: number;
    totalTransferred: number;
    history: MetricData[];
  };
  duration: {
    elapsed: string;
    estimated: string;
    phases: {
      name: string;
      duration: string;
      status: 'completed' | 'running' | 'pending';
    }[];
  };
}

const CloudWatchMetrics: React.FC<CloudWatchMetricsProps> = ({
  buildId,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate fetching CloudWatch metrics
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulated data - replace with actual CloudWatch API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date();
      const mockMetrics: Metrics = {
        cpu: {
          current: Math.random() * 100,
          average: 45 + Math.random() * 20,
          peak: 85 + Math.random() * 15,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
          history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(now.getTime() - (20 - i) * 60000),
            value: 30 + Math.random() * 50
          }))
        },
        memory: {
          current: 2.3 + Math.random(),
          average: 2.1,
          peak: 3.8,
          used: 2.3,
          total: 4.0,
          history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(now.getTime() - (20 - i) * 60000),
            value: 1.5 + Math.random() * 2
          }))
        },
        network: {
          inbound: Math.random() * 100,
          outbound: Math.random() * 50,
          totalTransferred: 1024 + Math.random() * 500,
          history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(now.getTime() - (20 - i) * 60000),
            value: Math.random() * 150
          }))
        },
        duration: {
          elapsed: '12m 34s',
          estimated: '3m 26s',
          phases: [
            { name: 'Pre-Build', duration: '2m 15s', status: 'completed' },
            { name: 'Install', duration: '3m 42s', status: 'completed' },
            { name: 'Build', duration: '6m 37s', status: 'running' },
            { name: 'Post-Build', duration: '-', status: 'pending' },
            { name: 'Finalize', duration: '-', status: 'pending' }
          ]
        }
      };
      
      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch CloudWatch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [buildId, autoRefresh, refreshInterval]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500 animate-pulse';
      default:
        return 'bg-gray-300';
    }
  };

  // Simple sparkline component
  const Sparkline: React.FC<{ data: MetricData[]; color: string }> = ({ data, color }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Loading CloudWatch metrics...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Unable to load metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          CloudWatch Metrics
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchMetrics}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={cn('w-3 h-3 text-gray-400', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* CPU Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">CPU Usage</span>
          </div>
          {getTrendIcon(metrics.cpu.trend)}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Current</span>
            <span className="text-sm font-mono text-gray-900">
              {metrics.cpu.current.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                metrics.cpu.current > 80 ? 'bg-red-500' :
                metrics.cpu.current > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              )}
              style={{ width: `${metrics.cpu.current}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Avg: {metrics.cpu.average.toFixed(1)}%</span>
            <span>Peak: {metrics.cpu.peak.toFixed(1)}%</span>
          </div>
          <div className="pt-2">
            <Sparkline data={metrics.cpu.history} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Memory Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Memory</span>
          </div>
          <span className="text-xs text-gray-500">
            {metrics.memory.used.toFixed(1)}GB / {metrics.memory.total.toFixed(1)}GB
          </span>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Avg: {metrics.memory.average.toFixed(1)}GB</span>
            <span>Peak: {metrics.memory.peak.toFixed(1)}GB</span>
          </div>
          <div className="pt-2">
            <Sparkline data={metrics.memory.history} color="#a855f7" />
          </div>
        </div>
      </div>

      {/* Network Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Network I/O</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Inbound</span>
            <span className="font-mono text-gray-900">
              {metrics.network.inbound.toFixed(2)} MB/s
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Outbound</span>
            <span className="font-mono text-gray-900">
              {metrics.network.outbound.toFixed(2)} MB/s
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Total Transfer</span>
            <span className="text-xs font-mono text-gray-900">
              {(metrics.network.totalTransferred / 1024).toFixed(2)} GB
            </span>
          </div>
        </div>
        <div className="pt-2">
          <Sparkline data={metrics.network.history} color="#16a34a" />
        </div>
      </div>

      {/* Build Phases */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Build Phases</span>
          </div>
          <div className="text-xs text-gray-500">
            {metrics.duration.elapsed} / ~{metrics.duration.estimated}
          </div>
        </div>
        <div className="space-y-2">
          {metrics.duration.phases.map((phase, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className={cn('w-2 h-2 rounded-full', getPhaseColor(phase.status))} />
                <span className="text-xs text-gray-600">{phase.name}</span>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {phase.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudWatchMetrics;

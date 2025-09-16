"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  GitBranch,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogAnalyticsDashboardProps {
  logs: any[];
  timeRange?: string;
}

interface Analytics {
  summary: {
    total: number;
    success: number;
    failed: number;
    running: number;
    pending: number;
    successRate: number;
    avgDuration: string;
    totalDuration: string;
  };
  trends: {
    dailyBuilds: {
      date: string;
      count: number;
      success: number;
      failed: number;
    }[];
    hourlyDistribution: { hour: number; count: number }[];
  };
  topIssues: {
    error: string;
    count: number;
    percentage: number;
    lastSeen: string;
  }[];
  performance: {
    fastestBuild: { id: string; duration: string; pipeline: string };
    slowestBuild: { id: string; duration: string; pipeline: string };
    avgByPipeline: { pipeline: string; avgDuration: string; count: number }[];
  };
  contributors: {
    author: string;
    commits: number;
    successRate: number;
    avgDuration: string;
  }[];
  branches: {
    branch: string;
    builds: number;
    successRate: number;
    lastActivity: string;
  }[];
}

const LogAnalyticsDashboard: React.FC<LogAnalyticsDashboardProps> = ({
  logs,
}) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "builds" | "duration" | "errors"
  >("builds");

  useEffect(() => {
    const calculateAnalytics = () => {
      // Summary Statistics
      const total = logs.length;
      const success = logs.filter((l) => l.status === "success").length;
      const failed = logs.filter((l) => l.status === "failed").length;
      const running = logs.filter((l) => l.status === "running").length;
      const pending = logs.filter((l) => l.status === "pending").length;
      const successRate = total > 0 ? (success / total) * 100 : 0;

      // Duration calculations
      const durations = logs
        .filter((l) => l.duration)
        .map((l) => {
          const parts = l.duration.split(" ");
          let seconds = 0;
          parts.forEach((part: string) => {
            if (part.includes("m")) seconds += parseInt(part) * 60;
            if (part.includes("s")) seconds += parseInt(part);
          });
          return seconds;
        });

      const avgDurationSeconds =
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
      const totalDurationSeconds = durations.reduce((a, b) => a + b, 0);

      const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
      };

      // Daily trends
      const dailyMap = new Map<
        string,
        { count: number; success: number; failed: number }
      >();
      logs.forEach((log) => {
        const date = new Date(log.timestamp).toLocaleDateString();
        const existing = dailyMap.get(date) || {
          count: 0,
          success: 0,
          failed: 0,
        };
        existing.count++;
        if (log.status === "success") existing.success++;
        if (log.status === "failed") existing.failed++;
        dailyMap.set(date, existing);
      });

      const dailyBuilds = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .slice(-7);

      // Hourly distribution
      const hourlyMap = new Map<number, number>();
      logs.forEach((log) => {
        const hour = new Date(log.timestamp).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyMap.get(hour) || 0,
      }));

      // Top issues (simulated)
      const topIssues = [
        {
          error: "Build timeout exceeded",
          count: 12,
          percentage: 35,
          lastSeen: "2 hours ago",
        },
        {
          error: "Dependencies installation failed",
          count: 8,
          percentage: 23,
          lastSeen: "5 hours ago",
        },
        {
          error: "Test suite failures",
          count: 6,
          percentage: 18,
          lastSeen: "1 day ago",
        },
        {
          error: "Memory limit exceeded",
          count: 4,
          percentage: 12,
          lastSeen: "3 days ago",
        },
        {
          error: "Network connectivity issues",
          count: 4,
          percentage: 12,
          lastSeen: "1 week ago",
        },
      ];

      // Performance metrics
      const sortedByDuration = [...logs].sort((a, b) => {
        const getDurationSeconds = (duration: string) => {
          if (!duration) return 0;
          const parts = duration.split(" ");
          let seconds = 0;
          parts.forEach((part: string) => {
            if (part.includes("m")) seconds += parseInt(part) * 60;
            if (part.includes("s")) seconds += parseInt(part);
          });
          return seconds;
        };
        return getDurationSeconds(a.duration) - getDurationSeconds(b.duration);
      });

      const fastestBuild = sortedByDuration[0]
        ? {
            id: sortedByDuration[0].id,
            duration: sortedByDuration[0].duration,
            pipeline: sortedByDuration[0].pipelineName,
          }
        : null;

      const slowestBuild = sortedByDuration[sortedByDuration.length - 1]
        ? {
            id: sortedByDuration[sortedByDuration.length - 1].id,
            duration: sortedByDuration[sortedByDuration.length - 1].duration,
            pipeline:
              sortedByDuration[sortedByDuration.length - 1].pipelineName,
          }
        : null;

      // Pipeline performance
      const pipelineMap = new Map<
        string,
        { totalDuration: number; count: number }
      >();
      logs.forEach((log) => {
        if (!log.duration) return;
        const existing = pipelineMap.get(log.pipelineName) || {
          totalDuration: 0,
          count: 0,
        };
        const parts = log.duration.split(" ");
        let seconds = 0;
        parts.forEach((part) => {
          if (part.includes("m")) seconds += parseInt(part) * 60;
          if (part.includes("s")) seconds += parseInt(part);
        });
        existing.totalDuration += seconds;
        existing.count++;
        pipelineMap.set(log.pipelineName, existing);
      });

      const avgByPipeline = Array.from(pipelineMap.entries())
        .map(([pipeline, data]) => ({
          pipeline,
          avgDuration: formatDuration(
            Math.floor(data.totalDuration / data.count)
          ),
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Contributors
      const contributorMap = new Map<
        string,
        { commits: number; success: number; totalDuration: number }
      >();
      logs.forEach((log) => {
        const author = log.commit.author;
        const existing = contributorMap.get(author) || {
          commits: 0,
          success: 0,
          totalDuration: 0,
        };
        existing.commits++;
        if (log.status === "success") existing.success++;
        if (log.duration) {
          const parts = log.duration.split(" ");
          let seconds = 0;
          parts.forEach((part: string) => {
            if (part.includes("m")) seconds += parseInt(part) * 60;
            if (part.includes("s")) seconds += parseInt(part);
          });
          existing.totalDuration += seconds;
        }
        contributorMap.set(author, existing);
      });

      const contributors = Array.from(contributorMap.entries())
        .map(([author, data]) => ({
          author,
          commits: data.commits,
          successRate:
            data.commits > 0 ? (data.success / data.commits) * 100 : 0,
          avgDuration: formatDuration(
            Math.floor(data.totalDuration / data.commits)
          ),
        }))
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 5);

      // Branches
      const branchMap = new Map<
        string,
        { builds: number; success: number; lastActivity: Date }
      >();
      logs.forEach((log) => {
        const existing = branchMap.get(log.branch) || {
          builds: 0,
          success: 0,
          lastActivity: new Date(log.timestamp),
        };
        existing.builds++;
        if (log.status === "success") existing.success++;
        const logDate = new Date(log.timestamp);
        if (logDate > existing.lastActivity) {
          existing.lastActivity = logDate;
        }
        branchMap.set(log.branch, existing);
      });

      const branches = Array.from(branchMap.entries())
        .map(([branch, data]) => ({
          branch,
          builds: data.builds,
          successRate: data.builds > 0 ? (data.success / data.builds) * 100 : 0,
          lastActivity: getRelativeTime(data.lastActivity),
        }))
        .sort((a, b) => b.builds - a.builds)
        .slice(0, 5);

      setAnalytics({
        summary: {
          total,
          success,
          failed,
          running,
          pending,
          successRate,
          avgDuration: formatDuration(Math.floor(avgDurationSeconds)),
          totalDuration: formatDuration(totalDurationSeconds),
        },
        trends: {
          dailyBuilds,
          hourlyDistribution,
        },
        topIssues,
        performance: {
          fastestBuild: fastestBuild!,
          slowestBuild: slowestBuild!,
          avgByPipeline,
        },
        contributors,
        branches,
      });
    };

    calculateAnalytics();
  }, [logs]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-500">
        Calculating analytics...
      </div>
    );
  }

  // Simple bar chart component
  const BarChart: React.FC<{
    data: { label: string; value: number; max: number }[];
  }> = ({ data }) => {
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-12">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-700 w-8 text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Log Analytics Dashboard
          </h2>
        </div>
        <div className="flex gap-2">
          {(["builds", "duration", "errors"] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                selectedMetric === metric
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              {analytics.summary.successRate.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.summary.success}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs text-red-600 font-medium">
              {(
                (analytics.summary.failed / analytics.summary.total) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.summary.failed}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.summary.running}
          </div>
          <div className="text-sm text-gray-600">Running</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.summary.avgDuration}
          </div>
          <div className="text-sm text-gray-600">Avg Duration</div>
        </div>
      </div>

      {/* Main Content Grid - Content changes based on selectedMetric */}
      <div className="grid lg:grid-cols-2 gap-6">
        {selectedMetric === "builds" && (
          <>
            {/* Daily Trends */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                일일 빌드 추세
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <BarChart
                  data={analytics.trends.dailyBuilds.map((d) => ({
                    label: new Date(d.date).toLocaleDateString("ko", {
                      weekday: "short",
                    }),
                    value: d.count,
                    max: Math.max(
                      ...analytics.trends.dailyBuilds.map((x) => x.count)
                    ),
                  }))}
                />
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                시간별 빌드 분포
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <BarChart
                  data={analytics.trends.hourlyDistribution
                    .filter((h) => h.count > 0)
                    .map((h) => ({
                      label: `${h.hour}시`,
                      value: h.count,
                      max: Math.max(
                        ...analytics.trends.hourlyDistribution.map((x) => x.count)
                      ),
                    }))}
                />
              </div>
            </div>

            {/* Top Contributors */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                주요 기여자
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {analytics.contributors.map((contributor, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {contributor.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{contributor.commits} 커밋</span>
                      <span
                        className={cn(
                          "font-medium",
                          contributor.successRate > 80
                            ? "text-green-600"
                            : contributor.successRate > 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {contributor.successRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Branches */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                활성 브랜치
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {analytics.branches.map((branch, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-700">
                        {branch.branch}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{branch.builds} 빌드</span>
                      <span className="text-gray-400">{branch.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedMetric === "duration" && (
          <>
            {/* Pipeline Performance */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                파이프라인별 평균 실행 시간
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {analytics.performance.avgByPipeline.map((pipeline, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">
                        {pipeline.pipeline}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pipeline.count} 빌드
                      </div>
                    </div>
                    <div className="text-sm font-mono font-medium text-blue-600">
                      {pipeline.avgDuration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Distribution */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                실행 시간 분포
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                  <div>
                    <div className="text-xs text-green-700 font-medium">최단 시간</div>
                    <div className="text-lg font-bold text-gray-900">
                      {analytics.performance.fastestBuild?.duration || '-'}
                    </div>
                  </div>
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                  <div>
                    <div className="text-xs text-yellow-700 font-medium">평균 시간</div>
                    <div className="text-lg font-bold text-gray-900">
                      {analytics.summary.avgDuration}
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div>
                    <div className="text-xs text-red-700 font-medium">최장 시간</div>
                    <div className="text-lg font-bold text-gray-900">
                      {analytics.performance.slowestBuild?.duration || '-'}
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Daily Average Duration Trend */}
            <div className="space-y-3 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                일별 평균 실행 시간 추세
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <BarChart
                  data={analytics.trends.dailyBuilds.map((d) => ({
                    label: new Date(d.date).toLocaleDateString("ko", {
                      month: "short",
                      day: "numeric",
                    }),
                    value: d.success + d.failed, // Total builds as proxy for duration impact
                    max: Math.max(
                      ...analytics.trends.dailyBuilds.map((x) => x.success + x.failed)
                    ),
                  }))}
                />
              </div>
            </div>
          </>
        )}

        {selectedMetric === "errors" && (
          <>
            {/* Top Issues */}
            <div className="space-y-3 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                주요 에러 및 이슈
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {analytics.topIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {issue.error}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          마지막 발생: {issue.lastSeen}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {issue.count}
                        </div>
                        <div className="text-xs text-gray-500">발생</div>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        issue.percentage > 30
                          ? "bg-red-100 text-red-700"
                          : issue.percentage > 20
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {issue.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Rate by Day */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                일별 에러율
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <BarChart
                  data={analytics.trends.dailyBuilds.map((d) => ({
                    label: new Date(d.date).toLocaleDateString("ko", {
                      weekday: "short",
                    }),
                    value: d.failed,
                    max: Math.max(
                      ...analytics.trends.dailyBuilds.map((x) => x.count)
                    ),
                  }))}
                />
              </div>
            </div>

            {/* Error Summary Stats */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                에러 통계
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">총 실패 빌드</span>
                  <span className="text-lg font-bold text-red-600">
                    {analytics.summary.failed}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">실패율</span>
                  <span className="text-lg font-bold text-red-600">
                    {((analytics.summary.failed / analytics.summary.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">연속 성공</span>
                  <span className="text-lg font-bold text-green-600">
                    {analytics.summary.success}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Performance Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Fastest Build
              </span>
            </div>
            {analytics.performance.fastestBuild && (
              <>
                <div className="text-lg font-bold text-gray-900">
                  {analytics.performance.fastestBuild.duration}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {analytics.performance.fastestBuild.pipeline}
                </div>
              </>
            )}
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">
                Slowest Build
              </span>
            </div>
            {analytics.performance.slowestBuild && (
              <>
                <div className="text-lg font-bold text-gray-900">
                  {analytics.performance.slowestBuild.duration}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {analytics.performance.slowestBuild.pipeline}
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                Total Runtime
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {analytics.summary.totalDuration}
            </div>
            <div className="text-xs text-gray-600">
              Across {analytics.summary.total} builds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogAnalyticsDashboard;

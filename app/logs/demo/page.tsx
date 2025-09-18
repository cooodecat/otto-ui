'use client';

import React, { useState } from 'react';
import UnifiedLogViewer from '@/components/logs/UnifiedLogViewer';
import BuildMetadata from '@/components/logs/BuildMetadata';
import LogSearch from '@/components/logs/LogSearch';
import { SearchLogsResponse } from '@/lib/api/unified-logs-api';

export default function LogsDemoPage() {
  const [buildId] = useState('test-build-123'); // This would come from URL params or context
  const [searchResults, setSearchResults] = useState<SearchLogsResponse['results']>([]);
  const [activeTab, setActiveTab] = useState('viewer');

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Unified Logs System Demo</h1>
        <p className="text-gray-600 mt-2">
          Testing the new unified logs API integration with real-time and archived logs
        </p>
      </div>

      {/* Build Metadata Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Build Information</h2>
        <p className="text-gray-600 text-sm mb-4">
          Detailed metadata about the build including status, phases, and metrics
        </p>
        <BuildMetadata 
          buildId={buildId}
          autoRefresh={true}
          refreshInterval={30000}
        />
      </div>

      {/* Tabs for different views */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['viewer', 'search', 'both'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'viewer' && 'Log Viewer'}
                {tab === 'search' && 'Search'}
                {tab === 'both' && 'Split View'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Log Viewer Tab */}
          {activeTab === 'viewer' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Unified Log Viewer</h3>
              <p className="text-gray-600 text-sm mb-4">
                View logs with automatic switching between real-time and archived sources
              </p>
              <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                <UnifiedLogViewer
                  buildId={buildId}
                  autoRefresh={true}
                  refreshInterval={5000}
                  initialLimit={100}
                  onLogClick={(log) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Log clicked:', log);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Log Search</h3>
              <p className="text-gray-600 text-sm mb-4">
                Search through logs with regex support and context viewing
              </p>
              <LogSearch
                buildId={buildId}
                onSearchResults={setSearchResults}
                autoSearch={true}
                debounceMs={500}
              />
            </div>
          )}

          {/* Split View Tab */}
          {activeTab === 'both' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Log Viewer */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Log Viewer</h3>
                <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                  <UnifiedLogViewer
                    buildId={buildId}
                    autoRefresh={false}
                    initialLimit={50}
                  />
                </div>
              </div>

              {/* Right: Search */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Search & Filter</h3>
                <LogSearch
                  buildId={buildId}
                  onSearchResults={setSearchResults}
                  autoSearch={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Integration Instructions</h2>
        <div className="text-sm space-y-2 text-blue-800">
          <p>This demo page showcases the new unified logs system components:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>UnifiedLogViewer:</strong> Automatically switches between real-time and archived logs</li>
            <li><strong>BuildMetadata:</strong> Shows build status, phases, metrics, and archive status</li>
            <li><strong>LogSearch:</strong> Advanced search with regex support and context viewing</li>
          </ul>
          <p className="mt-4">To integrate these components into your application:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Import the components from their respective paths</li>
            <li>Pass the buildId prop (usually from URL params)</li>
            <li>Configure auto-refresh and other options as needed</li>
            <li>Handle callbacks for user interactions</li>
          </ol>
          <p className="mt-4 font-semibold">
            Backend API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}
          </p>
        </div>
      </div>
    </div>
  );
}
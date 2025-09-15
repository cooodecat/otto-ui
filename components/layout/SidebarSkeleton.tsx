'use client';

import React from 'react';

/**
 * 사이드바 로딩 스켈레톤 컴포넌트
 * sim 프로젝트의 스켈레톤 패턴을 참고하여 구현
 */
export const SidebarSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Workspace Header Card Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Workspace name skeleton */}
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            {/* Owner name skeleton */}
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
          {/* Chevron icon skeleton */}
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
        
        {/* Search box skeleton */}
        <div className="mt-4">
          <div className="h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>

      {/* Folders Section Card Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Section title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          {/* Plus icon skeleton */}
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
        </div>

        <div className="space-y-2">
          {/* Pipeline item skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center p-2.5 rounded-lg border border-gray-100">
              {/* Icon skeleton */}
              <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
              {/* Pipeline name skeleton */}
              <div className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 40 + 50}%` }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocks Palette Section Card Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0">
        {/* Search box skeleton */}
        <div className="mb-4">
          <div className="h-10 bg-gray-100 rounded-lg"></div>
        </div>

        {/* Block items skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              {/* Block icon skeleton */}
              <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3"></div>
              {/* Block name skeleton */}
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section Cards Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 워크스페이스 드롭다운 스켈레톤
 */
export const WorkspaceDropdownSkeleton = () => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="py-1 max-h-64 overflow-y-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
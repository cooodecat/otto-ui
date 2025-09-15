'use client';

import React from 'react';

/**
 * 사이드바 로딩 스켈레톤 컴포넌트
 *
 * GlobalSidebar가 데이터를 로드하는 동안 사용자에게 표시되는 로딩 UI입니다.
 * 실제 사이드바의 레이아웃과 동일한 구조를 가지며, 내용 대신
 * 회색 플레이스홀더를 표시하여 연속적인 사용자 경험을 제공합니다.
 *
 * **주요 영역:**
 * - 워크스페이스 헤더 (프로젝트 이름, 검색박스)
 * - 파이프라인 목록 섹션
 * - 블록 팔레트 영역
 * - 하단 네비게이션 아이콘
 *
 * **애니메이션:**
 * Tailwind CSS의 `animate-pulse` 유틸리티를 사용하여
 * 자연스러운 로딩 효과를 제공합니다.
 *
 * @component
 * @returns 사이드바의 로딩 상태를 나타내는 JSX 엘리먼트
 *
 * @example
 * ```tsx
 * // GlobalSidebar에서 데이터 로딩 중일 때
 * {isLoading && projects.length === 0 ? (
 *   <SidebarSkeleton />
 * ) : (
 *   <div>// 실제 사이드바 콘텐츠</div>
 * )}
 * ```
 *
 * @see {@link GlobalSidebar} - 실제 사이드바 컴포넌트
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
 * 워크스페이스 드롭다운 스켈레톤 컴포넌트
 *
 * 워크스페이스 드롭다운 메뉴가 열리고 프로젝트 데이터를
 * 로드하는 동안 표시되는 전용 스켈레톤입니다.
 * 드롭다운 내부에 3개의 프로젝트 아이템 스켈레톤을 표시합니다.
 *
 * **스켈레톤 구성:**
 * - 프로젝트 이름 플레이스홀더 (75% 너비)
 * - GitHub 저장소 정보 플레이스홀더 (50% 너비)
 * - 드롭다운 스타일링 유지 (border, padding, max-height)
 *
 * @component
 * @returns 드롭다운 메뉴의 로딩 상태를 나타내는 JSX 엘리먼트
 *
 * @example
 * ```tsx
 * // GlobalSidebar에서 드롭다운이 열리고 프로젝트 로딩 중
 * {isWorkspaceDropdownOpen && (
 *   <div className="absolute top-full...">
 *     {isProjectsLoading ? (
 *       <WorkspaceDropdownSkeleton />
 *     ) : (
 *       // 실제 프로젝트 목록
 *     )}
 *   </div>
 * )}
 * ```
 *
 * @see {@link SidebarSkeleton} - 전체 사이드바 스켈레톤
 * @see {@link GlobalSidebar} - 사이드바 메인 컴포넌트
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
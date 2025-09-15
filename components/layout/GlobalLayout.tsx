'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import GlobalSidebar from './GlobalSidebar';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * 사이드바가 표시되지 않아야 하는 경로들
 */
const SIDEBAR_EXCLUDED_PATHS = ['/', '/signin', '/callback', '/signup', '/projects/onboarding'];

/**
 * 캔버스 레이아웃이 필요한 경로 패턴
 * 파이프라인 상세 페이지에서 전체 화면 캔버스 위에 사이드바가 floating
 */
const isCanvasLayoutPath = (pathname: string): boolean => {
  // /pipelines 페이지 (파이프라인 에디터)
  if (pathname === '/pipelines') return true;

  // /projects/{project_id}/pipelines/{pipeline_id} 패턴
  const pipelineDetailPattern = /^\/projects\/[^/]+\/pipelines\/[^/]+$/;
  return pipelineDetailPattern.test(pathname);
};

/**
 * 전역 레이아웃 컴포넌트
 * 경로에 따라 두 가지 레이아웃을 제공:
 * 1. 캔버스 레이아웃: 파이프라인 상세 페이지 - 사이드바가 캔버스 위에 floating
 * 2. 표준 레이아웃: 그 외 페이지 - 사이드바와 콘텐츠가 화면을 분할
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // 현재 경로가 사이드바 제외 목록에 있는지 확인
  const shouldShowSidebar = !SIDEBAR_EXCLUDED_PATHS.includes(pathname);

  // 캔버스 레이아웃 사용 여부
  const isCanvasLayout = shouldShowSidebar && isCanvasLayoutPath(pathname);

  if (!shouldShowSidebar) {
    // 사이드바가 없는 페이지 (랜딩, 로그인 등)
    return (
      <div className='min-h-screen'>
        <main className='min-h-screen'>{children}</main>
      </div>
    );
  }

  if (isCanvasLayout) {
    // 캔버스 레이아웃: 사이드바가 콘텐츠 위에 floating
    return (
      <div className='min-h-screen relative'>
        {/* 사이드바는 z-50으로 캔버스 위에 표시 */}
        <GlobalSidebar />
        {/* 메인 콘텐츠는 전체 화면 사용 */}
        <main className='min-h-screen'>{children}</main>
      </div>
    );
  }

  // 표준 레이아웃: 사이드바와 콘텐츠가 화면을 분할
  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* 사이드바 컨테이너 - 고정 너비 */}
      <div className='w-80 flex-shrink-0'>
        {/* GlobalSidebar의 fixed positioning을 relative로 변경하기 위한 wrapper */}
        <div className='sticky top-0 h-screen p-4'>
          <GlobalSidebar />
        </div>
      </div>
      {/* 메인 콘텐츠 - 나머지 공간 차지 */}
      <main className='flex-1 min-h-screen'>{children}</main>
    </div>
  );
};

export default GlobalLayout;
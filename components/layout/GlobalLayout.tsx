'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import GlobalSidebar from './GlobalSidebar';

/**
 * GlobalLayout 컴포넌트의 props 인터페이스
 */
interface GlobalLayoutProps {
  /** 레이아웃 내부에 렌더링될 React 노드 */
  children: React.ReactNode;
}

/**
 * 사이드바가 표시되지 않아야 하는 경로들
 * 로그인, 회원가입, 온보딩 등 인증 관련 페이지와 랜딩 페이지에서는 사이드바를 숨김
 *
 * @constant
 * @type {string[]}
 */
const SIDEBAR_EXCLUDED_PATHS = ['/', '/signin'];

/**
 * 캔버스 레이아웃이 필요한 경로 패턴 확인 함수
 *
 * 파이프라인 에디터와 파이프라인 상세 페이지에서는 전체 화면 캔버스가 필요하며,
 * 사이드바가 캔버스 위에 floating 형태로 표시됩니다.
 *
 * @param pathname - 현재 경로 문자열
 * @returns 캔버스 레이아웃을 사용해야 하는 경로인지 여부
 *
 * @example
 * ```typescript
 * isCanvasLayoutPath('/pipelines') // true - 파이프라인 에디터
 * isCanvasLayoutPath('/projects/123/pipelines/456') // true - 파이프라인 상세
 * isCanvasLayoutPath('/dashboard') // false - 일반 페이지
 * ```
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
 *
 * 애플리케이션의 메인 레이아웃을 담당하며, 현재 경로에 따라
 * 세 가지 다른 레이아웃 모드를 제공합니다:
 *
 * **1. 사이드바 없는 레이아웃 (No Sidebar)**
 * - 랜딩 페이지, 로그인, 회원가입, 온보딩 페이지
 * - 전체 화면을 콘텐츠가 차지
 *
 * **2. 캔버스 레이아웃 (Canvas Layout)**
 * - 파이프라인 에디터 및 상세 페이지
 * - 사이드바가 전체 화면 캔버스 위에 floating (z-50)
 * - 배경 콘텐츠는 전체 화면 사용
 *
 * **3. 표준 레이아웃 (Standard Layout)**
 * - 일반적인 대시보드 및 관리 페이지
 * - 사이드바(320px)와 메인 콘텐츠가 화면을 수평 분할
 * - 사이드바는 sticky positioning으로 고정
 *
 * @component
 * @param props - GlobalLayout props
 * @param props.children - 메인 콘텐츠 영역에 렌더링될 React 노드
 *
 * @returns 현재 경로에 적합한 레이아웃 구조를 가진 JSX 엘리먼트
 *
 * @example
 * ```tsx
 * // Next.js app/layout.tsx에서 사용
 * <GlobalLayout>
 *   <HomePage /> // 또는 다른 페이지 컴포넌트
 * </GlobalLayout>
 * ```
 *
 * @see {@link GlobalSidebar} - 사이드바 컴포넌트
 * @see {@link AuthProvider} - 인증 상태 관리 컴포넌트
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
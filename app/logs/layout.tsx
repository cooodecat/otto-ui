import React from 'react';
import GlobalLayout from '@/components/layout/GlobalLayout';

/**
 * Logs 페이지 전용 레이아웃
 * 
 * GlobalLayout을 적용하여 사이드바와 함께 표시
 */
export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlobalLayout>{children}</GlobalLayout>;
}
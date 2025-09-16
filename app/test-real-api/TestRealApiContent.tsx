"use client";

import React, { useState } from "react";
import { PipelineLogsPage } from "@/components/logs";

export default function TestRealApiContent() {
  const [buildId, setBuildId] = useState(
    "otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83"
  );
  const [apiBaseUrl, setApiBaseUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Real API Integration Test
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                실제 Nest.js 백엔드 서버와의 API 연동 및 SSE 실시간 로그
                스트리밍 테스트
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 설정 패널 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 API Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Build ID
              </label>
              <input
                type="text"
                value={buildId}
                onChange={(e) => setBuildId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="otto-codebuild-project:12345"
              />
              <p className="text-xs text-gray-500 mt-1">
                CloudWatch Logs 스트림 ID (예: otto-codebuild-project:12345)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="http://localhost:3001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nest.js 백엔드 서버 URL
              </p>
            </div>
          </div>
        </div>

        {/* API 엔드포인트 정보 */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📡 API Endpoints
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-2">
                로그 수집 제어
              </div>
              <ul className="space-y-1 text-blue-700">
                <li>
                  • <code>POST /api/v1/logs/builds/{buildId}/start</code> - 수집
                  시작
                </li>
                <li>
                  • <code>POST /api/v1/logs/builds/{buildId}/stop</code> - 수집
                  중지
                </li>
                <li>
                  • <code>GET /api/v1/logs/builds/{buildId}/status</code> - 상태
                  확인
                </li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">로그 데이터</div>
              <ul className="space-y-1 text-blue-700">
                <li>
                  • <code>GET /api/v1/logs/builds/{buildId}/recent</code> - 최근
                  로그
                </li>
                <li>
                  • <code>GET /api/v1/logs/builds/{buildId}/stream</code> - SSE
                  스트림
                </li>
                <li>
                  • <code>GET /api/v1/logs/builds/{buildId}</code> - 전체 로그
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 실제 API 연동 PipelineLogsPage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🚀 Real-time Pipeline Logs
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live API Connection</span>
            </div>
          </div>

          <PipelineLogsPage useRealApi={true} buildId={buildId} />
        </div>

        {/* 테스트 가이드 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🧪 Testing Guide
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">
                1. 백엔드 서버 준비
              </h4>
              <ul className="space-y-1">
                <li>• Nest.js 서버 실행 확인 (http://localhost:4000)</li>
                <li>• CloudWatch 로그 권한 설정</li>
                <li>• API 엔드포인트 동작 확인</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">
                2. 실시간 테스트 단계
              </h4>
              <ul className="space-y-1">
                <li>• 🔴 Live 버튼 클릭 → 로그 수집 시작</li>
                <li>• 실제 빌드 실행 → 로그 실시간 확인</li>
                <li>• ⏹️ Live 버튼 재클릭 → 수집 중지</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">3. 오류 확인</h4>
              <ul className="space-y-1">
                <li>• 브라우저 DevTools Network 탭</li>
                <li>• SSE 연결 상태 모니터링</li>
                <li>• API 응답 상태 코드 확인</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">4. 디버그 정보</h4>
              <ul className="space-y-1">
                <li>• 하단 좌측 디버그 패널 확인</li>
                <li>• SSE 연결 상태 실시간 모니터링</li>
                <li>• 로그 수신 시간 추적</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 환경 변수 안내 */}
        <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex items-start">
            <div className="text-yellow-800 text-sm">
              <strong>💡 Environment Setup:</strong>
              <code className="mx-1 bg-yellow-100 px-2 py-1 rounded">
                NEXT_PUBLIC_API_URL
              </code>
              환경변수를 설정하여 API 서버 URL을 지정할 수 있습니다. 기본값:
              http://localhost:4000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

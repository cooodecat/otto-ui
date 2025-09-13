'use client';

import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  ArrowRight,
  Code,
  TestTube,
  Rocket,
  Zap,
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { createClient } from '@/lib/supabase/client';

const workflowSteps = [
  {
    id: 'trigger',
    title: 'Git Push 감지',
    description: 'main 브랜치에 코드가 푸시되면 자동으로 감지',
    icon: GitCommit,
    color: 'blue',
    status: 'triggered',
    details: ['GitHub, GitLab, Bitbucket 지원', '브랜치별 개별 설정 가능', '실시간 웹훅 연동'],
  },
  {
    id: 'condition',
    title: '조건 검사',
    description: '사전 정의된 조건들을 확인하여 실행 여부 결정',
    icon: Settings,
    color: 'purple',
    status: 'completed',
    details: ['파일 변경사항 분석', '브랜치 보호 규칙 확인', '시간대별 배포 제한'],
  },
  {
    id: 'build',
    title: 'Build',
    description: '소스 코드를 빌드하고 아티팩트 생성',
    icon: Code,
    color: 'emerald',
    status: 'running',
    details: ['Docker 컨테이너 기반 빌드', '캐싱으로 빠른 빌드 속도', '멀티 플랫폼 지원'],
  },
  {
    id: 'test',
    title: 'Test',
    description: '자동화된 테스트 실행 및 품질 검증',
    icon: TestTube,
    color: 'orange',
    status: 'pending',
    details: ['단위 테스트 & 통합 테스트', '코드 커버리지 분석', '보안 취약점 스캔'],
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: '프로덕션 환경에 안전하게 배포',
    icon: Rocket,
    color: 'indigo',
    status: 'pending',
    details: ['무중단 배포 (Blue-Green)', '롤백 기능', '실시간 헬스 체크'],
  },
];

const statusConfig = {
  triggered: {
    label: '트리거됨',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  completed: {
    label: '완료',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  running: {
    label: '실행 중',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Play,
  },
  pending: {
    label: '대기 중',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: Play,
  },
  failed: {
    label: '실패',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-600',
};

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState<string>('trigger');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const handleGetStarted = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Login error:', error.message);
        alert('로그인 중 오류가 발생했습니다: ' + error.message);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error:', error);
      alert('예상치 못한 오류가 발생했습니다.');
    }
  };

  // 자동 진행 애니메이션
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIndex = (prev + 1) % workflowSteps.length;
        setActiveStep(workflowSteps[nextIndex]?.id || 'trigger');
        return nextIndex;
      });
    }, 3000); // 3초마다 다음 단계로

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleStepClick = (stepId: string, index: number) => {
    setIsAutoPlaying(false); // 수동 클릭 시 자동 재생 중지
    setActiveStep(stepId);
    setCurrentStepIndex(index);

    // 5초 후 자동 재생 재개
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className='py-24 bg-transparent'>
      <div className='container mx-auto px-6 max-w-7xl'>
        {/* Header */}
        <AnimatedSection>
          <div className='text-center mb-20'>
            <div className='inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm'>
              <Play className='w-4 h-4 text-purple-400' />
              <span className='text-sm font-medium text-gray-300'>워크플로우</span>
            </div>

            <h2 className='text-4xl sm:text-5xl font-bold mb-6 text-white'>
              <span className='bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent'>
                스마트한 자동화
              </span>
              <br />
              워크플로우
            </h2>

            <p className='text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed'>
              트리거가 발생하면 Otto가 조건을 판단하여 필요한 파이프라인만 실행합니다. 각 단계별로
              상세한 로그와 실시간 상태를 확인할 수 있습니다.
            </p>
          </div>
        </AnimatedSection>

        {/* Workflow Visualization */}
        <div className='grid lg:grid-cols-2 gap-12 items-start'>
          {/* Left: Step List */}
          <AnimatedSection delay={200}>
            <div className='space-y-4'>
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const StatusIcon = statusConfig[step.status as keyof typeof statusConfig].icon;
                const isActive = activeStep === step.id;

                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(step.id, index)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 ${
                      isActive
                        ? 'border-purple-500/50 bg-purple-900/20 shadow-lg shadow-purple-500/20 scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    {/* Connection Line */}
                    {index < workflowSteps.length - 1 && (
                      <div className='absolute left-9 top-full w-0.5 h-4 bg-white/20 overflow-hidden'>
                        <div
                          className={`absolute inset-0 w-full bg-gradient-to-b from-purple-500 to-purple-700 transition-all duration-1000 ${
                            index < currentStepIndex
                              ? 'translate-y-0 opacity-100'
                              : 'translate-y-full opacity-0'
                          }`}
                        ></div>
                      </div>
                    )}

                    <div className='flex items-start gap-4'>
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${
                          colorClasses[step.color as keyof typeof colorClasses]
                        } flex items-center justify-center shadow-lg transition-all duration-500 ${
                          isActive ? 'scale-110 shadow-2xl' : ''
                        }`}
                      >
                        <Icon className={`w-6 h-6 text-white ${isActive ? 'scale-110' : ''}`} />
                        {isActive && (
                          <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-emerald-400 animate-ping opacity-20'></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-lg font-bold text-white'>{step.title}</h3>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                              statusConfig[step.status as keyof typeof statusConfig].color
                            }`}
                          >
                            <StatusIcon className='w-3 h-3' />
                            {statusConfig[step.status as keyof typeof statusConfig].label}
                          </div>
                        </div>
                        <p className='text-gray-300 mb-3'>{step.description}</p>

                        {/* Details */}
                        {step.details && (
                          <div className='space-y-2'>
                            {step.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className='flex items-center gap-2 text-sm text-gray-400'
                              >
                                <CheckCircle className='w-4 h-4 text-emerald-500' />
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isActive ? 'text-purple-400 rotate-90' : 'text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Right: Real-time Status Panel */}
          <AnimatedSection delay={400}>
            <div className='sticky top-8'>
              <div className='bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-8'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-bold text-white'>실시간 실행 상태</h3>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isAutoPlaying ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'
                      }`}
                    ></div>
                    {isAutoPlaying ? '자동 재생' : '일시 정지'}
                  </div>
                </div>

                <div className='space-y-6'>
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const StatusIcon = statusConfig[step.status as keyof typeof statusConfig].icon;
                    const isActive = activeStep === step.id;
                    const isCompleted = index < currentStepIndex;

                    return (
                      <div key={step.id} className='relative'>
                        <div className='flex items-center gap-4'>
                          {/* Icon */}
                          <div
                            className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted
                                ? 'bg-green-500/20 border-2 border-green-500/50'
                                : isActive
                                ? `bg-gradient-to-r ${
                                    colorClasses[step.color as keyof typeof colorClasses]
                                  } shadow-lg scale-110`
                                : 'bg-white/10'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 transition-all duration-300 ${
                                isCompleted
                                  ? 'text-green-400'
                                  : isActive
                                  ? 'text-white'
                                  : 'text-gray-500'
                              }`}
                            />

                            {/* Animation Effect */}
                            {isActive && (
                              <div className='absolute inset-0 rounded-full border-2 border-purple-400 animate-ping'></div>
                            )}

                            {/* Status Icon */}
                            <div className='absolute -top-1 -right-1 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center shadow-sm border border-white/20'>
                              <StatusIcon
                                className={`w-3 h-3 ${
                                  isCompleted ? 'text-green-400' : isActive ? 'text-purple-400' : 'text-gray-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Progress */}
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span
                                className={`font-medium ${
                                  isActive ? 'text-white' : 'text-gray-300'
                                }`}
                              >
                                {step.title}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {isActive && step.status === 'running'
                                  ? '실행 중...'
                                  : statusConfig[step.status as keyof typeof statusConfig].label}
                              </span>
                            </div>
                            <div className='mt-2 h-1 bg-white/20 rounded-full overflow-hidden'>
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  isCompleted
                                    ? 'w-full bg-green-400'
                                    : isActive && step.status === 'running'
                                    ? 'w-3/4 bg-purple-500 animate-pulse'
                                    : 'w-0'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Connection Line */}
                        {index < workflowSteps.length - 1 && (
                          <div className='absolute left-5 top-12 w-0.5 h-6 bg-white/20 overflow-hidden'>
                            <div
                              className={`absolute inset-0 w-full bg-gradient-to-b from-purple-500 to-purple-700 transition-all duration-1000 ${
                                isCompleted
                                  ? 'translate-y-0 opacity-100'
                                  : 'translate-y-full opacity-0'
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Overall Progress */}
                <div className='mt-8 pt-6 border-t border-white/20'>
                  <div className='flex items-center justify-between text-sm mb-4'>
                    <span className='text-gray-400'>전체 진행률</span>
                    <span className='font-medium text-white'>
                      {Math.round((currentStepIndex / workflowSteps.length) * 100)}% ({currentStepIndex}/
                      {workflowSteps.length} 완료)
                    </span>
                  </div>
                  <div className='h-2 bg-white/20 rounded-full overflow-hidden mb-4'>
                    <div
                      className='h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-1000'
                      style={{ width: `${(currentStepIndex / workflowSteps.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Controls */}
                  <div className='flex items-center justify-between'>
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isAutoPlaying
                          ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isAutoPlaying ? 'animate-pulse' : ''}`} />
                      {isAutoPlaying ? '자동 재생 중' : '자동 재생 시작'}
                    </button>
                    <span className='text-xs text-gray-400'>3초마다 자동 진행</span>
                  </div>
                </div>
              </div>

            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={600}>
          <div className='flex justify-center mt-16 mb-8'>
            <div className='relative group'>
              <div className='absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200' />
              <button
                onClick={handleGetStarted}
                className='relative group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center gap-3 transform hover:scale-105'
              >
                <Zap className='w-5 h-5' />
                지금 시작하기
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/projectStore';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import StepIndicator from './StepIndicator';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import {
  WizardState,
  ProjectCreationWizardProps,
  Repository,
  Branch,
  ProjectConfig
} from './types';

// Mock data - 실제로는 GitHub API를 호출해야 합니다
const mockBranches: Branch[] = [
  {
    name: 'main',
    commit: {
      sha: 'abc123',
      message: 'Initial commit',
      date: '2024-01-15',
      author: 'John Doe'
    }
  },
  {
    name: 'develop',
    commit: {
      sha: 'def456',
      message: 'Add new feature',
      date: '2024-01-14',
      author: 'Jane Smith'
    }
  },
  {
    name: 'feature/auth',
    commit: {
      sha: 'ghi789',
      message: 'Implement authentication',
      date: '2024-01-13',
      author: 'Bob Johnson'
    }
  }
];

// Mock repository data
const mockRepository: Repository = {
  name: '',
  owner: '',
  description: 'A modern web application built with Next.js',
  defaultBranch: 'main',
  languages: {
    'TypeScript': 65234,
    'JavaScript': 23456,
    'CSS': 12345,
    'HTML': 5432
  },
  updatedAt: '2일 전',
  stars: 128,
  forks: 24,
  visibility: 'Public'
};

export default function ProjectCreationWizard({
  isOpen,
  onClose,
  repository: repoInfo,
  onProjectCreated
}: ProjectCreationWizardProps) {
  const router = useRouter();
  const { createProject } = useProjectStore();

  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    repository: null,
    selectedBranch: 'main',
    branches: [],
    projectConfig: {
      name: '',
      description: ''
    },
    validation: {
      isNameValid: false,
      nameError: null,
      isChecking: false
    },
    isLoading: false,
    isCreating: false,
    createdProjectId: null,
    createdProjectNumericId: null
  });

  const [error, setError] = useState<string | null>(null);
  const [hasGithubApp, setHasGithubApp] = useState(false);

  // 프로젝트 이름 검증
  const validateProjectName = useCallback(async (name: string) => {
    setState(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        isChecking: true
      }
    }));

    try {
      // 기본 유효성 검사
      const isValid = name.length >= 3 && name.length <= 50 && /^[a-z0-9-]+$/.test(name);
      
      if (!isValid) {
        setState(prev => ({
          ...prev,
          validation: {
            isNameValid: false,
            nameError: '프로젝트 이름은 3-50자의 소문자, 숫자, 하이픈만 사용 가능합니다.',
            isChecking: false
          }
        }));
        return;
      }

      // TODO: API를 통한 중복 검사 (필요시 추가)
      // const response = await apiClient.checkProjectName(name);
      
      setState(prev => ({
        ...prev,
        validation: {
          isNameValid: true,
          nameError: null,
          isChecking: false
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        validation: {
          isNameValid: false,
          nameError: '프로젝트 이름 검증 중 오류가 발생했습니다.',
          isChecking: false
        }
      }));
    }
  }, []);

  // 저장소 정보 초기화
  useEffect(() => {
    if (isOpen) {
      if (repoInfo) {
        const initialProjectName = repoInfo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        setState(prev => ({
          ...prev,
          repository: {
            ...mockRepository,
            name: repoInfo.name,
            owner: repoInfo.owner,
            visibility: repoInfo.visibility
          },
          projectConfig: {
            name: initialProjectName,
            description: mockRepository.description
          },
          validation: {
            isNameValid: true, // 초기값은 유효하다고 가정
            nameError: null,
            isChecking: false
          }
        }));

        // 초기 이름에 대한 유효성 검사 실행
        validateProjectName(initialProjectName);
      } else {
        // repoInfo가 없는 경우 기본값 설정
        setState(prev => ({
          ...prev,
          repository: {
            ...mockRepository,
            name: 'my-project',
            owner: 'user',
            visibility: 'Public'
          },
          branches: mockBranches, // 기본 브랜치 목록 설정
          selectedBranch: 'main', // 기본 브랜치 선택
          projectConfig: {
            name: 'my-project',
            description: ''
          },
          validation: {
            isNameValid: true,
            nameError: null,
            isChecking: false
          }
        }));
      }
    }
  }, [isOpen, repoInfo, validateProjectName]);

  // 브랜치 목록 로드
  const loadBranches = useCallback(async () => {
    if (!state.repository) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // GitHub API를 통해 브랜치 목록 가져오기
      // 임시로 installation ID를 'default'로 사용
      const response = await apiClient.getGithubBranches(
        'default',
        state.repository.owner,
        state.repository.name
      );
      
      if (response.error) {
        // GitHub 통합이 없는 경우 기본 브랜치 사용
        console.log('GitHub integration not available, using default branches');
        setState(prev => ({
          ...prev,
          branches: mockBranches,
          isLoading: false
        }));
        return;
      }
      
      // API 응답을 Branch 타입으로 변환
      const branches: Branch[] = response.data.map((branch: any) => ({
        name: branch.name,
        commit: {
          sha: branch.commit?.sha || '',
          message: branch.commit?.message || '',
          date: branch.commit?.date || new Date().toISOString(),
          author: branch.commit?.author || 'Unknown'
        }
      }));
      
      setState(prev => ({
        ...prev,
        branches,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load branches:', error);
      // 에러 발생 시 mock 데이터 사용 (fallback)
      setState(prev => ({
        ...prev,
        branches: mockBranches,
        isLoading: false
      }));
      // GitHub 통합이 없을 때는 에러 메시지를 표시하지 않음
    }
  }, [state.repository]);

  // 프로젝트 생성
  const handleCreateProject = async () => {
    setState(prev => ({ ...prev, isCreating: true }));
    setError(null);

    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      const projectData = {
        name: state.projectConfig.name,
        description: state.projectConfig.description,
        github_owner: state.repository?.owner || '',
        github_repo: state.repository?.name || '',
        default_branch: state.selectedBranch
      };

      console.log('Creating project with data:', projectData);

      // API를 호출하여 프로젝트 생성
      // GitHub 통합이 없거나 기본값인 경우 일반 프로젝트 생성
      const response = await apiClient.createProject({
        name: state.projectConfig.name,
        description: state.projectConfig.description
      });

      console.log('API Response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      const newProject = response.data;

      // Zustand store에 프로젝트 추가
      await fetchProjects(); // 프로젝트 목록 새로고침

      setState(prev => ({
        ...prev,
        isCreating: false,
        createdProjectId: newProject.id || newProject.projectId,
        createdProjectNumericId: newProject.id // 실제 DB ID 사용
      }));

      toast.success('프로젝트가 성공적으로 생성되었습니다!');

      // 프로젝트 생성 성공 시 콜백 호출
      if (onProjectCreated) {
        // 생성된 프로젝트를 전달
        onProjectCreated({
          projectId: newProject.id || newProject.projectId,
          name: newProject.name
        });
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로젝트 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      setState(prev => ({ ...prev, isCreating: false }));
    }
  };

  // 프로젝트로 이동
  const handleNavigateToProject = () => {
    if (state.createdProjectId) {
      // onProjectCreated 콜백 호출
      if (onProjectCreated) {
        onProjectCreated({
          projectId: state.createdProjectId,
          name: state.projectConfig.name
        });
      } else {
        // 콜백이 없으면 직접 라우팅
        const projectId = state.createdProjectNumericId || state.createdProjectId;
        const pipelineId = '1'; // 새 프로젝트의 첫 번째 파이프라인
        router.push(`/projects/${projectId}/pipelines/${pipelineId}`);
      }
      onClose();
    }
  };

  // Step 이동
  const handleStepChange = (step: 1 | 2 | 3) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const handleNext = () => {
    if (state.currentStep < 3) {
      setState(prev => ({ ...prev, currentStep: (prev.currentStep + 1) as 1 | 2 | 3 }));
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: (prev.currentStep - 1) as 1 | 2 | 3 }));
    }
  };

  // 취소 확인
  const handleClose = () => {
    if (state.createdProjectId) {
      onClose();
      return;
    }

    const confirmClose = window.confirm('정말 취소하시겠습니까? 입력한 정보가 저장되지 않습니다.');
    if (confirmClose) {
      onClose();
    }
  };

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, state.createdProjectId]);

  if (!isOpen) return null;

  // 다음 버튼 활성화 조건
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.selectedBranch !== '';
      case 2:
        // 이름이 있고, 검사 중이 아니며, (유효하거나 아직 검사하지 않은 경우)
        return state.projectConfig.name.length > 0 &&
               !state.validation.isChecking &&
               (state.validation.isNameValid || state.validation.nameError === null);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              프로젝트 생성 마법사
            </h2>
            <p className="text-gray-600 mt-1">
              {state.repository?.owner}/{state.repository?.name} 저장소로 새 프로젝트를 만듭니다
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* GitHub App 설치 안내 */}
        {state.currentStep === 1 && !state.repository?.owner.includes('github') && (
          <div className="mx-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  GitHub 저장소 연동 안내
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  실제 GitHub 저장소를 연동하려면 먼저 GitHub App을 설치해야 합니다.
                  현재는 샘플 데이터로 프로젝트 생성이 진행됩니다.
                </p>
                <a
                  href="https://github.com/apps/your-app-name/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium mt-2"
                >
                  GitHub App 설치하기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          onStepClick={handleStepChange}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {state.currentStep === 1 && state.repository && (
            <StepOne
              repository={state.repository}
              branches={state.branches}
              selectedBranch={state.selectedBranch}
              onBranchChange={(branch) => setState(prev => ({ ...prev, selectedBranch: branch }))}
              isLoading={state.isLoading}
              onLoadBranches={loadBranches}
            />
          )}

          {state.currentStep === 2 && (
            <StepTwo
              projectConfig={state.projectConfig}
              onConfigChange={(config) => setState(prev => ({ ...prev, projectConfig: config }))}
              validation={state.validation}
              onValidateName={validateProjectName}
              defaultName={state.repository?.name || ''}
              defaultDescription={state.repository?.description || ''}
            />
          )}

          {state.currentStep === 3 && state.repository && (
            <StepThree
              repository={state.repository}
              selectedBranch={state.selectedBranch}
              projectConfig={state.projectConfig}
              isCreating={state.isCreating}
              createdProjectId={state.createdProjectId}
              error={error}
              onCreateProject={handleCreateProject}
              onNavigateToProject={handleNavigateToProject}
            />
          )}
        </div>

        {/* Footer Navigation */}
        {!state.createdProjectId && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handlePrevious}
              disabled={state.currentStep === 1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${state.currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>

            <div className="text-sm text-gray-500">
              {state.currentStep} / 3 단계
            </div>

            {state.currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                  ${canProceed()
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-24"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
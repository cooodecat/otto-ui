"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Github, CheckCircle, ArrowRight, Loader2, ExternalLink, Plus } from "lucide-react";
import apiClient from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/lib/projectStore";
import { useToast } from "@/hooks/useToast";
import ProjectCreationWizard from "@/components/projects/ProjectCreationWizard";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "install" | "complete">("check");
  const [checking, setChecking] = useState(true);
  const [hasInstallation, setHasInstallation] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const { fetchProjects } = useProjectStore();
  const { showSuccess, showError, showWarning } = useToast();
  const installWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkInstallation();
    
    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const checkInstallation = async () => {
    setChecking(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      const response = await apiClient.getGithubInstallations();

      // API 응답 구조 처리 개선
      let installations = [];
      if (Array.isArray(response.data)) {
        installations = response.data;
      } else if (response.data?.installations) {
        installations = response.data.installations;
      } else if (response.data && typeof response.data === "object") {
        // 단일 설치 객체인 경우
        installations = [response.data];
      }

      console.log("GitHub installations check:", {
        responseData: response.data,
        installations: installations,
        count: installations.length,
      });

      if (installations.length > 0) {
        setHasInstallation(true);
        setStep("complete");
      } else {
        setStep("install");
      }
    } catch (error) {
      console.error("Failed to check installation:", error);
      setStep("install");
    } finally {
      setChecking(false);
    }
  };

  const handleInstallGitHub = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showError("로그인 필요", "GitHub App을 설치하려면 먼저 로그인해야 합니다.");
      router.push("/auth/signin");
      return;
    }

    setIsInstalling(true);

    // state 파라미터 생성
    const stateData = {
      userId: user.id,
      returnUrl: "/projects",
      timestamp: Date.now(),
    };
    const state = btoa(JSON.stringify(stateData));

    // GitHub App 설치 URL 생성
    const installUrl = `https://github.com/apps/codecat-otto-dev/installations/new?state=${encodeURIComponent(
      state
    )}`;

    // 새 창에서 GitHub App 설치 페이지 열기
    const width = 1000;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    installWindowRef.current = window.open(
      installUrl,
      "github-install",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // 설치 완료 확인을 위한 폴링 시작
    startInstallationCheck();
  };

  const startInstallationCheck = () => {
    // 기존 interval 정리
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // 3초마다 설치 상태 확인
    checkIntervalRef.current = setInterval(async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          apiClient.setSupabaseToken(session.access_token);
        }

        const response = await apiClient.getGithubInstallations();
        
        let installations = [];
        if (Array.isArray(response.data)) {
          installations = response.data;
        } else if (response.data?.installations) {
          installations = response.data.installations;
        }

        if (installations.length > 0) {
          // 설치 완료!
          setHasInstallation(true);
          setStep("complete");
          setIsInstalling(false);
          
          // 팝업 창 닫기
          if (installWindowRef.current && !installWindowRef.current.closed) {
            installWindowRef.current.close();
          }
          
          // interval 정리
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
          
          showSuccess("설치 완료!", "GitHub App이 성공적으로 설치되었습니다.");
        }
      } catch (error) {
        console.error("Installation check error:", error);
      }
    }, 3000);

    // 2분 후 자동으로 체크 중지
    setTimeout(() => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
        setIsInstalling(false);
        
        // 팝업이 여전히 열려있다면 사용자에게 알림
        if (installWindowRef.current && !installWindowRef.current.closed) {
          showError("설치 확인 시간 초과", "GitHub App 설치를 완료한 후 '설치 확인' 버튼을 클릭해주세요.");
        }
      }
    }, 120000); // 2분
  };

  const handleManualCheck = async () => {
    await checkInstallation();
    if (hasInstallation) {
      showSuccess("확인 완료", "GitHub App 설치가 확인되었습니다.");
    } else {
      showError("설치 미확인", "GitHub App이 아직 설치되지 않았습니다.");
    }
  };

  const handleSkip = () => {
    router.push("/projects");
  };

  const handleContinue = async () => {
    await fetchProjects();
    router.push("/projects");
  };

  const handleProjectCreated = async (projectData?: { projectId: string; name: string; targetUrl?: string }) => {
    console.log('Project created:', projectData);
    setShowProjectWizard(false);
    await fetchProjects();
    showSuccess("프로젝트 생성 완료", `${projectData?.name || '프로젝트'}가 성공적으로 생성되었습니다.`);
    
    // targetUrl이 있으면 해당 URL로, 없으면 기본 URL로 이동
    if (projectData?.targetUrl) {
      router.push(projectData.targetUrl);
    } else if (projectData?.projectId) {
      router.push(`/projects/${projectData.projectId}/pipelines`);
    } else {
      router.push("/projects");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "check"
                ? "bg-purple-600 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {step === "check" ? "1" : <CheckCircle className="w-5 h-5" />}
          </div>
          <div
            className={`w-24 h-1 ${
              hasInstallation ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "install"
                ? "bg-purple-600 text-white"
                : step === "complete"
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            {step === "complete" ? <CheckCircle className="w-5 h-5" /> : "2"}
          </div>
          <div
            className={`w-24 h-1 ${
              step === "complete" ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "complete"
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            {step === "complete" ? <CheckCircle className="w-5 h-5" /> : "3"}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {checking ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
              <h2 className="text-xl font-semibold mb-2">확인 중...</h2>
              <p className="text-gray-600">
                GitHub App 설치 상태를 확인하고 있습니다
              </p>
            </div>
          ) : step === "install" ? (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Github className="w-12 h-12 text-purple-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4">
                GitHub App 설치
              </h2>

              <p className="text-gray-600 text-center mb-8">
                Otto가 GitHub 저장소에 접근하려면 GitHub App 설치가 필요합니다.
                설치하면 다음 기능을 사용할 수 있습니다:
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">실제 GitHub 저장소 연동</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">
                    자동 브랜치 감지 및 선택
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">
                    실제 소스코드로 CI/CD 빌드
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Pull Request 자동 빌드</span>
                </li>
              </ul>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleInstallGitHub}
                  disabled={isInstalling}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      설치 중...
                    </>
                  ) : (
                    <>
                      <Github className="w-5 h-5" />
                      GitHub App 설치하기 (새 창)
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isInstalling && (
                  <button
                    onClick={handleManualCheck}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5" />
                    설치 확인
                  </button>
                )}

                <button
                  onClick={handleSkip}
                  disabled={isInstalling}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 py-3 px-6 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  나중에 설치하기
                </button>
              </div>

              {isInstalling && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    새 창에서 GitHub App을 설치하고 있습니다.
                    <br />
                    설치가 완료되면 자동으로 감지됩니다.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                GitHub App 없이도 파이프라인 에디터는 사용 가능하지만, 실제
                빌드는 실행할 수 없습니다.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4">
                설치 완료!
              </h2>

              <p className="text-gray-600 text-center mb-8">
                GitHub App이 성공적으로 설치되었습니다. 이제 GitHub 저장소를
                연동하고 CI/CD 파이프라인을 구성할 수 있습니다.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowProjectWizard(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  프로젝트 생성하기
                </button>
                
                <button
                  onClick={handleContinue}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  프로젝트 목록으로 이동
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button for Install Step */}
        {step === "install" && !checking && (
          <div className="text-center mt-4">
            <button
              onClick={checkInstallation}
              className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
            >
              설치했나요? 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Project Creation Wizard Modal */}
      {showProjectWizard && (
        <ProjectCreationWizard
          isOpen={showProjectWizard}
          onClose={() => setShowProjectWizard(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </>
  );
}

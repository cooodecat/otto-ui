"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Github,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import StepIndicator from "./StepIndicator";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import {
  WizardState,
  ProjectCreationWizardProps,
  Repository,
  Branch,
  ProjectConfig,
} from "./types";

// Mock data - 실제로는 GitHub API를 호출해야 합니다
const mockBranches: Branch[] = [
  {
    name: "main",
    commit: {
      sha: "abc123",
      message: "Initial commit",
      date: "2024-01-15",
      author: "John Doe",
    },
  },
  {
    name: "develop",
    commit: {
      sha: "def456",
      message: "Add new feature",
      date: "2024-01-14",
      author: "Jane Smith",
    },
  },
  {
    name: "feature/auth",
    commit: {
      sha: "ghi789",
      message: "Implement authentication",
      date: "2024-01-13",
      author: "Bob Johnson",
    },
  },
];

// Mock repository data
const mockRepository: Repository = {
  name: "",
  owner: "",
  description: "A modern web application built with Next.js",
  defaultBranch: "main",
  languages: {
    TypeScript: 65234,
    JavaScript: 23456,
    CSS: 12345,
    HTML: 5432,
  },
  updatedAt: "2일 전",
  stars: 128,
  forks: 24,
  visibility: "Public",
};

export default function ProjectCreationWizard({
  isOpen,
  onClose,
  repository: repoInfo,
  onProjectCreated,
}: ProjectCreationWizardProps) {
  const router = useRouter();
  const { createProjectWithGithub, fetchProjects } = useProjectStore();

  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    repositories: [],
    repository: null,
    selectedBranch: "main",
    branches: [],
    projectConfig: {
      name: "",
      description: "",
    },
    validation: {
      isNameValid: false,
      nameError: null,
      isChecking: false,
    },
    isLoading: false,
    isCreating: false,
    createdProjectId: null,
    createdProjectNumericId: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [hasGithubApp, setHasGithubApp] = useState(false);
  const [isInstallingGitHub, setIsInstallingGitHub] = useState(false);
  const installWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 프로젝트 이름 검증
  const validateProjectName = useCallback(async (name: string) => {
    setState((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        isChecking: true,
      },
    }));

    try {
      // 기본 유효성 검사
      const isValid =
        name.length >= 3 && name.length <= 50 && /^[a-z0-9-]+$/.test(name);

      if (!isValid) {
        setState((prev) => ({
          ...prev,
          validation: {
            isNameValid: false,
            nameError:
              "프로젝트 이름은 3-50자의 소문자, 숫자, 하이픈만 사용 가능합니다.",
            isChecking: false,
          },
        }));
        return;
      }

      // TODO: API를 통한 중복 검사 (필요시 추가)
      // const response = await apiClient.checkProjectName(name);

      setState((prev) => ({
        ...prev,
        validation: {
          isNameValid: true,
          nameError: null,
          isChecking: false,
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        validation: {
          isNameValid: false,
          nameError: "프로젝트 이름 검증 중 오류가 발생했습니다.",
          isChecking: false,
        },
      }));
    }
  }, []);

  // 저장소 정보 초기화 및 실제 GitHub 저장소 조회
  useEffect(() => {
    if (isOpen) {
      loadGitHubRepositories();
    }

    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isOpen]);

  // GitHub 저장소 목록 조회
  const loadGitHubRepositories = useCallback(async () => {
    console.log("=== Starting loadGitHubRepositories ===");
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // GitHub installations 조회
      console.log("Fetching GitHub installations...");
      const installResponse = await apiClient.getGitHubInstallations();
      console.log("GitHub installations response:", installResponse);

      const installations = installResponse.data?.installations || [];

      console.log(
        `Found ${installations.length} installations:`,
        installations
      );

      if (installations.length === 0) {
        console.log("No GitHub installations found - showing error message");
        // GitHub 설치가 없는 경우 기본값 설정
        setState((prev) => ({
          ...prev,
          repository: null,
          repositories: [],
          branches: [],
          selectedBranch: "main",
          projectConfig: {
            name: "",
            description: "",
          },
          validation: {
            isNameValid: false,
            nameError: null,
            isChecking: false,
          },
          isLoading: false,
        }));
        setError("GitHub App이 설치되지 않았습니다.");
        setHasGithubApp(false);
        return;
      }

      // 첫 번째 installation 사용
      const installation = installations[0];
      const installationId =
        installation.github_installation_id || installation.installation_id;

      setHasGithubApp(true);
      console.log("Using installation ID:", installationId);
      console.log("Fetching repositories for installation...");

      // GitHub 저장소 목록 조회
      const reposResponse = await apiClient.getGithubRepositories(
        installationId
      );
      console.log("\n=== GitHub Repositories API Response ===");
      console.log("Full response:", JSON.stringify(reposResponse, null, 2));

      // 에러 체크
      if (reposResponse.error) {
        console.error("Failed to fetch repositories:", reposResponse.error);
        throw new Error(`저장소 조회 실패: ${reposResponse.error}`);
      }

      // API 응답 구조에 따라 repositories 배열 추출
      // 백엔드가 GitHubRepositoriesResponse 타입 반환: { repositories: [...], totalRepositories: number }
      const reposList = reposResponse.data?.repositories || [];

      console.log("\nExtracted repos list:");
      console.log(
        "  - Total repositories:",
        reposResponse.data?.totalRepositories || 0
      );
      console.log("  - Repository count:", reposList.length);

      if (reposList && reposList.length > 0) {
        console.log(`Found ${reposList.length} repositories`);
        console.log("First repo data:", reposList[0]);

        // 모든 저장소를 Repository 타입으로 변환
        const repositories: Repository[] = reposList.map((repo: any) => {
          // owner 정보 추출 - GitHub API는 owner 객체를 제공
          let repoOwner = "unknown";

          // GitHub API 표준: owner 객체의 login 필드
          if (repo.owner?.login) {
            repoOwner = repo.owner.login;
          }
          // 대체 방법: full_name에서 추출
          else if (repo.full_name && repo.full_name.includes("/")) {
            repoOwner = repo.full_name.split("/")[0];
          }
          // owner가 문자열로 직접 제공되는 경우
          else if (typeof repo.owner === "string") {
            repoOwner = repo.owner;
          }
          // 그 외의 경우 installation의 account_login 사용
          else if (installation.account_login) {
            repoOwner = installation.account_login;
          }

          console.log(`\nRepository: ${repo.name}`);
          console.log(`  - id: ${repo.id}`);
          console.log(`  - full_name: ${repo.full_name}`);
          console.log(`  - owner.login: ${repo.owner?.login}`);
          console.log(`  - owner object:`, repo.owner);
          console.log(`  - extracted owner: ${repoOwner}`);

          return {
            id: repo.id?.toString() || "",
            name: repo.name,
            owner: repoOwner,
            description: repo.description || "",
            defaultBranch: repo.default_branch || "main",
            languages: {},
            updatedAt: new Date(
              repo.updated_at || repo.pushed_at
            ).toLocaleDateString("ko-KR"),
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            visibility: repo.private ? "Private" : "Public",
          };
        });

        console.log("Converted repositories:", repositories);

        // 첫 번째 저장소를 기본으로 선택
        const firstRepo = repositories[0];
        const initialProjectName = firstRepo.name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");

        console.log("\n=== Selected Repository ===");
        console.log("Repository:", firstRepo.name);
        console.log("Owner:", firstRepo.owner);
        console.log("ID:", firstRepo.id);
        console.log("Initial project name:", initialProjectName);

        setState((prev) => ({
          ...prev,
          repositories,
          repository: firstRepo,
          branches: [],
          selectedBranch: firstRepo.defaultBranch,
          projectConfig: {
            name: initialProjectName,
            description: firstRepo.description || "",
          },
          validation: {
            isNameValid: true,
            nameError: null,
            isChecking: false,
          },
          isLoading: false,
        }));

        // 프로젝트 이름 유효성 검사
        validateProjectName(initialProjectName);

        // 브랜치 목록도 자동으로 로드
        console.log(
          `\nLoading branches for ${firstRepo.owner}/${firstRepo.name}...`
        );
        loadBranchesForRepo(installationId, firstRepo.owner, firstRepo.name);
      } else {
        console.log("No repositories found or invalid response");
        console.log("Response data:", reposResponse);

        // 저장소가 없는 경우 에러 메시지 표시
        setState((prev) => ({
          ...prev,
          repository: null,
          repositories: [],
          branches: [],
          selectedBranch: "main",
          projectConfig: {
            name: "",
            description: "",
          },
          validation: {
            isNameValid: false,
            nameError: null,
            isChecking: false,
          },
          isLoading: false,
        }));

        setError(
          `GitHub 저장소를 찾을 수 없습니다. GitHub App 설정에서 ${
            installation.account_login || "organization"
          }의 저장소 접근 권한을 확인해주세요.`
        );
      }
    } catch (error) {
      console.error("Failed to load GitHub repositories:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      });

      // 에러 발생시에도 기본값으로 설정하여 UI가 작동하도록 함
      setState((prev) => ({
        ...prev,
        repository: {
          ...mockRepository,
          name: "my-project",
          owner: "user",
          visibility: "Public",
        },
        branches: [],
        selectedBranch: "main",
        projectConfig: {
          name: "my-project",
          description: "",
        },
        validation: {
          isNameValid: true,
          nameError: null,
          isChecking: false,
        },
        isLoading: false,
      }));

      setError(
        "GitHub 저장소를 불러오는데 실패했습니다. 수동으로 정보를 입력해주세요."
      );
    }
  }, [validateProjectName]);

  // 특정 저장소의 브랜치 목록 로드
  const loadBranchesForRepo = async (
    installationId: string,
    owner: string,
    repo: string
  ) => {
    try {
      console.log("loadBranchesForRepo called with:", {
        installationId,
        owner,
        repo,
      });

      // owner가 비어있으면 기본 브랜치만 설정
      if (!owner || owner === "unknown") {
        console.log("Owner is empty or unknown, using default branches");
        setState((prev) => ({
          ...prev,
          branches: [
            {
              name: "main",
              commit: {
                sha: "",
                message: "Default branch",
                date: new Date().toLocaleDateString("ko-KR"),
                author: "Unknown",
              },
            },
          ],
        }));
        return;
      }

      const response = await apiClient.getGithubBranches(
        installationId,
        owner,
        repo
      );
      console.log("Branches API response:", response);

      // 백엔드 응답 구조: { data: { branches: [], totalBranches: number } }
      if (
        response.data &&
        response.data.branches &&
        Array.isArray(response.data.branches)
      ) {
        const branches: Branch[] = response.data.branches.map(
          (branch: any) => ({
            name: branch.name,
            commit: {
              sha: branch.commit?.sha || "",
              message: branch.commit?.commit?.message || "",
              date: branch.commit?.commit?.author?.date
                ? new Date(branch.commit.commit.author.date).toLocaleDateString(
                    "ko-KR"
                  )
                : new Date().toLocaleDateString("ko-KR"),
              author: branch.commit?.commit?.author?.name || "Unknown",
            },
          })
        );

        console.log("Converted branches:", branches);
        console.log("Total branches:", response.data.totalBranches);

        setState((prev) => ({
          ...prev,
          branches,
        }));
      } else {
        console.error("Invalid response structure for branches:", response);
        throw new Error(
          "Invalid response structure: expected { data: { branches: [], totalBranches: number } }"
        );
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        installationId,
        owner,
        repo,
      });

      // 응답 구조 오류인 경우 특별 처리
      if (
        error instanceof Error &&
        error.message.includes("Invalid response structure")
      ) {
        console.error(
          "API 응답 구조가 예상과 다릅니다. 백엔드 API를 확인해주세요."
        );
        toast.error(
          "브랜치 정보를 가져오는데 실패했습니다. API 응답 구조를 확인해주세요."
        );
      }

      // 에러 발생시 기본 브랜치 설정
      setState((prev) => ({
        ...prev,
        branches: [
          {
            name: "main",
            commit: {
              sha: "",
              message: "Default branch",
              date: new Date().toLocaleDateString("ko-KR"),
              author: "Unknown",
            },
          },
        ],
      }));
    }
  };

  // GitHub App 설치 함수
  const handleInstallGitHub = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("로그인이 필요합니다");
      router.push("/auth/signin");
      return;
    }

    setIsInstallingGitHub(true);

    // state 파라미터 생성
    const stateData = {
      userId: user.id,
      returnUrl: "/projects",
      timestamp: Date.now(),
    };
    const state = btoa(JSON.stringify(stateData));

    // GitHub App 설치 URL 생성
    const installUrl = `https://github.com/apps/codecat-otto-prod/installations/new?state=${encodeURIComponent(
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

  // GitHub App 설치 완료 확인
  const startInstallationCheck = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          apiClient.setSupabaseToken(session.access_token);
        }

        const response = await apiClient.getGitHubInstallations();

        const installations = response.data?.installations || [];

        if (installations.length > 0) {
          // 설치 완료!
          setHasGithubApp(true);
          setIsInstallingGitHub(false);
          setError(null);

          // 팝업 창 닫기
          if (installWindowRef.current && !installWindowRef.current.closed) {
            installWindowRef.current.close();
          }

          // interval 정리
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }

          toast.success("GitHub App이 성공적으로 설치되었습니다!");

          // 저장소 다시 로드
          loadGitHubRepositories();
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
        setIsInstallingGitHub(false);

        if (installWindowRef.current && !installWindowRef.current.closed) {
          toast.error("GitHub App 설치 확인 시간이 초과되었습니다.");
        }
      }
    }, 120000);
  };

  // 수동 설치 확인
  const handleManualCheck = async () => {
    await loadGitHubRepositories();
    if (hasGithubApp) {
      toast.success("GitHub App 설치가 확인되었습니다.");
    } else {
      toast.error("GitHub App이 아직 설치되지 않았습니다.");
    }
  };

  // 저장소 변경 처리
  const handleRepositoryChange = useCallback(
    async (repoName: string) => {
      const selectedRepo = state.repositories.find((r) => r.name === repoName);
      if (!selectedRepo) return;

      const projectName = selectedRepo.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      setState((prev) => ({
        ...prev,
        repository: selectedRepo,
        branches: [],
        selectedBranch: selectedRepo.defaultBranch,
        projectConfig: {
          name: projectName,
          description: selectedRepo.description || "",
        },
        validation: {
          isNameValid: true,
          nameError: null,
          isChecking: false,
        },
      }));

      // 프로젝트 이름 유효성 검사
      validateProjectName(projectName);

      // 새 저장소의 브랜치 목록 로드
      try {
        const installResponse = await apiClient.getGitHubInstallations();
        const installations = Array.isArray(installResponse.data)
          ? installResponse.data
          : installResponse.data?.installations || [];

        if (installations.length > 0) {
          const installationId =
            installations[0].github_installation_id ||
            installations[0].installation_id;
          await loadBranchesForRepo(
            installationId,
            selectedRepo.owner,
            selectedRepo.name
          );
        }
      } catch (error) {
        console.error("Failed to load branches for new repository:", error);
      }
    },
    [state.repositories, validateProjectName]
  );

  // 브랜치 목록 로드 (수동으로 브랜치를 다시 로드할 때 사용)
  const loadBranches = useCallback(async () => {
    if (!state.repository) return;

    // 이미 브랜치가 있으면 다시 로드하지 않음
    if (state.branches.length > 0) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // GitHub installations 조회
      const installResponse = await apiClient.getGitHubInstallations();
      const installations = Array.isArray(installResponse.data)
        ? installResponse.data
        : installResponse.data?.installations || [];

      if (installations.length === 0) {
        console.log("No GitHub installations found");
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const installation = installations[0];
      const installationId =
        installation.github_installation_id || installation.installation_id;

      // 브랜치 목록 로드
      await loadBranchesForRepo(
        installationId,
        state.repository.owner,
        state.repository.name
      );

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Failed to load branches:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [state.repository, state.branches.length]);

  // 프로젝트 생성
  const handleCreateProject = async () => {
    setState((prev) => ({ ...prev, isCreating: true }));
    setError(null);

    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // GitHub installations 조회
      const installResponse = await apiClient.getGitHubInstallations();
      const installations = Array.isArray(installResponse.data)
        ? installResponse.data
        : installResponse.data?.installations || [];

      const installationId =
        installations[0]?.github_installation_id ||
        installations[0]?.installation_id;

      // 백엔드 API 형식에 맞게 데이터 구성
      const projectData = {
        name: state.projectConfig.name,
        description: state.projectConfig.description || "",
        installationId: installationId || "",
        githubRepoId: state.repository?.id || "",
        githubRepoUrl: `https://github.com/${state.repository?.owner}/${state.repository?.name}`,
        githubRepoName: state.repository?.name || "",
        githubOwner: state.repository?.owner || "",
        selectedBranch: state.selectedBranch,
      };

      console.log("\n=== Creating Project ===");
      console.log("Project Data:", JSON.stringify(projectData, null, 2));
      console.log("Repository owner:", state.repository?.owner);
      console.log("Repository name:", state.repository?.name);

      // GitHub 연동 프로젝트 생성 API 호출
      const response = await apiClient.createProjectWithGithub(projectData);

      console.log("API Response:", response);
      console.log("Response data:", response.data);
      console.log("Response error:", response.error);

      // 응답 검증
      if (!response || (!response.data && !response.error)) {
        throw new Error("Invalid API response");
      }

      if (response.error) {
        throw new Error(response.error);
      }

      const newProject = response.data?.project || response.data;
      console.log("New project:", newProject);

      if (!newProject || !newProject.project_id) {
        console.error("Invalid project data:", newProject);
        throw new Error("프로젝트 생성에 실패했습니다.");
      }

      // Zustand store에 프로젝트 추가
      await fetchProjects(); // 프로젝트 목록 새로고침

      setState((prev) => ({
        ...prev,
        isCreating: false,
        createdProjectId: newProject.project_id,
        createdProjectNumericId: newProject.project_id,
        currentStep: 3, // Step 3으로 이동 (완료 화면)
      }));

      toast.success("프로젝트가 성공적으로 생성되었습니다!");

      // StepThree에서 자동 이동 처리
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "프로젝트 생성 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      setState((prev) => ({ ...prev, isCreating: false }));
    }
  };

  // 네비게이션 진행 중 플래그 (컴포넌트 레벨)
  const [isNavigating, setIsNavigating] = useState(false);

  // 프로젝트로 이동 (파이프라인 조회 후 에디터로 이동)
  const handleNavigateToProject = async () => {
    console.log("=== handleNavigateToProject started ===");
    console.log("state.createdProjectId:", state.createdProjectId);
    console.log("state.projectConfig.name:", state.projectConfig.name);
    console.log("isNavigating:", isNavigating);

    // 중복 실행 방지
    if (isNavigating) {
      console.log("Already navigating, skipping...");
      return;
    }

    if (!state.createdProjectId) {
      console.error("No createdProjectId available");
      toast.error("프로젝트 ID를 찾을 수 없습니다.");
      return;
    }

    setIsNavigating(true); // 네비게이션 시작

    try {
      // 백엔드 파이프라인 생성 대기: 최대 ~3초(1초 간격)

      // 백엔드가 자동 생성한 파이프라인 확인
      let pipelineData = null;
      let retryCount = 0;
      const maxRetries = 5; // 총 ~5초 대기 (1초 간격) - 백엔드 처리 시간 고려

      // 타입 체크 및 변환
      const projectId =
        typeof state.createdProjectId === "object"
          ? (state.createdProjectId as any).project_id ||
            String(state.createdProjectId)
          : String(state.createdProjectId);

      console.log("=== Checking for backend-created pipeline ===");
      console.log("Project ID for pipeline check:", projectId);

      // pipelineStore 초기화
      const pipelineStore = usePipelineStore.getState();

      while (retryCount < maxRetries && !pipelineData) {
        console.log(
          `\n--- Pipeline check attempt ${retryCount + 1}/${maxRetries} ---`
        );

        try {
          const pipelineResponse = await apiClient.getPipelines(projectId);
          console.log("Raw API response:", pipelineResponse);
          console.log("Response data type:", typeof pipelineResponse.data);
          console.log(
            "Response data:",
            JSON.stringify(pipelineResponse.data, null, 2)
          );

          // API 응답 처리 - 다양한 형식 지원
          let pipelines = null;

          if (pipelineResponse.data) {
            // Case 1: data가 직접 배열인 경우
            if (Array.isArray(pipelineResponse.data)) {
              pipelines = pipelineResponse.data;
              console.log("Response is direct array, count:", pipelines.length);
            }
            // Case 2: data.pipelines가 배열인 경우
            else if (
              (pipelineResponse.data as any).pipelines &&
              Array.isArray((pipelineResponse.data as any).pipelines)
            ) {
              pipelines = (pipelineResponse.data as any).pipelines;
              console.log(
                "Response has pipelines property, count:",
                pipelines.length
              );
            }
            // Case 3: data.data가 배열인 경우
            else if (
              (pipelineResponse.data as any).data &&
              Array.isArray((pipelineResponse.data as any).data)
            ) {
              pipelines = (pipelineResponse.data as any).data;
              console.log(
                "Response has data.data property, count:",
                pipelines.length
              );
            }
            // Case 4: 단일 객체인 경우
            else if (
              typeof pipelineResponse.data === "object" &&
              !Array.isArray(pipelineResponse.data)
            ) {
              // 단일 파이프라인 객체를 배열로 변환
              if (
                (pipelineResponse.data as any).id ||
                (pipelineResponse.data as any).pipeline_id ||
                (pipelineResponse.data as any).pipelineId
              ) {
                pipelines = [pipelineResponse.data];
                console.log(
                  "Response is single pipeline object, converting to array"
                );
              }
            }
          }

          console.log("Extracted pipelines:", pipelines);

          if (pipelines && pipelines.length > 0) {
            // 백엔드가 생성한 파이프라인 사용
            pipelineData = pipelines[0];
            console.log("\n✅ Found backend-created pipeline:");
            console.log(
              "  - Full data:",
              JSON.stringify(pipelineData, null, 2)
            );
            console.log("  - Name:", pipelineData.name);
            console.log("  - ID (id):", pipelineData.id);
            console.log("  - ID (pipeline_id):", pipelineData.pipeline_id);
            console.log("  - ID (pipelineId):", pipelineData.pipelineId);

            // Store에도 파이프라인 데이터 추가
            await pipelineStore.fetchPipelines(projectId);
            break;
          }
        } catch (error) {
          console.error(
            `Error fetching pipelines (attempt ${retryCount + 1}):`,
            error
          );
          // 에러가 발생해도 계속 시도
        }

        retryCount++;
        if (retryCount < maxRetries) {
          const waitTime = 1000; // 1초 간격
          console.log(
            `No pipelines found yet. Waiting ${waitTime}ms before next check...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      let targetUrl = `/projects/${state.createdProjectId}`;

      // 백엔드가 파이프라인을 생성하지 못한 경우 처리
      if (!pipelineData) {
        console.log("Backend did not create a pipeline within timeout.");
        console.log("User can create pipeline manually from the project page.");
        // 파이프라인이 없어도 프로젝트 페이지로 이동
        // 사용자가 프로젝트 페이지에서 직접 파이프라인을 생성할 수 있음
        toast("프로젝트가 생성되었습니다. 파이프라인을 설정해주세요.", {
          icon: "ℹ️",
          duration: 4000,
        });
      } else {
        // 백엔드가 생성한 파이프라인이 있으면 성공 메시지
        toast.success(
          `프로젝트와 기본 파이프라인(${
            pipelineData.name || "Pipeline #1"
          })이 생성되었습니다.`
        );
      }

      // URL 결정 - 파이프라인이 있으면 에디터로, 없으면 프로젝트 페이지로
      // 파이프라인 ID 추출 - 다양한 필드명 지원
      const pipelineId =
        pipelineData?.id ||
        pipelineData?.pipeline_id ||
        pipelineData?.pipelineId ||
        pipelineData?.["pipeline-id"] ||
        pipelineData?.uuid;

      console.log("\n=== Navigation Decision ===");
      console.log("Extracted pipeline ID:", pipelineId);
      console.log("Project ID for navigation:", projectId);
      console.log("Pipeline data available:", !!pipelineData);

      if (pipelineData && pipelineId) {
        targetUrl = `/projects/${projectId}/pipelines/${pipelineId}`;
        console.log("✅ Will navigate to pipeline editor:", targetUrl);
      } else {
        targetUrl = `/projects/${projectId}/pipelines`;
        console.log("➡️ Will navigate to project pipelines page:", targetUrl);
      }

      // Zustand store 업데이트 (프로젝트 및 파이프라인 선택 상태)
      console.log("\n=== Updating Stores ===");
      const { setSelectedProject } = useProjectStore.getState();

      // 프로젝트 선택 상태 업데이트
      setSelectedProject(projectId);
      console.log("✅ Updated selected project to:", projectId);

      // 파이프라인 선택 상태 업데이트 - pipelineStore는 위에서 이미 초기화함
      if (pipelineData && pipelineId) {
        console.log("Setting selected pipeline:", pipelineId);
        if (typeof pipelineStore.setSelectedPipeline === "function") {
          pipelineStore.setSelectedPipeline(pipelineId);
          console.log("✅ Selected pipeline set in store");
        }

        // 파이프라인 데이터도 스토어에 추가 (중복 방지)
        const existingPipelines =
          pipelineStore.getPipelinesByProject(projectId);
        const alreadyExists = existingPipelines.some(
          (p) =>
            p.pipelineId === pipelineId ||
            p.pipeline_id === pipelineId ||
            (p as any).id === pipelineId
        );

        if (!alreadyExists && typeof pipelineStore.addPipeline === "function") {
          const formattedPipeline = {
            pipelineId: pipelineId,
            pipeline_id: pipelineId, // snake_case alias
            name: pipelineData.name || "Pipeline #1",
            projectId: projectId,
            project_id: projectId, // snake_case alias
            description: pipelineData.description || "",
            status: pipelineData.status || "active",
            blocks: pipelineData.blocks || pipelineData.nodes || [],
            createdAt: pipelineData.createdAt || pipelineData.created_at,
            created_at: pipelineData.createdAt || pipelineData.created_at, // snake_case alias
            updatedAt: pipelineData.updatedAt || pipelineData.updated_at,
            updated_at: pipelineData.updatedAt || pipelineData.updated_at, // snake_case alias
          };
          pipelineStore.addPipeline(formattedPipeline);
          console.log("✅ Added pipeline to store:", formattedPipeline);
        } else {
          console.log(
            "ℹ️ Pipeline already exists in store or addPipeline not available"
          );
        }
      }

      console.log("\n=== Final Navigation ===");
      console.log("Target URL:", targetUrl);
      console.log("Has onProjectCreated callback:", !!onProjectCreated);

      onClose(); // 모달 닫기

      // onProjectCreated 콜백 호출 또는 직접 라우팅
      if (onProjectCreated) {
        const callbackData = {
          projectId: projectId,
          project_id: projectId, // snake_case alias
          name: state.projectConfig.name,
          pipelineId: pipelineId, // 파이프라인 ID도 전달
          pipeline_id: pipelineId, // snake_case alias
          targetUrl,
        };
        console.log(
          "Calling onProjectCreated callback with:",
          JSON.stringify(callbackData, null, 2)
        );
        setTimeout(() => {
          onProjectCreated(callbackData);
        }, 100);
      } else {
        console.log(
          "No onProjectCreated callback, navigating directly to:",
          targetUrl
        );
        setTimeout(() => {
          router.push(targetUrl);
        }, 100);
      }

      console.log("=== Navigation Process Complete ===\n");
    } catch (error) {
      console.error("Failed to navigate to project:", error);
      setIsNavigating(false); // 에러 발생 시 플래그 리셋

      // 에러 발생 시 기본 URL로 이동
      const fallbackUrl = `/projects/${state.createdProjectId}/pipelines`;

      onClose();
      if (onProjectCreated) {
        setTimeout(() => {
          onProjectCreated({
            projectId: state.createdProjectId || "",
            name: state.projectConfig.name,
            targetUrl: fallbackUrl,
          });
        }, 100);
      } else {
        setTimeout(() => {
          router.push(fallbackUrl);
        }, 100);
      }
    } finally {
      // 네비게이션 완료 후 플래그 리셋
      setTimeout(() => setIsNavigating(false), 200);
    }
  };

  // Step 이동
  const handleStepChange = (step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const handleNext = () => {
    if (state.currentStep < 3) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as 1 | 2 | 3,
      }));
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep - 1) as 1 | 2 | 3,
      }));
    }
  };

  // 취소 확인
  const handleClose = () => {
    if (state.createdProjectId) {
      onClose();
      return;
    }

    const confirmClose = window.confirm(
      "정말 취소하시겠습니까? 입력한 정보가 저장되지 않습니다."
    );
    if (confirmClose) {
      onClose();
    }
  };

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, state.createdProjectId]);

  if (!isOpen) return null;

  // 다음 버튼 활성화 조건
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.selectedBranch !== "";
      case 2:
        // 이름이 있고, 검사 중이 아니며, (유효하거나 아직 검사하지 않은 경우)
        return (
          state.projectConfig.name.length > 0 &&
          !state.validation.isChecking &&
          (state.validation.isNameValid || state.validation.nameError === null)
        );
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
              {state.repository?.owner}/{state.repository?.name} 저장소로 새
              프로젝트를 만듭니다
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
        {state.currentStep === 1 && !state.isLoading && (
          <>
            {/* GitHub App이 설치되지 않았을 때 */}
            {!hasGithubApp && (
              <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      GitHub App 설치 필요
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      GitHub 저장소에 접근하려면 GitHub App을 설치해야 합니다.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={handleInstallGitHub}
                        disabled={isInstallingGitHub}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        {isInstallingGitHub ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            설치 중...
                          </>
                        ) : (
                          <>
                            <Github className="w-4 h-4" />
                            GitHub App 설치하기
                            <ExternalLink className="w-3 h-3" />
                          </>
                        )}
                      </button>
                      {isInstallingGitHub && (
                        <button
                          onClick={handleManualCheck}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          설치 확인
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 저장소를 찾을 수 없을 때 */}
            {hasGithubApp && state.repositories.length === 0 && (
              <div className="mx-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      GitHub 저장소를 찾을 수 없습니다
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      GitHub App이 설치되어 있지만 저장소를 찾을 수 없습니다.
                      GitHub App 설정에서 저장소 접근 권한을 확인해주세요.
                    </p>
                    <a
                      href="https://github.com/settings/installations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium mt-2"
                    >
                      GitHub App 설정 확인하기
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Progress Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          onStepClick={handleStepChange}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {state.currentStep === 1 &&
            (state.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">GitHub 저장소를 불러오는 중...</p>
              </div>
            ) : state.repository ? (
              <StepOne
                repositories={state.repositories}
                repository={state.repository}
                branches={state.branches}
                selectedBranch={state.selectedBranch}
                onRepositoryChange={handleRepositoryChange}
                onBranchChange={(branch) =>
                  setState((prev) => ({ ...prev, selectedBranch: branch }))
                }
                isLoading={state.isLoading}
                onLoadBranches={loadBranches}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                <p className="text-gray-600">
                  저장소 정보를 불러올 수 없습니다.
                </p>
                <button
                  onClick={() => loadGitHubRepositories()}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  다시 시도
                </button>
              </div>
            ))}

          {state.currentStep === 2 && (
            <StepTwo
              projectConfig={state.projectConfig}
              onConfigChange={(config) =>
                setState((prev) => ({ ...prev, projectConfig: config }))
              }
              validation={state.validation}
              onValidateName={validateProjectName}
              defaultName={state.repository?.name || ""}
              defaultDescription={state.repository?.description || ""}
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
                ${
                  state.currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
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
                  ${
                    canProceed()
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}

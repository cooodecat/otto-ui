'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Bell, Palette, Shield, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as ApiUser } from '@/types/api';
import { setApiToken, useApi } from '@/lib/api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * SettingsModal 컴포넌트의 Props 인터페이스
 */
interface SettingsModalProps {
  /** 모달의 열림/닫힘 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 함수 */
  onClose: () => void;
}

/**
 * 설정 섹션 인터페이스
 */
interface SettingSection {
  /** 섹션 ID */
  id: string;
  /** 섹션 제목 */
  title: string;
  /** 섹션 아이콘 */
  icon: React.ComponentType<{ className?: string }>;
  /** 섹션 설명 */
  description: string;
}

/**
 * 설정 모달 컴포넌트
 *
 * React Portal을 사용하여 document.body에 직접 렌더링되는 전체 화면 모달입니다.
 *
 * 주요 기능:
 * - ESC 키로 모달 닫기
 * - 백드롭 클릭으로 모달 닫기
 * - 다양한 설정 섹션 제공
 * - 접근성 고려 (aria-label, role 등)
 *
 * @param props - SettingsModalProps
 * @returns 설정 모달을 나타내는 JSX 엘리먼트 또는 null
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('profile');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const supabase = createClient();
  const api = useApi();
  const router = useRouter();

  const fetchUserProfile = useCallback(async (sessionToken: string) => {
    try {
      setApiToken(sessionToken);
      const { data: profileData, error } = await api.getUserProfile();

      if (error) {
        console.error("Profile fetch error:", error);
        setHasError(true);
      } else {
        setApiUser(profileData || null);
        setHasError(false);
      }
    } catch (err) {
      console.error("Profile API call failed:", err);
      setHasError(true);
    }
  }, [api]);

  useEffect(() => {
    if (!isOpen) return;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(user);

      if (session?.access_token && !hasError) {
        await fetchUserProfile(session.access_token);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        setUser(session.user);
        if (!hasError) {
          await fetchUserProfile(session.access_token);
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoggingOut(false);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // 백드롭 클릭 처리
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /**
   * 설정 섹션 목록
   */
  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: '프로필',
      icon: User,
      description: '사용자 정보 및 계정 설정'
    },
    {
      id: 'notifications',
      title: '알림',
      icon: Bell,
      description: '알림 설정 및 이메일 구독 관리'
    },
    {
      id: 'appearance',
      title: '테마',
      icon: Palette,
      description: '다크 모드 및 인터페이스 설정'
    },
    {
      id: 'security',
      title: '보안',
      icon: Shield,
      description: '비밀번호 및 2단계 인증 설정'
    },
    {
      id: 'help',
      title: '도움말',
      icon: HelpCircle,
      description: '사용법 가이드 및 지원'
    }
  ];

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 모달 JSX
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      {/* 백드롭 - 블러 효과와 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="settings-modal-title" className="text-2xl font-semibold text-gray-900">
              설정
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              계정 및 애플리케이션 설정을 관리하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="설정 모달 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* 사이드바 - 설정 섹션 목록 */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <nav className="space-y-2">
              {settingSections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-start space-x-3 p-3 text-left rounded-lg transition-colors group ${
                    selectedTab === section.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTab(section.id)}
                >
                  <section.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-gray-800">
                      {section.title}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-600">
                      {section.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              {selectedTab === 'profile' ? (
                // 프로필 탭 - 대시보드 UserProfile 내용
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    </div>
                  ) : !user ? null : (
                    <div className="relative bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                      {/* 로그아웃 중 오버레이 */}
                      {isLoggingOut && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600 font-medium">로그아웃 중...</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-4">
                        {user.user_metadata?.avatar_url && (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {user.user_metadata?.full_name || user.email}
                          </h3>
                          {user.user_metadata?.user_name && (
                            <p className="text-gray-600">@{user.user_metadata.user_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">이메일:</span> {user.email}
                        </p>
                        {apiUser?.name && (
                          <p>
                            <span className="font-medium">이름:</span> {apiUser.name}
                          </p>
                        )}
                        {user.user_metadata?.user_name && (
                          <p>
                            <span className="font-medium">GitHub:</span>{" "}
                            {user.user_metadata.user_name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">로그인:</span>{" "}
                          {new Date(user.last_sign_in_at || "").toLocaleString("ko-KR")}
                        </p>
                        {apiUser?.created_at && (
                          <p>
                            <span className="font-medium">가입:</span>{" "}
                            {new Date(apiUser.created_at).toLocaleString("ko-KR")}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={cn(
                          "w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200",
                          isLoggingOut
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-700"
                        )}
                      >
                        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // 다른 탭들
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    설정 페이지 준비 중
                  </h3>
                  <p className="text-gray-500 mb-6">
                    좌측 메뉴에서 설정할 항목을 선택하세요.<br />
                    각 섹션별 상세 설정 페이지가 곧 추가될 예정입니다.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // React Portal을 사용하여 document.body에 렌더링
  // 이를 통해 사이드바나 다른 컴포넌트의 z-index 제약을 벗어남
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default SettingsModal;
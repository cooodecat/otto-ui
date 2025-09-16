"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import type { User as ApiUser } from "@/types/api";
import { setApiToken, useApi } from "@/lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const supabase = createClient();
  const api = useApi();
  const router = useRouter();

  // 백엔드에서 사용자 프로필 가져오기
  const fetchUserProfile = useCallback(
    async (sessionToken: string) => {
      // 이미 에러가 발생했으면 재시도하지 않음
      if (hasError) return;

      try {
        setApiToken(sessionToken);
        const { data: profileData, error } = await api.getUserProfile();

        if (error) {
          // 프로필 가져오기 실패 처리
          console.error("Profile fetch error:", error);
          setHasError(true); // 에러 상태 설정하여 재시도 방지
        } else {
          setApiUser(profileData || null);
          setHasError(false);
        }
      } catch (err) {
        // 프로필 API 호출 실패 처리
        console.error("Profile API call failed:", err);
        setHasError(true); // 에러 상태 설정하여 재시도 방지
      }
    },
    [api, hasError]
  );

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(user);

      // 백엔드에서 사용자 프로필 가져오기
      if (session?.access_token) {
        await fetchUserProfile(session.access_token);
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        setUser(session.user);
        await fetchUserProfile(session.access_token);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        // 로그아웃 완료 시 바로 리다이렉트
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 빈 배열로 변경 - 컴포넌트 마운트 시 한 번만 실행

  const handleLogout = async () => {
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      // Logout error handling
      setIsLoggingOut(false);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
    // 성공 시 onAuthStateChange에서 리다이렉트 처리
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
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
          isLoggingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
        )}
      >
        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
      </button>
    </div>
  );
}

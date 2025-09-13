"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { User as ApiUser } from "@/types/api";
import { setApiToken, useApi } from "@/lib/api";
import Image from "next/image";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const supabase = createClient();
  const api = useApi();

  // 백엔드에서 사용자 프로필 가져오기
  const fetchUserProfile = async (sessionToken: string) => {
    try {
      setProfileLoading(true);
      setApiToken(sessionToken);
      const { data: profileData, error } = await api.getUserProfile();

      if (error) {
        console.error("프로필 가져오기 실패:", error);
      } else {
        setApiUser(profileData || null);
      }
    } catch (err) {
      console.error("프로필 API 호출 실패:", err);
    } finally {
      setProfileLoading(false);
    }
  };

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
      setUser(session?.user ?? null);

      // 로그인 시 백엔드 프로필도 가져오기
      if (event === "SIGNED_IN" && session?.access_token) {
        await fetchUserProfile(session.access_token);
      } else if (event === "SIGNED_OUT") {
        setApiUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Logout error:", error.message);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
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
        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        로그아웃
      </button>
    </div>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
  variant?: "default" | "large" | "icon";
  text?: string;
}

export default function LoginButton({
  className,
  variant = "default",
  text = "GitHub으로 계속하기",
}: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Login error handling
        alert("로그인 중 오류가 발생했습니다: " + error.message);
      }
    } catch {
      // Unexpected error handling
      alert("예상치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // GitHub 브랜드 가이드라인에 맞는 스타일
  const baseStyles =
    "relative inline-flex items-center justify-center gap-3 font-medium transition-all duration-200 rounded-lg";

  const variantStyles = {
    // 표준 GitHub 소셜 로그인 버튼 (검은색 배경)
    default: `
      bg-[#24292e] hover:bg-[#1a1e22] text-white
      px-5 py-2.5 text-sm border border-[#24292e]
      shadow-sm hover:shadow-md
    `,
    // 큰 버튼 (signin 페이지용)
    large: `
      bg-[#24292e] hover:bg-[#1a1e22] text-white
      px-6 py-3 text-base border border-[#24292e]
      shadow-md hover:shadow-lg transform hover:scale-[1.02]
    `,
    // 아이콘만 있는 버튼
    icon: `
      bg-[#24292e] hover:bg-[#1a1e22] text-white
      p-2.5 border border-[#24292e]
      shadow-sm hover:shadow-md
    `,
  };

  const disabledStyles =
    "opacity-50 cursor-not-allowed hover:bg-[#24292e] hover:shadow-sm hover:scale-100";

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        loading && disabledStyles,
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {variant !== "icon" && <span>연결 중...</span>}
        </div>
      ) : (
        <>
          {/* GitHub Octocat Logo */}
          <svg
            className={cn(
              "flex-shrink-0",
              variant === "icon" ? "w-5 h-5" : "w-5 h-5"
            )}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {variant !== "icon" && <span>{text}</span>}
        </>
      )}
    </button>
  );
}

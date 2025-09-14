"use client";

import { Cpu, Github } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background Effects - 동일한 배경 효과 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="relative z-50 w-full">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-3 rounded-2xl shadow-lg shadow-purple-500/25 ring-2 ring-white/10 group-hover:scale-105 transition-transform">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent tracking-tight">
                Otto
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Sign Up Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-lg shadow-purple-500/25 mb-4">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  계정을 만드세요
                </span>
              </h1>
              <p className="text-gray-400">
                GitHub 계정으로 간편하게 시작하세요
              </p>
            </div>

            {/* Sign Up Button */}
            <div className="space-y-4">
              <LoginButton
                className="w-full"
                variant="large"
                text="GitHub으로 계속하기"
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-500">또는</span>
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">
                  이미 계정이 있으신가요? GitHub으로 바로 로그인됩니다
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Github className="w-4 h-4" />
                  <span>GitHub OAuth로 안전하게 인증</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">
                      빠른 시작
                    </p>
                    <p className="text-xs text-gray-500">
                      5분 안에 첫 워크플로우 생성
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">
                      무료 시작
                    </p>
                    <p className="text-xs text-gray-500">
                      신용카드 없이 바로 시작
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">
                      안전한 인증
                    </p>
                    <p className="text-xs text-gray-500">
                      GitHub OAuth 2.0 사용
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-600 mt-6">
            회원가입 시{" "}
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              이용약관
            </a>{" "}
            및{" "}
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-6 text-center text-gray-600 text-sm">
        <p>&copy; 2024 Otto. All rights reserved.</p>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  Star,
  GitFork,
  Calendar,
  Globe,
  Lock,
  ChevronDown,
  Code,
} from "lucide-react";
import { Repository, Branch } from "./types";

interface StepOneProps {
  repository: Repository;
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  isLoading: boolean;
  onLoadBranches: () => void;
  error?: string | null;
}

export default function StepOne({
  repository,
  branches,
  selectedBranch,
  onBranchChange,
  isLoading,
  onLoadBranches,
  error,
}: StepOneProps) {
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  useEffect(() => {
    // 컴포넌트 마운트 시 브랜치 목록 로드
    if (branches.length === 0 && !isLoading && !error) {
      onLoadBranches();
    }
  }, [branches.length, isLoading, error, onLoadBranches]);

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const selectedBranchData = branches.find((b) => b.name === selectedBranch);

  // 언어 통계 계산
  const totalBytes = Object.values(repository.languages || {}).reduce(
    (a, b) => a + b,
    0
  );
  const topLanguages = Object.entries(repository.languages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: Math.round((bytes / totalBytes) * 100),
    }));

  return (
    <div className="p-8 space-y-6">
      {/* Repository Info Card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-5 h-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {repository.owner}/{repository.name}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  repository.visibility === "Public"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {repository.visibility === "Public" ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {repository.visibility}
                </span>
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {repository.description || "설명이 없습니다"}
            </p>
          </div>
        </div>

        {/* Repository Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4" />
            <span>{repository.stars.toLocaleString()} stars</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GitFork className="w-4 h-4" />
            <span>{repository.forks.toLocaleString()} forks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{repository.updatedAt}</span>
          </div>
        </div>

        {/* Language Stats */}
        {topLanguages.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                주요 언어
              </span>
            </div>
            <div className="space-y-2">
              {topLanguages.map((lang, index) => (
                <div key={lang.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">
                    {lang.name}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0
                          ? "bg-purple-500"
                          : index === 1
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Branch Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          브랜치 선택
        </h4>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">오류</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={onLoadBranches}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {selectedBranch || "브랜치를 선택하세요"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                branchDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Branch Dropdown */}
          {branchDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="브랜치 검색..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    브랜치 목록을 불러오는 중...
                  </div>
                ) : filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => {
                        onBranchChange(branch.name);
                        setBranchDropdownOpen(false);
                        setBranchSearch("");
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                        branch.name === selectedBranch
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="font-medium">{branch.name}</div>
                      {branch.commit && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {branch.commit.message.substring(0, 50)}...
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    브랜치를 찾을 수 없습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Branch Info */}
        {selectedBranchData && selectedBranchData.commit && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-900 mb-1">
              최신 커밋
            </div>
            <div className="text-sm text-purple-700">
              {selectedBranchData.commit.message}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-purple-600">
              <span>{selectedBranchData.commit.author}</span>
              <span>{selectedBranchData.commit.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

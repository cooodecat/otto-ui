"use client";

import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";

interface ProjectHeaderProps {
  onCreateProject: () => void;
}

export default function ProjectHeader({ onCreateProject }: ProjectHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">프로젝트</h1>
        <p className="text-gray-600 mt-1">
          CI/CD 파이프라인을 관리하고 배포를 모니터링합니다
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>필터</span>
        </button>

        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>프로젝트 생성</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { ProjectConfig } from './types';

interface StepTwoProps {
  projectConfig: ProjectConfig;
  onConfigChange: (config: ProjectConfig) => void;
  validation: {
    isNameValid: boolean;
    nameError: string | null;
    isChecking: boolean;
  };
  onValidateName: (name: string) => void;
  defaultName: string;
  defaultDescription: string;
}

export default function StepTwo({
  projectConfig,
  onConfigChange,
  validation,
  onValidateName,
  defaultName,
  defaultDescription,
}: StepTwoProps) {
  const [touched, setTouched] = useState({
    name: false,
    description: false,
  });

  // 초기값 설정
  useEffect(() => {
    if (!projectConfig.name && defaultName) {
      onConfigChange({
        ...projectConfig,
        name: defaultName,
      });
      onValidateName(defaultName);
    }
    if (!projectConfig.description && defaultDescription) {
      onConfigChange({
        ...projectConfig,
        description: defaultDescription,
      });
    }
  }, [defaultName, defaultDescription]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onConfigChange({
      ...projectConfig,
      name: newName,
    });

    // Debounced validation
    if (newName.length > 0) {
      const timer = setTimeout(() => {
        onValidateName(newName);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({
      ...projectConfig,
      description: e.target.value,
    });
  };

  const handleBlur = (field: 'name' | 'description') => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Project Name */}
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
          프로젝트 이름 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="project-name"
            type="text"
            value={projectConfig.name}
            onChange={handleNameChange}
            onBlur={() => handleBlur('name')}
            className={`
              w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors
              ${validation.nameError && touched.name
                ? 'border-red-300 focus:ring-red-500 pr-10'
                : validation.isNameValid && touched.name
                  ? 'border-green-300 focus:ring-green-500 pr-10'
                  : 'border-gray-300 focus:ring-purple-500'
              }
            `}
            placeholder="my-awesome-project"
          />

          {/* Validation Icon */}
          {validation.isChecking ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : validation.nameError && touched.name ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          ) : validation.isNameValid && touched.name ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ) : null}
        </div>

        {/* Error Message */}
        {validation.nameError && touched.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validation.nameError}
          </p>
        )}

        {/* Success Message */}
        {validation.isNameValid && touched.name && !validation.nameError && (
          <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            사용 가능한 프로젝트 이름입니다
          </p>
        )}

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500">
          영문, 숫자, 하이픈(-)만 사용 가능합니다. 3-50자 이내로 입력하세요.
        </p>
      </div>

      {/* Project Description */}
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
          프로젝트 설명 <span className="text-gray-400 text-xs">(선택사항)</span>
        </label>
        <textarea
          id="project-description"
          value={projectConfig.description}
          onChange={handleDescriptionChange}
          onBlur={() => handleBlur('description')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            마크다운 형식을 지원합니다
          </p>
          <p className="text-xs text-gray-500">
            {projectConfig.description.length} / 500
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">알아두세요</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 프로젝트 이름은 생성 후 변경할 수 없습니다</li>
              <li>• 프로젝트 설명은 언제든지 수정 가능합니다</li>
              <li>• 동일한 이름의 프로젝트가 있으면 생성할 수 없습니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {(projectConfig.name || projectConfig.description) && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">미리보기</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {projectConfig.name || '프로젝트 이름'}
            </h3>
            {projectConfig.description && (
              <p className="text-sm text-gray-600 mt-2">
                {projectConfig.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
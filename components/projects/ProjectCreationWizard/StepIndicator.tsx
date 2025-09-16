"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
}

const steps = [
  { number: 1, title: "저장소 정보", description: "브랜치 선택" },
  { number: 2, title: "프로젝트 설정", description: "이름과 설명" },
  { number: 3, title: "확인", description: "생성 준비" },
];

export default function StepIndicator({
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full px-8 py-6">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>

        {/* Progress Bar Fill */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-purple-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isClickable = step.number < currentStep;

            return (
              <button
                key={step.number}
                onClick={() =>
                  isClickable && onStepClick(step.number as 1 | 2 | 3)
                }
                disabled={!isClickable}
                className={`flex flex-col items-center ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-purple-600 text-white"
                        : isCurrent
                        ? "bg-purple-600 text-white ring-4 ring-purple-100"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Text */}
      <div className="text-center mt-6">
        <span className="text-sm text-gray-600">
          진행률:{" "}
          <span className="font-semibold text-purple-600">
            {Math.round(progressPercentage)}%
          </span>{" "}
          완료
        </span>
      </div>
    </div>
  );
}

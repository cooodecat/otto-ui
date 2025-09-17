"use client";

import { useEffect, useState } from "react";
import {
  GitBranch,
  Hammer,
  CheckCircle,
  Rocket,
  ArrowRight,
} from "lucide-react";

interface FlowStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
}

const flowSteps: FlowStep[] = [
  {
    id: 1,
    icon: <GitBranch className="w-8 h-8" />,
    title: "GitHub 웹훅",
    description: "코드 푸시 감지",
    color: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-500/20 to-purple-600/20",
  },
  {
    id: 2,
    icon: <Hammer className="w-8 h-8" />,
    title: "빌드",
    description: "자동 빌드 실행",
    color: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    id: 3,
    icon: <CheckCircle className="w-8 h-8" />,
    title: "테스트",
    description: "품질 검증",
    color: "from-green-500 to-green-600",
    bgGradient: "from-green-500/20 to-green-600/20",
  },
  {
    id: 4,
    icon: <Rocket className="w-8 h-8" />,
    title: "배포",
    description: "프로덕션 릴리즈",
    color: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-500/20 to-orange-600/20",
  },
];

export default function CICDFlowVisualization() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        // Stop at the last step (flowSteps.length)
        if (prev >= flowSteps.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-12">
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 blur-3xl rounded-full" />

        {/* Flow container */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          {flowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative transition-all duration-500 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Connection line (except for last item) */}
              {index < flowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight
                    className={`w-8 h-8 transition-all duration-500 ${
                      activeStep > index
                        ? "text-purple-500 scale-110"
                        : "text-gray-600"
                    }`}
                  />
                </div>
              )}

              {/* Step card */}
              <div
                className={`relative group transition-all duration-500 ${
                  activeStep === index + 1 ? "scale-105" : "scale-100"
                }`}
              >
                {/* Active background glow */}
                {activeStep === index + 1 && (
                  <div
                    className={`absolute -inset-4 bg-gradient-to-r ${step.bgGradient} rounded-2xl blur-xl opacity-60 animate-pulse`}
                  />
                )}

                {/* Card */}
                <div
                  className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 ${
                    activeStep === index + 1
                      ? "border-purple-500/50 shadow-2xl shadow-purple-500/20"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Icon container */}
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${
                      step.color
                    } mb-6 transition-all duration-500 ${
                      activeStep === index + 1 ? "scale-110 shadow-lg" : ""
                    }`}
                  >
                    <div className="text-white">{step.icon}</div>
                  </div>

                  {/* Text content */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-400">{step.description}</p>

                  {/* Progress indicator */}
                  {activeStep === index + 1 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile flow indicators */}
        <div className="flex md:hidden justify-center mt-8 gap-2">
          {flowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`h-1 transition-all duration-500 rounded-full ${
                activeStep === index + 1
                  ? "w-8 bg-purple-500"
                  : "w-2 bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "10%", top: "20%" },
            { left: "25%", top: "60%" },
            { left: "45%", top: "30%" },
            { left: "60%", top: "70%" },
            { left: "75%", top: "40%" },
            { left: "90%", top: "15%" },
          ].map((position, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
              style={{
                left: position.left,
                top: position.top,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${10 + i * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

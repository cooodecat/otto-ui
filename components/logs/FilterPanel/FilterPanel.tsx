"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Check, Circle } from "lucide-react";
import { FilterPanelProps, FilterOption, DropdownPosition } from "@/types/logs";
import { useFilters } from "@/hooks/logs/useFilters";

/**
 * Filter Panel Component
 *
 * Timeline, Status, Trigger, Branch, Author 필터링 기능 제공
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 드롭다운 열림/닫힘 상태
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isAuthorOpen, setIsAuthorOpen] = useState(false);

  // 드롭다운 위치 상태
  const [dropdownPositions, setDropdownPositions] = useState<DropdownPosition>({
    timeline: "bottom",
    status: "bottom",
    trigger: "bottom",
    branch: "bottom",
    author: "bottom",
  });

  // 드롭다운 참조들
  const timelineDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const triggerDropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const authorDropdownRef = useRef<HTMLDivElement>(null);

  // 필터 상태 관리
  const { filters, setFilter, resetFilters } = useFilters({
    initialFilters,
    syncWithURL: true,
    updateURL: (filters, path) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaultValues = {
        timeline: "all-time",
        status: "any-status",
        trigger: "all-triggers",
        branch: "all-branches",
        author: "all-authors",
      };

      // 기본값과 다른 경우만 URL에 추가
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== defaultValues[key as keyof typeof defaultValues]) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const newURL = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(newURL);
    },
    parseURLParams: () => {
      return {
        timeline: searchParams.get("timeline") || "all-time",
        status: searchParams.get("status") || "any-status",
        trigger: searchParams.get("trigger") || "all-triggers",
        branch: searchParams.get("branch") || "all-branches",
        author: searchParams.get("author") || "all-authors",
      };
    },
    pathname,
  });

  // 필터 옵션 데이터
  const timelineOptions: FilterOption[] = [
    { value: "all-time", label: "All time", description: "" },
    { value: "today", label: "Today", description: "24h" },
    { value: "week", label: "This week", description: "7d" },
    { value: "month", label: "This month", description: "30d" },
  ];

  const statusOptions: FilterOption[] = [
    { value: "any-status", label: "Any status" },
    {
      value: "running",
      label: "Running",
      icon: <Circle className="h-3 w-3 text-blue-500 animate-pulse" />,
    },
    {
      value: "success",
      label: "Success",
      icon: <Circle className="h-3 w-3 text-green-500" />,
    },
    {
      value: "failed",
      label: "Failed",
      icon: <Circle className="h-3 w-3 text-red-500" />,
    },
    {
      value: "pending",
      label: "Pending",
      icon: <Circle className="h-3 w-3 text-yellow-500" />,
    },
  ];

  const triggerOptions: FilterOption[] = [
    { value: "all-triggers", label: "All triggers" },
    { value: "push", label: "Push to branch" },
    { value: "pr-merged", label: "PR merged" },
    { value: "manual", label: "Manual trigger" },
    { value: "scheduled", label: "Scheduled" },
  ];

  const branchOptions: FilterOption[] = [
    { value: "all-branches", label: "All branches" },
    {
      value: "main",
      label: "main",
      icon: <div className="h-2 w-2 rounded-full bg-purple-500" />,
    },
    {
      value: "develop",
      label: "develop",
      icon: <div className="h-2 w-2 rounded-full bg-blue-500" />,
    },
    {
      value: "staging",
      label: "staging",
      icon: <div className="h-2 w-2 rounded-full bg-orange-500" />,
    },
  ];

  const authorOptions: FilterOption[] = [
    { value: "all-authors", label: "All authors" },
    { value: "john-doe", label: "John Doe" },
    { value: "jane-smith", label: "Jane Smith" },
    { value: "dev-team", label: "Dev Team" },
    { value: "admin", label: "Admin User" },
  ];

  // 필터 변경 시 부모에게 알림
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Portal 드롭다운 내부 클릭인지 확인
      const isPortalDropdownClick = target.closest(".portal-dropdown");
      if (isPortalDropdownClick) {
        return;
      }

      // 각 드롭다운 참조 확인
      const dropdownRefs = [
        { ref: timelineDropdownRef, setter: setIsTimelineOpen },
        { ref: statusDropdownRef, setter: setIsStatusOpen },
        { ref: triggerDropdownRef, setter: setIsTriggerOpen },
        { ref: branchDropdownRef, setter: setIsBranchOpen },
        { ref: authorDropdownRef, setter: setIsAuthorOpen },
      ];

      dropdownRefs.forEach(({ ref, setter }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setter(false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 스크롤 시 드롭다운 닫기
  useEffect(() => {
    const isAnyDropdownOpen =
      isTimelineOpen ||
      isStatusOpen ||
      isTriggerOpen ||
      isBranchOpen ||
      isAuthorOpen;

    const handleScroll = () => {
      if (isAnyDropdownOpen) {
        closeAllDropdowns();
      }
    };

    if (isAnyDropdownOpen) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      const scrollableContainer = document.querySelector(".overflow-y-auto");
      if (scrollableContainer) {
        scrollableContainer.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }

      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollableContainer) {
          scrollableContainer.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [isTimelineOpen, isStatusOpen, isTriggerOpen, isBranchOpen, isAuthorOpen]);

  // 모든 드롭다운 닫기
  const closeAllDropdowns = () => {
    setIsTimelineOpen(false);
    setIsStatusOpen(false);
    setIsTriggerOpen(false);
    setIsBranchOpen(false);
    setIsAuthorOpen(false);
  };

  // 드롭다운 높이 계산
  const calculateDropdownHeight = (optionsCount: number): number => {
    const headerHeight = 48;
    const optionHeight = 40;
    const containerPadding = 8;
    const maxVisibleOptions = 4;

    if (optionsCount <= 1) {
      return headerHeight + containerPadding;
    }

    const scrollableOptions = optionsCount - 1;
    const visibleScrollableOptions = Math.min(
      scrollableOptions,
      maxVisibleOptions
    );

    return (
      headerHeight + visibleScrollableOptions * optionHeight + containerPadding
    );
  };

  // 드롭다운 위치 계산
  const calculateDropdownPosition = (
    element: HTMLElement,
    optionsCount: number
  ): "top" | "bottom" => {
    if (!element) return "bottom";

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = calculateDropdownHeight(optionsCount);
    const margin = 16;

    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const isSpaceBelowSufficient = spaceBelow >= dropdownHeight + 20;
    const isSpaceAboveSufficient = spaceAbove >= dropdownHeight + 20;

    if (isSpaceBelowSufficient) {
      return "bottom";
    } else if (isSpaceAboveSufficient) {
      return "top";
    } else {
      return spaceBelow >= spaceAbove ? "bottom" : "top";
    }
  };

  // Portal 드롭다운 스타일 계산
  const getDropdownPortalStyle = (
    buttonRef: React.RefObject<HTMLDivElement | null>,
    direction: "top" | "bottom",
    height: number
  ): React.CSSProperties => {
    if (!buttonRef.current) return {};

    const rect = buttonRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    };

    const gap = 4;

    if (direction === "bottom") {
      style.top = rect.bottom + gap;
    } else {
      style.top = rect.top - height - gap;
    }

    style.height = height;

    return style;
  };

  // 드롭다운 옵션 렌더링
  const renderDropdownOptions = (
    options: FilterOption[],
    currentValue: string,
    onSelect: (value: string) => void,
    isOpen: boolean,
    onToggle: () => void,
    positions: keyof DropdownPosition,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    const selectedOption = options.find((opt) => opt.value === currentValue);

    return (
      <div className="relative overflow-visible" ref={ref}>
        <button
          onClick={onToggle}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-center justify-between"
        >
          <span className="text-left flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || "Select option"}
            {selectedOption?.description && ` (${selectedOption.description})`}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isOpen &&
          createPortal(
            <div
              className="bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col portal-dropdown"
              style={getDropdownPortalStyle(
                ref,
                dropdownPositions[positions],
                calculateDropdownHeight(options.length)
              )}
            >
              {/* 고정된 헤더 - 첫 번째 옵션 */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(options[0]?.value || "");
                    onToggle();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors rounded-t-lg ${
                    options[0]?.value === currentValue
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {options[0]?.icon}
                    <span>{options[0]?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {options[0]?.description && (
                      <span className="text-xs text-gray-500">
                        {options[0].description}
                      </span>
                    )}
                    {options[0]?.value === currentValue && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
                {options.length > 1 && (
                  <div className="border-t border-gray-100" />
                )}
              </div>

              {/* 스크롤 가능한 나머지 옵션들 */}
              {options.length > 1 && (
                <div
                  className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  style={{ maxHeight: "168px" }}
                >
                  {options.slice(1).map((option, index) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(option.value);
                        onToggle();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${
                        index === options.slice(1).length - 1
                          ? "rounded-b-lg"
                          : ""
                      } ${
                        option.value === currentValue
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {option.description && (
                          <span className="text-xs text-gray-500">
                            {option.description}
                          </span>
                        )}
                        {option.value === currentValue && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>,
            document.body
          )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0 overflow-visible filter-panel-container ${className}`}
    >
      <div
        className="flex-1 space-y-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] filter-panel-content"
        style={{ overflowY: "auto", overflowX: "visible" }}
      >
        {/* Timeline Filter */}
        <div className="space-y-3 pl-0.5 overflow-visible">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            Timeline
          </h4>
          {renderDropdownOptions(
            timelineOptions,
            filters.timeline,
            (value) => setFilter("timeline", value),
            isTimelineOpen,
            () => {
              const currentState = isTimelineOpen;
              closeAllDropdowns();
              if (!currentState && timelineDropdownRef.current) {
                const position = calculateDropdownPosition(
                  timelineDropdownRef.current,
                  timelineOptions.length
                );
                setDropdownPositions((prev) => ({
                  ...prev,
                  timeline: position,
                }));
              }
              setIsTimelineOpen(!currentState);
            },
            "timeline",
            timelineDropdownRef
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-3 pl-0.5 overflow-visible">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            Status
          </h4>
          {renderDropdownOptions(
            statusOptions,
            filters.status,
            (value) => setFilter("status", value),
            isStatusOpen,
            () => {
              const currentState = isStatusOpen;
              closeAllDropdowns();
              if (!currentState && statusDropdownRef.current) {
                const position = calculateDropdownPosition(
                  statusDropdownRef.current,
                  statusOptions.length
                );
                setDropdownPositions((prev) => ({ ...prev, status: position }));
              }
              setIsStatusOpen(!currentState);
            },
            "status",
            statusDropdownRef
          )}
        </div>

        {/* Trigger Filter */}
        <div className="space-y-3 pl-0.5 overflow-visible">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            Trigger
          </h4>
          {renderDropdownOptions(
            triggerOptions,
            filters.trigger,
            (value) => setFilter("trigger", value),
            isTriggerOpen,
            () => {
              const currentState = isTriggerOpen;
              closeAllDropdowns();
              if (!currentState && triggerDropdownRef.current) {
                const position = calculateDropdownPosition(
                  triggerDropdownRef.current,
                  triggerOptions.length
                );
                setDropdownPositions((prev) => ({
                  ...prev,
                  trigger: position,
                }));
              }
              setIsTriggerOpen(!currentState);
            },
            "trigger",
            triggerDropdownRef
          )}
        </div>

        {/* Branch Filter */}
        <div className="space-y-3 pl-0.5 overflow-visible">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            Branch
          </h4>
          {renderDropdownOptions(
            branchOptions,
            filters.branch,
            (value) => setFilter("branch", value),
            isBranchOpen,
            () => {
              const currentState = isBranchOpen;
              closeAllDropdowns();
              if (!currentState && branchDropdownRef.current) {
                const position = calculateDropdownPosition(
                  branchDropdownRef.current,
                  branchOptions.length
                );
                setDropdownPositions((prev) => ({ ...prev, branch: position }));
              }
              setIsBranchOpen(!currentState);
            },
            "branch",
            branchDropdownRef
          )}
        </div>

        {/* Author Filter */}
        <div className="space-y-3 pl-0.5 overflow-visible">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            Author
          </h4>
          {renderDropdownOptions(
            authorOptions,
            filters.author,
            (value) => setFilter("author", value),
            isAuthorOpen,
            () => {
              const currentState = isAuthorOpen;
              closeAllDropdowns();
              if (!currentState && authorDropdownRef.current) {
                const position = calculateDropdownPosition(
                  authorDropdownRef.current,
                  authorOptions.length
                );
                setDropdownPositions((prev) => ({ ...prev, author: position }));
              }
              setIsAuthorOpen(!currentState);
            },
            "author",
            authorDropdownRef
          )}
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-gray-700 cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

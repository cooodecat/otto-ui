import React from "react";
import { clsx } from "clsx";

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: (checked: boolean) => void;
  className?: string;
}

/**
 * Toggle Switch Component
 *
 * Live 모드 등의 on/off 상태를 위한 토글 스위치
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  isOn,
  onToggle,
  className = "",
}) => {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onToggle(!isOn)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg cursor-pointer",
          isOn
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-200 hover:bg-gray-300"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm",
            isOn ? "translate-x-6 scale-110" : "translate-x-1 hover:scale-105"
          )}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
export { ToggleSwitch };

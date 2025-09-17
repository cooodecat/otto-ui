/**
 * Icon mapping utility for converting icon names to Lucide React components
 */

import React from "react";
import {
  Play,
  Settings,
  Hammer,
  FlaskConical,
  Rocket,
  Megaphone,
  Wrench,
  Bot,
  Link,
  Diamond,
  Code,
  Brain,
  User,
  Package,
  Circle,
  Globe,
  Download,
  Zap,
  TestTube2,
  Coffee,
  Drama,
  MessageSquare,
  Mail,
  GitBranch,
  Terminal,
} from "lucide-react";

/**
 * Map of icon names to Lucide React components
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Core workflow icons
  Play,
  Bot,
  Link,
  Diamond,
  Code,
  Brain,
  User,

  // CI/CD Group icons
  Settings,
  Hammer,
  Flask: FlaskConical,
  FlaskConical,
  Rocket,
  Megaphone,
  Wrench,

  // CI/CD Block icons
  Package,
  Circle,
  Globe,
  Download,
  Zap,
  TestTube: TestTube2,
  TestTube2,
  Coffee,
  Theater: Drama,
  Drama,
  MessageSquare,
  Mail,
  GitBranch,
  Terminal,
};

/**
 * Get a Lucide icon component by name
 * @param iconName - The name of the icon (e.g., "Play", "Settings")
 * @param className - Optional CSS class for the icon
 * @param fallback - Optional fallback icon name if the primary is not found
 * @returns React element of the icon or a default icon if not found
 */
export function getIcon(
  iconName: string,
  className: string = "w-4 h-4",
  fallback: string = "Circle"
): React.ReactElement {
  const IconComponent = iconMap[iconName] || iconMap[fallback] || Circle;
  return <IconComponent className={className} />;
}

/**
 * Render an icon from a name string or React element
 * @param icon - Icon name string or React element
 * @param className - Optional CSS class for the icon
 * @returns React element
 */
export function renderIcon(
  icon: string | React.ReactElement,
  className: string = "w-4 h-4"
): React.ReactElement {
  if (typeof icon === "string") {
    // Check if it's an emoji (simple check for non-ASCII characters)
    if (!/^[A-Za-z]+$/.test(icon)) {
      return <span className="text-sm">{icon}</span>;
    }
    // Otherwise, treat it as an icon name
    return getIcon(icon, className);
  }
  return icon;
}
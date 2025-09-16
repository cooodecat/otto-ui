/**
 * CI/CD 노드 타입 정의
 * 
 * ss/components의 Block 타입 시스템을 otto-ui의 노드 구조에 맞게 확장
 * 그룹별 색상 구분과 아이콘을 포함한 통합 타입 시스템
 */

import { CICDBlockGroup, CICDBlockType } from "./block-enum";
import { BaseNodeData } from "./node.types";



// 그룹별 색상 매핑
export const CICD_GROUP_COLORS = {
  [CICDBlockGroup.PREBUILD]: {
    colorClass: 'bg-blue-500',
    colorHex: '#3b82f6',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    icon: '⚙️'
  },
  [CICDBlockGroup.BUILD]: {
    colorClass: 'bg-emerald-500',
    colorHex: '#10b981',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700',
    icon: '🔨'
  },
  [CICDBlockGroup.TEST]: {
    colorClass: 'bg-purple-500',
    colorHex: '#8b5cf6',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-700',
    icon: '🧪'
  },
  // [CICDBlockGroup.DEPLOY]: {
  //   colorClass: 'bg-orange-500',
  //   colorHex: '#f97316',
  //   bgClass: 'bg-orange-50',
  //   borderClass: 'border-orange-200',
  //   textClass: 'text-orange-700',
  //   icon: '🚀'
  // },
  [CICDBlockGroup.NOTIFICATION]: {
    colorClass: 'bg-yellow-500',
    colorHex: '#eab308',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-700',
    icon: '📢'
  },
  [CICDBlockGroup.UTILITY]: {
    colorClass: 'bg-gray-500',
    colorHex: '#6b7280',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-700',
    icon: '🔧'
  },
} as const;

// 기본 CI/CD 노드 데이터
export interface BaseCICDNodeData extends BaseNodeData {
  block_type: CICDBlockType;
  group_type: CICDBlockGroup;
  block_id: string;
  description?: string;
  on_success?: string;
  on_failed?: string;
  timeout?: number;
  retry_count?: number;
}

// ==== PREBUILD 블록 데이터 ====
export interface OSPackageNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.OS_PACKAGE;
  group_type: CICDBlockGroup.PREBUILD;
  package_manager: 'apt' | 'yum' | 'dnf' | 'apk' | 'zypper' | 'pacman' | 'brew';
  install_packages: string[];
  update_package_list?: boolean;
}

export interface NodeVersionNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.NODE_VERSION;
  group_type: CICDBlockGroup.PREBUILD;
  version: string;
  package_manager?: 'npm' | 'yarn' | 'pnpm';
}

export interface EnvironmentSetupNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.ENVIRONMENT_SETUP;
  group_type: CICDBlockGroup.PREBUILD;
  environment_variables: Record<string, string>;
  load_from_file?: string;
}

// ==== BUILD 블록 데이터 ====
export interface InstallNodePackageNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.INSTALL_MODULE_NODE;
  group_type: CICDBlockGroup.BUILD;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  install_packages?: string[];
  install_dev_dependencies?: boolean;
  production_only?: boolean;
  clean_install?: boolean;
}

export interface BuildWebpackNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.BUILD_WEBPACK;
  group_type: CICDBlockGroup.BUILD;
  config_file?: string;
  mode: 'development' | 'production';
  output_path?: string;
  additional_options?: string[];
}

export interface BuildViteNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.BUILD_VITE;
  group_type: CICDBlockGroup.BUILD;
  config_file?: string;
  mode: 'development' | 'production';
  base_path?: string;
  output_dir?: string;
}

export interface BuildCustomNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.BUILD_CUSTOM;
  group_type: CICDBlockGroup.BUILD;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  script_name?: string;
  custom_commands?: string[];
  working_directory?: string;
}

// ==== TEST 블록 데이터 ====
export interface TestJestNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.TEST_JEST;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  test_pattern?: string;
  coverage?: boolean;
  watch_mode?: boolean;
  max_workers?: number;
  additional_options?: string[];
}

export interface TestMochaNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.TEST_MOCHA;
  group_type: CICDBlockGroup.TEST;
  test_files?: string[];
  config_file?: string;
  reporter?: 'spec' | 'json' | 'html' | 'tap' | 'dot';
  timeout?: number;
  grep?: string;
}

export interface TestVitestNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.TEST_VITEST;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  coverage?: boolean;
  ui?: boolean;
  watch_mode?: boolean;
  environment?: 'node' | 'jsdom' | 'happy-dom';
}

export interface TestPlaywrightNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.TEST_PLAYWRIGHT;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  project?: string;
  headed?: boolean;
  debug?: boolean;
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
}

export interface TestCustomNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.TEST_CUSTOM;
  group_type: CICDBlockGroup.TEST;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  script_name?: string;
  custom_commands?: string[];
  generate_reports?: boolean;
  coverage_threshold?: number;
}

// ==== DEPLOY 블록 데이터 ====
// export interface DeployDockerNodeData extends BaseCICDNodeData {
//   block_type: CICDBlockType.DEPLOY_DOCKER;
//   group_type: CICDBlockGroup.DEPLOY;
//   docker_file?: string;
//   image_name: string;
//   image_tag?: string;
//   registry?: string;
//   build_args?: Record<string, string>;
// }

// export interface DeployVercelNodeData extends BaseCICDNodeData {
//   block_type: CICDBlockType.DEPLOY_VERCEL;
//   group_type: CICDBlockGroup.DEPLOY;
//   project_name?: string;
//   build_command?: string;
//   output_directory?: string;
//   environment_variables?: Record<string, string>;
// }

// export interface DeployAWSNodeData extends BaseCICDNodeData {
//   block_type: CICDBlockType.DEPLOY_AWS;
//   group_type: CICDBlockGroup.DEPLOY;
//   service: 'ec2' | 's3' | 'lambda' | 'ecs' | 'eks';
//   region: string;
//   credentials?: string;
//   config_file?: string;
// }

// export interface DeployCustomNodeData extends BaseCICDNodeData {
//   block_type: CICDBlockType.DEPLOY_CUSTOM;
//   group_type: CICDBlockGroup.DEPLOY;
//   commands: string[];
//   working_directory?: string;
//   environment_variables?: Record<string, string>;
// }

// ==== 유틸리티 블록 데이터 ====
export interface NotificationSlackNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.NOTIFICATION_SLACK;
  group_type: CICDBlockGroup.NOTIFICATION;
  webhook_url_env: string;
  channel?: string;
  message_template: string;
  on_success_only?: boolean;
  on_failure_only?: boolean;
}

export interface NotificationEmailNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.NOTIFICATION_EMAIL;
  group_type: CICDBlockGroup.NOTIFICATION;
  smtp_config: {
    host: string;
    port: number;
    username_env: string;
    password_env: string;
  };
  recipients: string[];
  subject_template: string;
  body_template: string;
}

export interface ConditionBranchNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.CONDITION_BRANCH;
  group_type: CICDBlockGroup.UTILITY;
  condition_type: 'environment' | 'file_exists' | 'command_output' | 'custom';
  condition_config: {
    environment_var?: string;
    expected_value?: string;
    file_path?: string;
    command?: string;
    custom_script?: string;
  };
  on_condition_true: string;
  on_condition_false: string;
}

export interface ParallelExecutionNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.PARALLEL_EXECUTION;
  group_type: CICDBlockGroup.UTILITY;
  parallel_branches: string[];
  wait_for_all?: boolean;
  fail_fast?: boolean;
  on_all_success: string;
  on_any_failure?: string;
}

export interface CustomCommandNodeData extends BaseCICDNodeData {
  block_type: CICDBlockType.CUSTOM_COMMAND;
  group_type: CICDBlockGroup.UTILITY;
  commands: string[];
  working_directory?: string;
  shell?: 'bash' | 'sh' | 'zsh' | 'fish';
  environment_variables?: Record<string, string>;
  ignore_errors?: boolean;
}

// 모든 CI/CD 노드 데이터 유니온 타입
export type AnyCICDNodeData = 
  | OSPackageNodeData
  | NodeVersionNodeData
  | EnvironmentSetupNodeData
  | InstallNodePackageNodeData
  | BuildWebpackNodeData
  | BuildViteNodeData
  | BuildCustomNodeData
  | TestJestNodeData
  | TestMochaNodeData
  | TestVitestNodeData
  | TestPlaywrightNodeData
  | TestCustomNodeData
  // | DeployDockerNodeData
  // | DeployVercelNodeData
  // | DeployAWSNodeData
  // | DeployCustomNodeData
  | NotificationSlackNodeData
  | NotificationEmailNodeData
  | ConditionBranchNodeData
  | ParallelExecutionNodeData
  | CustomCommandNodeData;

// 블록 타입별 그룹 매핑
export const BLOCK_TYPE_TO_GROUP: Record<CICDBlockType, CICDBlockGroup> = {
  [CICDBlockType.OS_PACKAGE]: CICDBlockGroup.PREBUILD,
  [CICDBlockType.NODE_VERSION]: CICDBlockGroup.PREBUILD,
  [CICDBlockType.ENVIRONMENT_SETUP]: CICDBlockGroup.PREBUILD,
  
  [CICDBlockType.INSTALL_MODULE_NODE]: CICDBlockGroup.BUILD,
  [CICDBlockType.BUILD_WEBPACK]: CICDBlockGroup.BUILD,
  [CICDBlockType.BUILD_VITE]: CICDBlockGroup.BUILD,
  [CICDBlockType.BUILD_CUSTOM]: CICDBlockGroup.BUILD,
  
  [CICDBlockType.TEST_JEST]: CICDBlockGroup.TEST,
  [CICDBlockType.TEST_MOCHA]: CICDBlockGroup.TEST,
  [CICDBlockType.TEST_VITEST]: CICDBlockGroup.TEST,
  [CICDBlockType.TEST_PLAYWRIGHT]: CICDBlockGroup.TEST,
  [CICDBlockType.TEST_CUSTOM]: CICDBlockGroup.TEST,
  
  // [CICDBlockType.DEPLOY_DOCKER]: CICDBlockGroup.DEPLOY,
  // [CICDBlockType.DEPLOY_VERCEL]: CICDBlockGroup.DEPLOY,
  // [CICDBlockType.DEPLOY_AWS]: CICDBlockGroup.DEPLOY,
  // [CICDBlockType.DEPLOY_CUSTOM]: CICDBlockGroup.DEPLOY,
  
  [CICDBlockType.NOTIFICATION_SLACK]: CICDBlockGroup.NOTIFICATION,
  [CICDBlockType.NOTIFICATION_EMAIL]: CICDBlockGroup.NOTIFICATION,
  
  [CICDBlockType.CONDITION_BRANCH]: CICDBlockGroup.UTILITY,
  [CICDBlockType.PARALLEL_EXECUTION]: CICDBlockGroup.UTILITY,
  [CICDBlockType.CUSTOM_COMMAND]: CICDBlockGroup.UTILITY,
};

// 블록 타입별 기본 라벨과 아이콘
export const CICD_BLOCK_CONFIGS = {
  [CICDBlockType.OS_PACKAGE]: { label: 'OS Packages', icon: '📦' },
  [CICDBlockType.NODE_VERSION]: { label: 'Node Version', icon: '🟢' },
  [CICDBlockType.ENVIRONMENT_SETUP]: { label: 'Environment', icon: '🌍' },
  
  [CICDBlockType.INSTALL_MODULE_NODE]: { label: 'Install Packages', icon: '📥' },
  [CICDBlockType.BUILD_WEBPACK]: { label: 'Webpack Build', icon: '📦' },
  [CICDBlockType.BUILD_VITE]: { label: 'Vite Build', icon: '⚡' },
  [CICDBlockType.BUILD_CUSTOM]: { label: 'Custom Build', icon: '🔨' },
  
  [CICDBlockType.TEST_JEST]: { label: 'Jest Tests', icon: '🃏' },
  [CICDBlockType.TEST_MOCHA]: { label: 'Mocha Tests', icon: '☕' },
  [CICDBlockType.TEST_VITEST]: { label: 'Vitest', icon: '⚡' },
  [CICDBlockType.TEST_PLAYWRIGHT]: { label: 'Playwright', icon: '🎭' },
  [CICDBlockType.TEST_CUSTOM]: { label: 'Custom Tests', icon: '🧪' },
  
  // [CICDBlockType.DEPLOY_DOCKER]: { label: 'Docker Deploy', icon: '🐳' },
  // [CICDBlockType.DEPLOY_VERCEL]: { label: 'Vercel Deploy', icon: '▲' },
  // [CICDBlockType.DEPLOY_AWS]: { label: 'AWS Deploy', icon: '☁️' },
  // [CICDBlockType.DEPLOY_CUSTOM]: { label: 'Custom Deploy', icon: '🚀' },
  
  [CICDBlockType.NOTIFICATION_SLACK]: { label: 'Slack Notify', icon: '💬' },
  [CICDBlockType.NOTIFICATION_EMAIL]: { label: 'Email Notify', icon: '📧' },
  
  [CICDBlockType.CONDITION_BRANCH]: { label: 'Condition', icon: '🔀' },
  [CICDBlockType.PARALLEL_EXECUTION]: { label: 'Parallel', icon: '⚡' },
  [CICDBlockType.CUSTOM_COMMAND]: { label: 'Custom Command', icon: '💻' },
} as const;
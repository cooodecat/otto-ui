/**
 * 백엔드로 전송할 Pipeline 데이터 타입 정의
 * 모든 필드는 snake_case 사용
 * DEPLOY 블록은 제외됨
 */

import { CICDBlockType, CICDBlockGroup } from './cicd-node.types';

// 기본 블록 구조
export interface PipelineBlock {
  block_id: string;
  block_type: CICDBlockType;
  group_type: CICDBlockGroup;
  label: string;
  description?: string;
  on_success?: string | null;
  on_failed?: string | null;
  timeout?: number;
  retry_count?: number;
}

// PREBUILD 블록들
export interface OSPackagePipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.OS_PACKAGE;
  group_type: CICDBlockGroup.PREBUILD;
  package_manager: 'apt' | 'yum' | 'dnf' | 'apk' | 'zypper' | 'pacman' | 'brew';
  install_packages: string[];
  update_package_list?: boolean;
}

export interface NodeVersionPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.NODE_VERSION;
  group_type: CICDBlockGroup.PREBUILD;
  version: string;
  package_manager?: 'npm' | 'yarn' | 'pnpm';
}

export interface EnvironmentSetupPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.ENVIRONMENT_SETUP;
  group_type: CICDBlockGroup.PREBUILD;
  environment_variables: Record<string, string>;
  load_from_file?: string;
}

// BUILD 블록들
export interface InstallNodePackagePipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.INSTALL_MODULE_NODE;
  group_type: CICDBlockGroup.BUILD;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  install_packages?: string[];
  install_dev_dependencies?: boolean;
  production_only?: boolean;
  clean_install?: boolean;
}

export interface BuildWebpackPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.BUILD_WEBPACK;
  group_type: CICDBlockGroup.BUILD;
  config_file?: string;
  mode: 'development' | 'production';
  output_path?: string;
  additional_options?: string[];
}

export interface BuildVitePipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.BUILD_VITE;
  group_type: CICDBlockGroup.BUILD;
  config_file?: string;
  mode: 'development' | 'production';
  base_path?: string;
  output_dir?: string;
}

export interface BuildCustomPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.BUILD_CUSTOM;
  group_type: CICDBlockGroup.BUILD;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  script_name?: string;
  custom_commands?: string[];
  working_directory?: string;
}

// TEST 블록들
export interface TestJestPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.TEST_JEST;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  test_pattern?: string;
  coverage?: boolean;
  watch_mode?: boolean;
  max_workers?: number;
  additional_options?: string[];
}

export interface TestMochaPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.TEST_MOCHA;
  group_type: CICDBlockGroup.TEST;
  test_files?: string[];
  config_file?: string;
  reporter?: 'spec' | 'json' | 'html' | 'tap' | 'dot';
  timeout?: number;
  grep?: string;
}

export interface TestVitestPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.TEST_VITEST;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  coverage?: boolean;
  ui?: boolean;
  watch_mode?: boolean;
  environment?: 'node' | 'jsdom' | 'happy-dom';
}

export interface TestPlaywrightPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.TEST_PLAYWRIGHT;
  group_type: CICDBlockGroup.TEST;
  config_file?: string;
  project?: string;
  headed?: boolean;
  debug?: boolean;
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
}

export interface TestCustomPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.TEST_CUSTOM;
  group_type: CICDBlockGroup.TEST;
  package_manager: 'npm' | 'yarn' | 'pnpm';
  script_name?: string;
  custom_commands?: string[];
  generate_reports?: boolean;
  coverage_threshold?: number;
}

// DEPLOY 블록들은 현재 지원하지 않음

// NOTIFICATION 블록들
export interface NotificationSlackPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.NOTIFICATION_SLACK;
  group_type: CICDBlockGroup.NOTIFICATION;
  webhook_url_env: string;
  channel?: string;
  message_template: string;
  on_success_only?: boolean;
  on_failure_only?: boolean;
}

export interface NotificationEmailPipelineBlock extends PipelineBlock {
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

// UTILITY 블록들
export interface ConditionBranchPipelineBlock extends PipelineBlock {
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

export interface ParallelExecutionPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.PARALLEL_EXECUTION;
  group_type: CICDBlockGroup.UTILITY;
  parallel_branches: string[];
  wait_for_all?: boolean;
  fail_fast?: boolean;
  on_all_success: string;
  on_any_failure?: string;
}

export interface CustomCommandPipelineBlock extends PipelineBlock {
  block_type: CICDBlockType.CUSTOM_COMMAND;
  group_type: CICDBlockGroup.UTILITY;
  commands: string[];
  working_directory?: string;
  shell?: 'bash' | 'sh' | 'zsh' | 'fish';
  environment_variables?: Record<string, string>;
  ignore_errors?: boolean;
}

// 모든 파이프라인 블록 유니온 타입 (DEPLOY 제외)
export type AnyPipelineBlock = 
  | OSPackagePipelineBlock
  | NodeVersionPipelineBlock
  | EnvironmentSetupPipelineBlock
  | InstallNodePackagePipelineBlock
  | BuildWebpackPipelineBlock
  | BuildVitePipelineBlock
  | BuildCustomPipelineBlock
  | TestJestPipelineBlock
  | TestMochaPipelineBlock
  | TestVitestPipelineBlock
  | TestPlaywrightPipelineBlock
  | TestCustomPipelineBlock
  | NotificationSlackPipelineBlock
  | NotificationEmailPipelineBlock
  | ConditionBranchPipelineBlock
  | ParallelExecutionPipelineBlock
  | CustomCommandPipelineBlock;

// 백엔드로 전송할 최종 파이프라인 데이터 구조
export interface PipelineData {
  pipeline_id: string;
  name: string;
  description?: string;
  created_at: string;
  blocks: AnyPipelineBlock[];
}

// API 요청/응답 타입
export interface RunPipelineRequest {
  pipeline: PipelineData;
}

export interface RunPipelineResponse {
  success: boolean;
  pipeline_id: string;
  execution_id: string;
  message: string;
}

export interface PipelineExecutionStatus {
  execution_id: string;
  pipeline_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  current_block?: string;
  completed_blocks: string[];
  failed_blocks: string[];
  started_at: string;
  completed_at?: string;
  logs: {
    block_id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
  }[];
}
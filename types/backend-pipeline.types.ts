/**
 * 백엔드로 전송할 Pipeline 데이터 타입 정의
 * DEPLOY 블록은 제외됨
 */

import { CICDBlockType, CICDBlockGroup } from "./cicd-node.types";

// 기본 블록 구조
export interface PipelineBlock {
  blockId: string;
  blockType: CICDBlockType;
  groupType: CICDBlockGroup;
  label: string;
  description?: string;
  onSuccess?: string | null;
  onFailed?: string | null;
  timeout?: number;
  retryCount?: number;
}

// PIPELINE START 블록
export interface PipelineStartBlock extends PipelineBlock {
  blockType: CICDBlockType.PIPELINE_START;
  groupType: CICDBlockGroup.START;
  triggerType?: "manual" | "schedule" | "webhook" | "push" | "pullRequest";
  triggerConfig?: {
    schedule?: string; // cron expression
    branchPatterns?: string[];
    filePatterns?: string[];
  };
}

// PREBUILD 블록들
export interface OSPackagePipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.OS_PACKAGE;
  groupType: CICDBlockGroup.PREBUILD;
  packageManager: "apt" | "yum" | "dnf" | "apk" | "zypper" | "pacman" | "brew";
  installPackages: string[];
  updatePackageList?: boolean;
}

export interface NodeVersionPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.NODE_VERSION;
  groupType: CICDBlockGroup.PREBUILD;
  version: string;
  packageManager?: "npm" | "yarn" | "pnpm";
}

export interface EnvironmentSetupPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.ENVIRONMENT_SETUP;
  groupType: CICDBlockGroup.PREBUILD;
  environmentVariables: Record<string, string>;
  loadFromFile?: string;
}

// BUILD 블록들
export interface InstallNodePackagePipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.INSTALL_MODULE_NODE;
  groupType: CICDBlockGroup.BUILD;
  packageManager: "npm" | "yarn" | "pnpm";
  installPackages?: string[];
  installDevDependencies?: boolean;
  productionOnly?: boolean;
  cleanInstall?: boolean;
}

export interface BuildWebpackPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.BUILD_WEBPACK;
  groupType: CICDBlockGroup.BUILD;
  configFile?: string;
  mode: "development" | "production";
  outputPath?: string;
  additionalOptions?: string[];
}

export interface BuildVitePipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.BUILD_VITE;
  groupType: CICDBlockGroup.BUILD;
  configFile?: string;
  mode: "development" | "production";
  basePath?: string;
  outputDir?: string;
}

export interface BuildCustomPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.BUILD_CUSTOM;
  groupType: CICDBlockGroup.BUILD;
  packageManager: "npm" | "yarn" | "pnpm";
  scriptName?: string;
  customCommands?: string[];
  workingDirectory?: string;
}

// TEST 블록들
export interface TestJestPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.TEST_JEST;
  groupType: CICDBlockGroup.TEST;
  configFile?: string;
  testPattern?: string;
  coverage?: boolean;
  watchMode?: boolean;
  maxWorkers?: number;
  additionalOptions?: string[];
}

export interface TestMochaPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.TEST_MOCHA;
  groupType: CICDBlockGroup.TEST;
  testFiles?: string[];
  configFile?: string;
  reporter?: "spec" | "json" | "html" | "tap" | "dot";
  timeout?: number;
  grep?: string;
}

export interface TestVitestPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.TEST_VITEST;
  groupType: CICDBlockGroup.TEST;
  configFile?: string;
  coverage?: boolean;
  ui?: boolean;
  watchMode?: boolean;
  environment?: "node" | "jsdom" | "happy-dom";
}

export interface TestPlaywrightPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.TEST_PLAYWRIGHT;
  groupType: CICDBlockGroup.TEST;
  configFile?: string;
  project?: string;
  headed?: boolean;
  debug?: boolean;
  browsers?: ("chromium" | "firefox" | "webkit")[];
}

export interface TestCustomPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.TEST_CUSTOM;
  groupType: CICDBlockGroup.TEST;
  packageManager: "npm" | "yarn" | "pnpm";
  scriptName?: string;
  customCommands?: string[];
  generateReports?: boolean;
  coverageThreshold?: number;
}

// DEPLOY 블록들은 현재 지원하지 않음

// NOTIFICATION 블록들
export interface NotificationSlackPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.NOTIFICATION_SLACK;
  groupType: CICDBlockGroup.NOTIFICATION;
  webhookUrlEnv: string;
  channel?: string;
  messageTemplate: string;
  onSuccessOnly?: boolean;
  onFailureOnly?: boolean;
}

export interface NotificationEmailPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.NOTIFICATION_EMAIL;
  groupType: CICDBlockGroup.NOTIFICATION;
  smtpConfig: {
    host: string;
    port: number;
    usernameEnv: string;
    passwordEnv: string;
  };
  recipients: string[];
  subjectTemplate: string;
  bodyTemplate: string;
}

// UTILITY 블록들
export interface ConditionBranchPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.CONDITION_BRANCH;
  groupType: CICDBlockGroup.UTILITY;
  conditionType: "environment" | "fileExists" | "commandOutput" | "custom";
  conditionConfig: {
    environmentVar?: string;
    expectedValue?: string;
    filePath?: string;
    command?: string;
    customScript?: string;
  };
  onConditionTrue: string;
  onConditionFalse: string;
}

export interface ParallelExecutionPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.PARALLEL_EXECUTION;
  groupType: CICDBlockGroup.UTILITY;
  parallelBranches: string[];
  waitForAll?: boolean;
  failFast?: boolean;
  onAllSuccess: string;
  onAnyFailure?: string;
}

export interface CustomCommandPipelineBlock extends PipelineBlock {
  blockType: CICDBlockType.CUSTOM_COMMAND;
  groupType: CICDBlockGroup.UTILITY;
  commands: string[];
  workingDirectory?: string;
  shell?: "bash" | "sh" | "zsh" | "fish";
  environmentVariables?: Record<string, string>;
  ignoreErrors?: boolean;
}

// 모든 파이프라인 블록 유니온 타입 (DEPLOY 제외)
export type AnyPipelineBlock =
  | PipelineStartBlock
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
  pipelineId: string;
  name: string;
  description?: string;
  createdAt: string;
  blocks: AnyPipelineBlock[];
}

// API 요청/응답 타입
export interface RunPipelineRequest {
  pipeline: PipelineData;
}

export interface RunPipelineResponse {
  success: boolean;
  pipelineId: string;
  executionId: string;
  message: string;
}

export interface PipelineExecutionStatus {
  executionId: string;
  pipelineId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentBlock?: string;
  completedBlocks: string[];
  failedBlocks: string[];
  startedAt: string;
  completedAt?: string;
  logs: {
    blockId: string;
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }[];
}

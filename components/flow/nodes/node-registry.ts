import { ComponentType } from "react";
import { NodeTypes, NodeProps } from "@xyflow/react";
import { NodeRegistry } from "@/types/node-config.types";
import {
  StartNodeData,
  AgentNodeData,
  ApiNodeData,
  ConditionNodeData,
  FunctionNodeData,
  KnowledgeNodeData,
  DeveloperNodeData,
} from "@/types/node.types";
import {
  BaseCICDNodeData,
  OSPackageNodeData,
  BuildWebpackNodeData,
  TestJestNodeData,
  NotificationSlackNodeData,
  ConditionBranchNodeData,
  CustomCommandNodeData,
  PipelineStartNodeData,
  CICD_GROUP_COLORS,
  CICD_BLOCK_CONFIGS,
} from "@/types/cicd-node.types";

// 노드 컴포넌트들 import
import StartNode from "./StartNode";
import PipelineStartNode from "./PipelineStartNode";
import AgentNode from "./AgentNode";
import ApiNode from "./ApiNode";
import ConditionNode from "./ConditionNode";
import FunctionNode from "./FunctionNode";
import KnowledgeNode from "./KnowledgeNode";
import DeveloperNode from "./DeveloperNode";

// CI/CD 노드 컴포넌트들 import
import {
  OSPackageNode,
  NodeVersionNode,
  EnvironmentSetupNode,
  BuildWebpackNode,
  ViteBuildNode,
  InstallPackagesNode,
  CustomBuildNode,
  TestJestNode,
  TestMochaNode,
  TestVitestNode,
  TestCustomNode,
  DeployVercelNode,
  NotificationSlackNode,
  NotificationEmailNode,
  ConditionBranchNode,
  CustomCommandNode,
  GenericCICDNode,
} from "./cicd";
import { CICDBlockGroup, CICDBlockType } from "@/types/cicd-node.types";

/**
 * 노드 설정 레지스트리
 * 새로운 노드를 추가하려면 이곳에 설정을 추가하면 됨
 */
export const nodeRegistry: NodeRegistry = {
  start: {
    type: "start",
    label: "Start",
    icon: "Play",
    colorClass: "bg-blue-500",
    colorHex: "#3b82f6",
    component: StartNode as ComponentType<NodeProps>,
    category: "trigger",
    description: "워크플로우 시작점",
    minWidth: 280,
    deletable: false,
    defaultData: {
      label: "Start",
      triggerType: "manual",
    } as Partial<StartNodeData>,
    inputs: { count: 0 },
    outputs: { count: 1, position: "bottom" },
  },

  // CI/CD Pipeline Start
  pipeline_start: {
    type: "pipeline_start",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.PIPELINE_START].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.PIPELINE_START].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.START].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.START].colorHex,
    component: PipelineStartNode as ComponentType<NodeProps>, // Pipeline Start 전용 컴포넌트
    category: "cicd-start",
    description: "파이프라인 시작",
    minWidth: 280,
    deletable: false,
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.PIPELINE_START].label,
      blockType: CICDBlockType.PIPELINE_START,
      groupType: CICDBlockGroup.START,
      triggerType: "manual",
      triggerConfig: {},
    } as Partial<PipelineStartNodeData>,
    inputs: { count: 0 },
    outputs: { count: 1, position: "bottom" },
  },

  agent: {
    type: "agent",
    label: "Agent",
    icon: "Bot",
    colorClass: "bg-purple-500",
    colorHex: "#a855f7",
    component: AgentNode as ComponentType<NodeProps>,
    category: "action",
    description: "AI 에이전트 처리",
    defaultData: {
      label: "Agent",
      model: "gpt-4",
    } as Partial<AgentNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  api: {
    type: "api",
    label: "API",
    icon: "Link",
    colorClass: "bg-blue-500",
    colorHex: "#3b82f6",
    component: ApiNode as ComponentType<NodeProps>,
    category: "action",
    description: "외부 API 호출",
    defaultData: {
      label: "API",
      method: "GET",
    } as Partial<ApiNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  condition: {
    type: "condition",
    label: "Condition",
    icon: "Diamond",
    colorClass: "bg-orange-500",
    colorHex: "#f97316",
    component: ConditionNode as ComponentType<NodeProps>,
    category: "control",
    description: "조건부 분기",
    minWidth: 320,
    defaultData: {
      label: "Condition",
      logicalOperator: "AND",
    } as Partial<ConditionNodeData>,
    inputs: { count: 1, position: "left" },
    outputs: {
      count: 2,
      position: "right",
      ids: ["if-output", "else-output"],
    },
  },
  function: {
    type: "function",
    label: "Function",
    icon: "Code",
    colorClass: "bg-red-500",
    colorHex: "#ef4444",
    component: FunctionNode as ComponentType<NodeProps>,
    category: "action",
    description: "커스텀 함수",
    defaultData: {
      label: "Function",
      language: "javascript",
    } as Partial<FunctionNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  knowledge: {
    type: "knowledge",
    label: "Knowledge",
    icon: "Brain",
    colorClass: "bg-teal-500",
    colorHex: "#14b8a6",
    component: KnowledgeNode as ComponentType<NodeProps>,
    category: "data",
    description: "지식 베이스 쿼리",
    defaultData: {
      label: "Knowledge",
      topK: 5,
    } as Partial<KnowledgeNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  developer: {
    type: "developer",
    label: "Developer",
    icon: "User",
    colorClass: "bg-green-500",
    colorHex: "#10b981",
    component: DeveloperNode as ComponentType<NodeProps>,
    category: "custom",
    description: "개발자 할당",
    defaultData: {
      label: "Developer",
      skills: ["TypeScript", "React"],
      experience: 3,
    } as Partial<DeveloperNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // ===== CI/CD 노드들 =====
  // PREBUILD 그룹
  // ss BlockType: 'os_package'
  os_package: {
    type: "os_package",
    label: "OS Packages",
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.OS_PACKAGE].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorHex,
    component: OSPackageNode as ComponentType<NodeProps>,
    category: "cicd-prebuild",
    description: "OS 패키지 설치",
    defaultData: {
      label: "OS Packages",
      blockType: CICDBlockType.OS_PACKAGE,
      groupType: CICDBlockGroup.PREBUILD,
      packageManager: "apt",
      installPackages: ["curl", "git"],
      updatePackageList: true,
    } as Partial<OSPackageNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // 아직 개별 UI가 없는 타입들은 GenericCICDNode로 매핑
  // PREBUILD
  node_version: {
    type: "node_version",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.NODE_VERSION].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.NODE_VERSION].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorHex,
    component: NodeVersionNode as ComponentType<NodeProps>,
    category: "cicd-prebuild",
    description: "Node.js 버전 설정",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.NODE_VERSION].label,
      blockType: CICDBlockType.NODE_VERSION,
      groupType: CICDBlockGroup.PREBUILD,
      version: "18",
      packageManager: "pnpm",
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  environment_setup: {
    type: "environment_setup",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.ENVIRONMENT_SETUP].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.ENVIRONMENT_SETUP].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorHex,
    component: EnvironmentSetupNode as ComponentType<NodeProps>,
    category: "cicd-prebuild",
    description: "환경 변수 설정",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.ENVIRONMENT_SETUP].label,
      blockType: CICDBlockType.ENVIRONMENT_SETUP,
      groupType: CICDBlockGroup.PREBUILD,
      environmentVariables: { },
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // BUILD 그룹
  // ss BlockType: 'build_webpack'
  build_webpack: {
    type: "build_webpack",
    label: "Webpack Build",
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_WEBPACK].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorHex,
    component: BuildWebpackNode as ComponentType<NodeProps>,
    category: "cicd-build",
    description: "Webpack 빌드",
    defaultData: {
      label: "Webpack Build",
      blockType: CICDBlockType.BUILD_WEBPACK,
      groupType: CICDBlockGroup.BUILD,
      mode: "production",
      configFile: "webpack.config.js",
    } as Partial<BuildWebpackNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  // ss BlockType: 'install_module_node'
  install_module_node: {
    type: "install_module_node",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.INSTALL_MODULE_NODE].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.INSTALL_MODULE_NODE].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorHex,
    component: InstallPackagesNode as ComponentType<NodeProps>,
    category: "cicd-build",
    description: "패키지 설치",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.INSTALL_MODULE_NODE].label,
      blockType: CICDBlockType.INSTALL_MODULE_NODE,
      groupType: CICDBlockGroup.BUILD,
      packageManager: "pnpm",
      cleanInstall: true,
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  build_vite: {
    type: "build_vite",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_VITE].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_VITE].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorHex,
    component: ViteBuildNode as ComponentType<NodeProps>,
    category: "cicd-build",
    description: "Vite 빌드",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_VITE].label,
      blockType: CICDBlockType.BUILD_VITE,
      groupType: CICDBlockGroup.BUILD,
      mode: "production",
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  build_custom: {
    type: "build_custom",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_CUSTOM].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_CUSTOM].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorHex,
    component: CustomBuildNode as ComponentType<NodeProps>,
    category: "cicd-build",
    description: "커스텀 빌드 실행",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.BUILD_CUSTOM].label,
      blockType: CICDBlockType.BUILD_CUSTOM,
      groupType: CICDBlockGroup.BUILD,
      packageManager: "pnpm",
      scriptName: "build",
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // TEST 그룹
  // ss BlockType: 'test_jest'
  test_jest: {
    type: "test_jest",
    label: "Jest Tests",
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_JEST].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorHex,
    component: TestJestNode as ComponentType<NodeProps>,
    category: "cicd-test",
    description: "Jest 테스트",
    defaultData: {
      label: "Jest Tests",
      blockType: CICDBlockType.TEST_JEST,
      groupType: CICDBlockGroup.TEST,
      coverage: true,
      watchMode: false,
    } as Partial<TestJestNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  test_mocha: {
    type: "test_mocha",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_MOCHA].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_MOCHA].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorHex,
    component: TestMochaNode as ComponentType<NodeProps>,
    category: "cicd-test",
    description: "Mocha 테스트",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_MOCHA].label,
      blockType: CICDBlockType.TEST_MOCHA,
      groupType: CICDBlockGroup.TEST,
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  test_vitest: {
    type: "test_vitest",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_VITEST].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_VITEST].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorHex,
    component: TestVitestNode as ComponentType<NodeProps>,
    category: "cicd-test",
    description: "Vitest 실행",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_VITEST].label,
      blockType: CICDBlockType.TEST_VITEST,
      groupType: CICDBlockGroup.TEST,
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  // test_playwright 제외 요청으로 비활성화
  test_custom: {
    type: "test_custom",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_CUSTOM].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_CUSTOM].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorHex,
    component: TestCustomNode as ComponentType<NodeProps>,
    category: "cicd-test",
    description: "커스텀 테스트",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.TEST_CUSTOM].label,
      blockType: CICDBlockType.TEST_CUSTOM,
      groupType: CICDBlockGroup.TEST,
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // DEPLOY 그룹
  // ss BlockType: 'deploy_vercel'
  /* deploy_vercel (요청으로 비활성화)
  deploy_vercel: {
    type: "deploy_vercel",
    label: "Vercel Deploy",
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_VERCEL].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorHex,
    component: DeployVercelNode as ComponentType<NodeProps>,
    category: "cicd-deploy",
    description: "Deploy to Vercel platform",
    defaultData: {
      label: "Vercel Deploy",
      blockType: CICDBlockType.DEPLOY_VERCEL,
      groupType: CICDBlockGroup.DEPLOY,
      buildCommand: "npm run build",
      outputDirectory: "dist",
    } as Partial<DeployVercelNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },*/
  // 나머지 배포 타입들 (Generic)
  /* deploy_docker (요청으로 비활성화)
  deploy_docker: {
    type: "deploy_docker",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_DOCKER].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_DOCKER].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorHex,
    component: GenericCICDNode as ComponentType<NodeProps>,
    category: "cicd-deploy",
    description: "Deploy with Docker",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_DOCKER].label,
      blockType: CICDBlockType.DEPLOY_DOCKER,
      groupType: CICDBlockGroup.DEPLOY,
      imageName: "app",
      imageTag: "latest",
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },*/
  /* deploy_aws (요청으로 비활성화)
  deploy_aws: {
    type: "deploy_aws",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_AWS].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_AWS].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorHex,
    component: GenericCICDNode as ComponentType<NodeProps>,
    category: "cicd-deploy",
    description: "Deploy to AWS",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_AWS].label,
      blockType: CICDBlockType.DEPLOY_AWS,
      groupType: CICDBlockGroup.DEPLOY,
      service: "lambda",
      region: "us-east-1",
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },*/
  /* deploy_custom (요청으로 비활성화)
  deploy_custom: {
    type: "deploy_custom",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_CUSTOM].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_CUSTOM].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY].colorHex,
    component: GenericCICDNode as ComponentType<NodeProps>,
    category: "cicd-deploy",
    description: "Custom deployment",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.DEPLOY_CUSTOM].label,
      blockType: CICDBlockType.DEPLOY_CUSTOM,
      groupType: CICDBlockGroup.DEPLOY,
      commands: ["echo deploy"],
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },*/

  // NOTIFICATION 그룹
  // ss BlockType: 'notification_slack'
  notification_slack: {
    type: "notification_slack",
    label: "Slack Notify",
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.NOTIFICATION_SLACK].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].colorHex,
    component: NotificationSlackNode as ComponentType<NodeProps>,
    category: "cicd-notification",
    description: "Slack 알림 전송",
    defaultData: {
      label: "Slack Notify",
      blockType: CICDBlockType.NOTIFICATION_SLACK,
      groupType: CICDBlockGroup.NOTIFICATION,
      webhookUrlEnv: "SLACK_WEBHOOK_URL",
      messageTemplate: "Pipeline {status}: {project} on {branch}",
      channel: "ci-cd",
    } as Partial<NotificationSlackNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  notification_email: {
    type: "notification_email",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.NOTIFICATION_EMAIL].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.NOTIFICATION_EMAIL].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].colorHex,
    component: NotificationEmailNode as ComponentType<NodeProps>,
    category: "cicd-notification",
    description: "이메일 알림 전송",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.NOTIFICATION_EMAIL].label,
      blockType: CICDBlockType.NOTIFICATION_EMAIL,
      groupType: CICDBlockGroup.NOTIFICATION,
      recipients: ["dev@company.com"],
    } as Partial<any>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },

  // UTILITY 그룹
  custom_command: {
    type: "custom_command",
    label: CICD_BLOCK_CONFIGS[CICDBlockType.CUSTOM_COMMAND].label,
    icon: CICD_BLOCK_CONFIGS[CICDBlockType.CUSTOM_COMMAND].icon,
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].colorClass,
    colorHex: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].colorHex,
    component: CustomCommandNode as ComponentType<NodeProps>,
    category: "cicd-utility",
    description: "커스텀 명령",
    defaultData: {
      label: CICD_BLOCK_CONFIGS[CICDBlockType.CUSTOM_COMMAND].label,
      blockType: CICDBlockType.CUSTOM_COMMAND,
      groupType: CICDBlockGroup.UTILITY,
      commands: [],
      shell: "bash",
      ignoreErrors: false,
    } as Partial<CustomCommandNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
};

/**
 * React Flow에서 사용할 nodeTypes 객체 생성
 */
export const nodeTypes: NodeTypes = Object.entries(nodeRegistry).reduce(
  (acc, [key, config]) => ({
    ...acc,
    [key]: config.component,
  }),
  {} as NodeTypes
);

/**
 * 드래그 앤 드롭 UI에서 사용할 노드 목록
 */
export const nodeCategories = {
  // 기존 워크플로우 카테고리
  trigger: Object.values(nodeRegistry).filter((n) => n.category === "trigger"),
  action: Object.values(nodeRegistry).filter((n) => n.category === "action"),
  control: Object.values(nodeRegistry).filter((n) => n.category === "control"),
  data: Object.values(nodeRegistry).filter((n) => n.category === "data"),
  custom: Object.values(nodeRegistry).filter((n) => n.category === "custom"),

  // CI/CD 카테고리 (그룹별 색상 구분)
  "cicd-start": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-start"
  ),
  "cicd-prebuild": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-prebuild"
  ),
  "cicd-build": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-build"
  ),
  "cicd-test": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-test"
  ),
  "cicd-deploy": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-deploy"
  ),
  "cicd-notification": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-notification"
  ),
  "cicd-utility": Object.values(nodeRegistry).filter(
    (n) => n.category === "cicd-utility"
  ),
};

/**
 * CI/CD 전용 카테고리 (색상 정보 포함)
 */
export const cicdCategories = {
  start: {
    name: "Start",
    icon: "🚀",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.START].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.START].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.START].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.START].textClass,
    nodes: nodeCategories["cicd-start"],
  },
  prebuild: {
    name: "Prebuild",
    icon: "📦",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD].textClass,
    nodes: nodeCategories["cicd-prebuild"],
  },
  build: {
    name: "Build",
    icon: "🔨",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.BUILD].textClass,
    nodes: nodeCategories["cicd-build"],
  },
  test: {
    name: "Test",
    icon: "🧪",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.TEST].textClass,
    nodes: nodeCategories["cicd-test"],
  },
  notification: {
    name: "Notification",
    icon: "📢",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION].textClass,
    nodes: nodeCategories["cicd-notification"],
  },
  utility: {
    name: "Utility",
    icon: "🔧",
    colorClass: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].colorClass,
    bgClass: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].bgClass,
    borderClass: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].borderClass,
    textClass: CICD_GROUP_COLORS[CICDBlockGroup.UTILITY].textClass,
    nodes: nodeCategories["cicd-utility"],
  },
};

/**
 * 새로운 노드 인스턴스 생성 헬퍼
 */
export const createNodeInstance = (
  type: string,
  position: { x: number; y: number },
  id?: string
) => {
  const config = nodeRegistry[type];
  if (!config) {
    throw new Error(`Unknown node type: ${type}`);
  }

  // camelCase 형태로 nodeData 생성 (snake_case 변환 제거)
  const nodeData: Partial<BaseCICDNodeData> = { 
    ...config.defaultData, 
    label: config.label 
  };

  // 항상 새로운 blockId 생성 (UUID 중복 방지)
  nodeData.blockId = crypto.randomUUID();

  return {
    id: id || crypto.randomUUID(),
    type,
    position,
    data: nodeData,
    selectable: true,
    deletable: config.deletable !== false,
  };
};

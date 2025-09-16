// CI/CD 블록 타입 (ss/components 기반)
export enum CICDBlockType {
    // ==== PREBUILD 단계 ====
    OS_PACKAGE = 'os_package',
    NODE_VERSION = 'node_version',
    ENVIRONMENT_SETUP = 'environment_setup',

    // ==== BUILD 단계 ====
    INSTALL_MODULE_NODE = 'install_module_node',
    BUILD_WEBPACK = 'build_webpack',
    BUILD_VITE = 'build_vite',
    BUILD_CUSTOM = 'build_custom',

    // ==== TEST 단계 ====
    TEST_JEST = 'test_jest',
    TEST_MOCHA = 'test_mocha',
    TEST_VITEST = 'test_vitest',
    TEST_PLAYWRIGHT = 'test_playwright',
    TEST_CUSTOM = 'test_custom',

    // ==== DEPLOY 단계 ====
    // DEPLOY_DOCKER = 'deploy_docker',
    // DEPLOY_VERCEL = 'deploy_vercel',
    // DEPLOY_AWS = 'deploy_aws',
    // DEPLOY_CUSTOM = 'deploy_custom',

    // ==== 유틸리티 블록 ====
    NOTIFICATION_SLACK = 'notification_slack',
    NOTIFICATION_EMAIL = 'notification_email',
    CONDITION_BRANCH = 'condition_branch',
    PARALLEL_EXECUTION = 'parallel_execution',
    CUSTOM_COMMAND = 'custom_command',
}

// CI/CD 블록 그룹 타입
export enum CICDBlockGroup {
    PREBUILD = 'prebuild',
    BUILD = 'build',
    TEST = 'test',
    DEPLOY = 'deploy',
    NOTIFICATION = 'notification',
    UTILITY = 'utility',
}
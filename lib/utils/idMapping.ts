/**
 * URL에서 사용되는 숫자 ID를 실제 Mock 데이터 ID로 변환하는 유틸리티 함수들
 */

/**
 * 프로젝트 숫자 ID를 Mock 데이터 ID로 변환
 * @param numericId 숫자 형태의 프로젝트 ID (예: "1", "2", "3")
 * @returns Mock 데이터 프로젝트 ID (예: "proj_1", "proj_2", "proj_3")
 */
export function mapProjectId(numericId: string): string {
  // 숫자인 경우 proj_ prefix 추가
  if (/^\d+$/.test(numericId)) {
    return `proj_${numericId}`;
  }

  // 이미 올바른 형태인 경우 그대로 반환
  return numericId;
}

/**
 * 파이프라인 숫자 ID를 Mock 데이터 ID로 변환
 * @param numericId 숫자 형태의 파이프라인 ID (예: "1", "2", "3")
 * @returns Mock 데이터 파이프라인 ID (예: "pipe_1", "pipe_2", "pipe_3")
 */
export function mapPipelineId(numericId: string): string {
  // 숫자인 경우 pipe_ prefix 추가
  if (/^\d+$/.test(numericId)) {
    return `pipe_${numericId}`;
  }

  // 이미 올바른 형태인 경우 그대로 반환
  return numericId;
}

/**
 * Mock 데이터 ID를 숫자 ID로 역변환
 * @param mockId Mock 데이터 ID (예: "proj_1", "pipe_1")
 * @returns 숫자 ID (예: "1", "1")
 */
export function reverseMapId(mockId: string): string {
  // proj_ 또는 pipe_ prefix 제거
  if (mockId.startsWith('proj_') || mockId.startsWith('pipe_')) {
    return mockId.split('_')[1];
  }

  // 이미 숫자인 경우 그대로 반환
  return mockId;
}
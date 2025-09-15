# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project uses pnpm as the package manager.

## Essential Commands

```bash
# Development
pnpm dev          # Start development server with Turbopack on http://localhost:3000

# Build & Production
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint on all .js,.jsx,.ts,.tsx files
pnpm lint:fix     # Auto-fix ESLint issues
```

## Architecture & Structure

### App Router Structure

- `/app` directory contains the Next.js App Router pages and layouts
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles with Tailwind CSS

### TypeScript Configuration

- **Base URL**: `src/` - All imports resolve from src directory
- **Path Aliases**:
  - `@/styles/*` → `styles/*`
  - `@/components/*` → `components/*`
- **Strict Mode**: Enabled with all TypeScript strict checks

### ESLint Configuration

- Uses ESLint 9 flat config format in `eslint.config.mjs`
- Extends Next.js core-web-vitals and TypeScript rules
- Custom rules for React 19 (no React import needed), TypeScript, and code quality
- Ignores: `.next/`, `node_modules/`, build files, and config files

### Styling

- Tailwind CSS v4 with PostCSS
- Configuration uses `@tailwindcss/postcss` plugin

## Development Guidelines

### Component Development

- Favor React Server Components (RSC) by default
- Use `'use client'` directive only when client-side interactivity is needed
- Follow functional and declarative programming patterns
- Implement proper error boundaries and use Suspense for async operations

### ⚠️ Critical: useEffect 무한 루프 방지

**useEffect를 사용할 때 반드시 주의해야 할 사항들:**

#### 1. 의존성 배열 주의사항
```typescript
// ❌ 위험: 객체/함수를 의존성 배열에 직접 포함
useEffect(() => {
  // API 호출
}, [supabase.auth, api, someObject]); // 매 렌더링마다 새 참조 → 무한 루프!

// ✅ 안전: 빈 배열 또는 primitive 값만 포함
useEffect(() => {
  // 컴포넌트 마운트 시 한 번만 실행
}, []); // 또는 [userId, isEnabled] 같은 primitive 값
```

#### 2. API 호출 시 에러 처리 필수
```typescript
// ✅ 올바른 패턴: 에러 상태 관리로 재시도 방지
const [hasError, setHasError] = useState(false);

useEffect(() => {
  if (hasError) return; // 에러 발생 시 재시도 방지

  fetchData()
    .catch(() => setHasError(true));
}, []);
```

#### 3. 실제 발생한 버그 사례
- **문제**: UserProfile 컴포넌트에서 2,471건의 API 요청 발생
- **원인**: `supabase.auth` 객체가 의존성 배열에 포함 + CORS 에러로 인한 실패 반복
- **해결**: 의존성 배열을 빈 배열로 변경, 에러 상태 관리 추가

#### 4. 체크리스트
- [ ] useEffect 의존성 배열에 객체/함수가 있는가?
- [ ] API 호출 실패 시 재시도 방지 로직이 있는가?
- [ ] 컴포넌트가 언마운트될 때 cleanup 함수가 필요한가?
- [ ] React DevTools로 리렌더링 횟수를 확인했는가?

### TypeScript Best Practices

- Prefer interfaces over types
- Use const maps instead of enums
- Variables/args starting with `_` are intentionally unused (ESLint configured)
- Implement proper type safety and inference

### Async Request APIs

For Next.js 15, always use async versions of runtime APIs:

```typescript
const cookieStore = await cookies();
const headersList = await headers();
const params = await props.params;
const searchParams = await props.searchParams;
```

### State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage enhanced `useFormStatus` with new properties (data, method, action)
- Consider URL state management with 'nuqs' for client state
- Minimize client-side state when possible

## Environment Variables

- `.env.dev` - Development environment variables
- `.env.example` - Template for environment variables

## Flow Editor 노드 시스템 (2025년 1월 기준)

### ⚠️ 중요: 이 섹션은 현재 노드 시스템 구조를 설명합니다
**구조가 변경되면 이 섹션을 반드시 업데이트하거나 삭제하세요.**

### 새로운 노드 추가 방법

현재 Flow Editor는 확장 가능한 컴포넌트 기반 노드 시스템을 사용합니다. 새로운 노드를 추가하려면:

#### 1. 노드 데이터 타입 정의 (`types/node.types.ts`)
```typescript
export interface YourNodeData extends BaseNodeData {
  // 노드별 커스텀 속성들
  customProperty?: string;
  settings?: Record<string, any>;
}
```

#### 2. 노드 컴포넌트 생성 (`components/flow/nodes/YourNode.tsx`)
```typescript
import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { YourNodeData } from "@/types/node.types";

const YourNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as YourNodeData;

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-blue-500"  // Tailwind 색상 클래스
      icon={<span>🎯</span>}     // 아이콘 (이모지 또는 컴포넌트)
      minWidth={280}             // 최소 너비 (선택사항)
      deletable={true}           // 삭제 가능 여부
    >
      {/* 노드 내부 컨텐츠 */}
      <div className="text-sm text-gray-600">
        {nodeData.customProperty || "Default Content"}
      </div>
    </BaseNode>
  );
});

YourNode.displayName = "YourNode";
export default YourNode;
```

#### 3. 노드 레지스트리에 등록 (`components/flow/nodes/node-registry.ts`)
```typescript
import YourNode from "./YourNode";
import { YourNodeData } from "@/types/node.types";

export const nodeRegistry: NodeRegistry = {
  // ... 기존 노드들 ...

  yourNode: {
    type: "yourNode",
    label: "Your Node",
    icon: "🎯",
    colorClass: "bg-blue-500",
    colorHex: "#3b82f6",
    component: YourNode,
    category: "action",  // trigger | action | control | data | custom
    description: "노드 설명",
    defaultData: {
      label: "Your Node",
      customProperty: "default value"
    } as Partial<YourNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" }
  }
};
```

#### 4. 타입 export 추가 (`components/flow/nodes/index.ts`)
```typescript
// nodeConfigs에 추가 (기존 호환성 유지)
export const nodeConfigs = {
  // ... 기존 노드들 ...
  yourNode: {
    type: "yourNode",
    icon: "🎯",
    color: "blue",
    label: "Your Node"
  }
};
```

### 현재 구현된 노드들

- **StartNode**: 워크플로우 시작점 (삭제 불가)
- **AgentNode**: AI 에이전트 처리
- **ApiNode**: 외부 API 호출
- **ConditionNode**: 조건 분기 (다중 출력)
- **FunctionNode**: 커스텀 함수 실행
- **KnowledgeNode**: 지식 베이스 쿼리
- **DeveloperNode**: 개발자 할당 (예시)

### 노드 시스템 주요 특징

- **BaseNode 컴포넌트**: 모든 노드의 공통 UI/로직 제공
- **타입 안정성**: 각 노드별 고유 타입 정의
- **확장성**: 새 노드 추가가 매우 간단 (3단계만 필요)
- **독립성**: 각 노드가 독립적인 파일로 관리됨

### 주의사항

- Start 노드는 `deletable: false`로 설정하여 삭제 방지
- Condition 노드처럼 다중 출력이 필요한 경우 `outputHandles` 배열 사용
- 노드 아이콘은 이모지 또는 lucide-react 컴포넌트 사용 가능
- 색상은 Tailwind CSS 클래스 사용 (bg-{color}-500 형식)

## 구현 방식

- 구현 방식에 있어서는 .cursorrules를 참조하세요.

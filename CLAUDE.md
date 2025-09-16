# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Otto UI is a Next.js 15 frontend application for a comprehensive CI/CD platform. It provides a modern dashboard for project management, build monitoring, log analysis, and pipeline visualization. Built with React 19, TypeScript, Tailwind CSS v4, and leverages advanced features like real-time SSE log streaming, interactive flow editors, and responsive design.

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

The application uses Next.js 15 App Router with route groups for logical organization:

- **Route Groups**:
  - `app/(landing)/` - Public landing page
  - `app/(auth)/` - Authentication flows (signup, auth-code-error)
  - `app/projects/` - Project management with nested routes
  - `app/logs/` - Log monitoring and analysis
  - `app/api/` - API routes for backend integration

- **Key Files**:
  - `app/layout.tsx` - Root layout with Geist fonts and providers
  - `app/globals.css` - Global styles with Tailwind CSS
  - `middleware.ts` - Authentication and route protection

- **Dynamic Routes**:
  - `app/projects/[projectId]/` - Project details
  - `app/projects/[projectId]/pipelines/[pipelineId]/` - Pipeline visualization
  - `app/projects/[projectId]/logs/` - Project-specific logs

### Component Architecture

- **components/ui/** - Reusable UI components (Radix UI + Tailwind)
- **components/auth/** - Authentication components and providers
- **components/layout/** - Layout and navigation components
- **components/projects/** - Project management (modals, wizards, forms)
- **components/logs/** - Log streaming and analysis components
- **components/settings/** - Application settings
- **components/landing/** - Landing page components

### TypeScript Configuration

- **Path Aliases**:
  - `@/components/*` → `components/*`
  - `@/styles/*` → `styles/*`
  - `@/lib/*` → `lib/*`
  - `@/hooks/*` → `hooks/*`
  - `@/types/*` → `types/*`
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

- **Global State**: Zustand stores for application-wide state
  - `lib/projectStore.ts` - Project management state
  - `lib/pipelineStore.ts` - Pipeline configuration state
- **Custom Hooks**: Specialized hooks for features
  - `hooks/useToast.tsx` - Toast notifications
  - `hooks/logs/useLogData.ts` - Log data management
  - `hooks/logs/useSSELogStream.ts` - Real-time log streaming
  - `hooks/logs/useFilters.ts` - Log filtering
  - `hooks/logs/useLogSearch.ts` - Log search functionality
- **React 19 Features**:
  - Use `useActionState` instead of deprecated `useFormState`
  - Leverage enhanced `useFormStatus` with new properties
- **Minimalist Approach**: Prefer server components and minimize client-side state

## Environment Variables

Configuration files for different environments:

- `.env.development` - Development environment variables
- `.env.example` - Template for environment variables

### Required Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Supabase Configuration (optional, for direct frontend access)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

## Key Libraries & Dependencies

- **Core Framework**: Next.js 15.5.3, React 19.1.0, TypeScript 5.x
- **State Management**: Zustand 5.0.8 for lightweight global state
- **UI Components**:
  - Radix UI (dialogs, toasts) for accessible primitives
  - Lucide React 0.544.0 for modern icons
- **Flow Editor**: @xyflow/react 12.8.4 for interactive pipeline visualization
- **Styling**:
  - Tailwind CSS v4 with PostCSS
  - clsx and tailwind-merge for conditional styling
- **Authentication**: Supabase SSR 0.7.0 for server-side rendering support
- **Development**: ESLint 9.35.0, TypeScript ESLint 8.43.0

## Pipeline Flow Editor System

The application includes a comprehensive pipeline visualization system built with ReactFlow for creating and managing CI/CD workflows.

### Architecture Overview

- **Flow Types**: Defined in `types/flow.types.ts` with generic type support
- **Base Components**: `components/flow/nodes/BaseNode.tsx` provides common functionality
- **Node Categories**: Organized by purpose (core, CI/CD, testing, notifications)

### Current Node Implementation

#### Core Nodes
- **StartNode**: Workflow entry point
- **PipelineStartNode**: Pipeline-specific start node
- **FunctionNode**: Custom function execution

#### CI/CD Nodes (`components/flow/nodes/cicd/`)
- **Build Nodes**: BuildWebpackNode, ViteBuildNode, CustomBuildNode
- **Package Management**: InstallPackagesNode, OSPackageNode
- **Testing**: TestJestNode, TestMochaNode, TestVitestNode
- **Notifications**: NotificationEmailNode, NotificationSlackNode
- **Flow Control**: ConditionBranchNode

### Adding New Nodes

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

### Node Development Guidelines

1. **Extend BaseNode**: All nodes should extend the BaseNode component for consistency
2. **Type Safety**: Use TypeScript interfaces for node data structures
3. **Categorization**: Place nodes in appropriate subdirectories (cicd/, testing/, etc.)
4. **Naming Convention**: Use descriptive names ending with "Node" (e.g., TestJestNode)
5. **Icon Integration**: Use Lucide React icons for visual consistency

### Key Features

- **Extensible Architecture**: Easy to add new node types with minimal code
- **Type Safety**: Full TypeScript support with generic interfaces
- **Visual Consistency**: BaseNode component ensures uniform styling
- **Category Organization**: Logical grouping of nodes by functionality
- **Icon System**: Consistent iconography using Lucide React

## Real-time Features

### Server-Sent Events (SSE)
- **Live Log Streaming**: Real-time log updates via SSE
- **Custom Hooks**: `hooks/logs/useSSELogStream.ts` for SSE management
- **Error Handling**: Robust reconnection and error recovery

### Toast Notifications
- **Global System**: `hooks/useToast.tsx` for app-wide notifications
- **Radix Integration**: Accessible toast components via Radix UI

## Integration Points

### Backend API Integration
- **API Client**: `lib/api.ts` for backend communication
- **Supabase Integration**: `lib/supabase/` for authentication and database
- **Middleware**: Route protection and authentication handling

### Project Management
- **Store Management**: Zustand-based project state management
- **Modal System**: CreateProjectModal and ProjectCreationWizard
- **GitHub Integration**: Repository connection and management

## Implementation Guidelines

For detailed implementation patterns and coding standards, refer to `.cursorrules` in the project root.

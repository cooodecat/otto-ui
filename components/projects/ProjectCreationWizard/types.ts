export interface Repository {
  id?: string;
  name: string;
  owner: string;
  description: string;
  defaultBranch: string;
  languages: Record<string, number>;
  updatedAt: string;
  stars: number;
  forks: number;
  visibility: 'Public' | 'Private';
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    message: string;
    date: string;
    author: string;
  };
}

export interface ProjectConfig {
  name: string;
  description: string;
}

export interface WizardState {
  currentStep: 1 | 2 | 3;
  repositories: Repository[];
  repository: Repository | null;
  selectedBranch: string;
  branches: Branch[];
  projectConfig: ProjectConfig;
  validation: {
    isNameValid: boolean;
    nameError: string | null;
    isChecking: boolean;
  };
  isLoading: boolean;
  isCreating: boolean;
  createdProjectId: string | null;
  createdProjectNumericId: number | null;
}

export interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: {
    projectId: string;
    name: string;
    targetUrl?: string;
  }) => void;
  repository?: {
    name: string;
    owner: string;
    visibility: 'Public' | 'Private';
    updated: string;
  };
}
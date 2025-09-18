import { Project } from '@/types/api';

/**
 * Maps snake_case Project properties to camelCase
 */
export function mapProjectToCamelCase(project: Project): Project {
  return {
    ...project,
    // Add camelCase mappings
    projectId: project.project_id,
    githubOwner: project.github_owner,
    githubRepoId: project.github_repo_id,
    githubRepoName: project.github_repo_name,
    githubRepoUrl: project.github_repo_url,
    selectedBranch: project.selected_branch,
    installationId: project.installation_id,
    userId: project.user_id,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    codebuildStatus: project.codebuild_status,
    codebuildProjectName: project.codebuild_project_name,
    codebuildProjectArn: project.codebuild_project_arn,
    cloudwatchLogGroup: project.cloudwatch_log_group,
    codebuildErrorMessage: project.codebuild_error_message,
  };
}

/**
 * Maps an array of Projects to include camelCase properties
 */
export function mapProjectsToCamelCase(projects: Project[]): Project[] {
  return projects.map(mapProjectToCamelCase);
}
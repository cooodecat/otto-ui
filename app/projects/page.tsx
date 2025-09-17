import { Suspense } from "react";
import ProjectsPageClient from "./ProjectsPageClient";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsPageLoading />}>
      <ProjectsPageClient />
    </Suspense>
  );
}

function ProjectsPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
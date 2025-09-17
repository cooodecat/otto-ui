import React from "react";
import { FileX, Rocket, GitBranch, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyLogsStateProps {
  projectId?: string;
  projectName?: string;
}

const EmptyLogsState: React.FC<EmptyLogsStateProps> = ({
  projectId,
  projectName,
}) => {
  const router = useRouter();

  const getEmptyMessage = () => {
    if (projectId && projectName) {
      return {
        title: `${projectName} 프로젝트에 빌드 기록이 없습니다`,
        description:
          "이 프로젝트의 파이프라인에서 아직 빌드가 실행되지 않았습니다.",
        icon: <FileX className="w-12 h-12 text-gray-400" />,
      };
    }
    return {
      title: "빌드 기록이 없습니다",
      description:
        "아직 실행된 빌드가 없습니다. 파이프라인을 실행하여 첫 빌드를 시작해보세요.",
      icon: <Clock className="w-12 h-12 text-gray-400" />,
    };
  };

  const { title, description, icon } = getEmptyMessage();

  const handleRunPipeline = () => {
    if (projectId) {
      router.push(`/projects/${projectId}/pipelines`);
    } else {
      router.push("/pipelines");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>

        <div className="mt-6">
          <button
            onClick={handleRunPipeline}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Rocket className="w-4 h-4 mr-2" />
            파이프라인 실행하기
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 도움말</h4>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• 파이프라인을 실행하면 CodeBuild가 자동으로 시작됩니다</li>
            <li>• 빌드 진행 상황은 실시간으로 확인할 수 있습니다</li>
            <li>• 빌드 로그는 CloudWatch Logs에 저장됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyLogsState;

"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { NotificationEmailNodeData, CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { Mail } from "lucide-react";

const NotificationEmailNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as NotificationEmailNodeData;
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION];

  const [recipientsText, setRecipientsText] = useState(
    (nodeData.recipients || ["dev@company.com"]).join(", ")
  );
  const [subject, setSubject] = useState(nodeData.subjectTemplate || "Build Status: {status}");
  const [body, setBody] = useState(nodeData.bodyTemplate || "Project {project} on {branch} finished with {status}.");

  return (
    <BaseNode
      data={{ ...nodeData, recipients: recipientsText.split(/[,\n]/).map((s)=>s.trim()).filter(Boolean), subjectTemplate: subject, bodyTemplate: body }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Mail className="w-4 h-4 text-white" />}
      minWidth={360}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-gray-600 mb-1">Recipients (comma or newline separated)</div>
          <textarea
            className="w-full px-2 py-1 border border-gray-300 rounded h-16"
            value={recipientsText}
            onChange={(e)=>setRecipientsText(e.target.value)}
            placeholder="dev@company.com, team@company.com"
          />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Subject</div>
          <input className="px-2 py-1 border border-gray-300 rounded" value={subject} onChange={(e)=>setSubject(e.target.value)} />
        </div>
        <div>
          <div className="text-gray-600 mb-1">Body</div>
          <textarea className="w-full px-2 py-1 border border-gray-300 rounded h-24" value={body} onChange={(e)=>setBody(e.target.value)} />
          <div className="text-xs text-gray-500 mt-1">Variables: {"{status}, {project}, {branch}, {commit}, {duration}"}</div>
        </div>
      </div>
    </BaseNode>
  );
});

NotificationEmailNode.displayName = "NotificationEmailNode";

export default NotificationEmailNode;



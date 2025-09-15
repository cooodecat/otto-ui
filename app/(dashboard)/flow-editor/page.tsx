import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FlowEditor from "@/components/flow/FlowEditor";

export default async function FlowEditorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <FlowEditor />;
}

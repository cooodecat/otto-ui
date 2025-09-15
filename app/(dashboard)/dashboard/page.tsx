import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BasicFlowCanvas from "@/components/flow/BasicFlowCanvas";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <BasicFlowCanvas />;
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProjectsManager from "@/components/projects/ProjectsManager";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <ProjectsManager />;
}
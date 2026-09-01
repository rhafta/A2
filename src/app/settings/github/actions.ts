"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addGithubUsername(formData: FormData) {
  const username = (formData.get("username") as string | null)?.trim();
  if (!username) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("github_usernames")
    .insert({ user_id: user.id, username });

  // unique violation(이미 등록된 사용자명)은 조용히 무시
  if (error && error.code !== "23505") {
    throw new Error("사용자명을 추가하지 못했습니다.");
  }

  revalidatePath("/settings/github");
}

export async function removeGithubUsername(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("github_usernames")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/settings/github");
}

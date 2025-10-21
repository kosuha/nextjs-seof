"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSupabaseRouteHandlerClient,
  getServerSession,
} from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseRouteHandlerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function authBypassIfLoggedIn(path: string = "/") {
  const session = await getServerSession();
  if (session) {
    redirect(path);
  }
}

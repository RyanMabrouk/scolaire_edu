"use server";

import { createClient } from "@/lib/supabase/server";

export default async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return { data };
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function deleteUser(userId: string) {
  const supabaseAdmin = createAdminClient();

  // Delete user using admin API
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { success: true }, error: null };
}

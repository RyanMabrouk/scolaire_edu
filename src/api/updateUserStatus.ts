"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function updateUserStatus(
  userId: string,
  disabled: boolean,
) {
  const supabaseAdmin = createAdminClient();

  // Update user using admin API to set disabled status
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: { disabled },
    },
  );

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { success: true, user: data.user }, error: null };
}

"use server";

import { createClient } from "@/lib/supabase/server";

export default async function getSession() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return {
    session: user
      ? {
          user,
        }
      : null,
    error,
  };
}

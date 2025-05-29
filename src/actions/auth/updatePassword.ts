"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function updatePassword({
  newPassword,
}: {
  newPassword: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    return {
      error: {
        message: error.message,
        type: "Server Error",
      },
    };
  } else {
    redirect("/home");
  }
}

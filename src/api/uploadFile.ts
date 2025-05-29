"use server";
import { createClient } from "@/lib/supabase/server";

export async function uploadFile({
  formData,
  name,
  title,
}: {
  formData: FormData;
  name: string;
  title: string;
}) {
  const file = formData.get(name) as File;

  if (!file || file.size === 0 || file.name === "undefined") {
    throw new Error("No file selected or invalid file.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("public-bucket")
    .upload(title, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(`Failed to upload the file: ${error.message}`);
  }

  return (process.env.SUPABASE_STORAGE_LINK as string) + "/" + data?.fullPath;
}

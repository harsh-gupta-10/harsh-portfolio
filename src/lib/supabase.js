import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to a Supabase bucket
 * @param {File} file - The file object to upload
 * @param {string} bucket - Bucket name (default: "portfolio-images")
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadMedia(file, bucket = "portfolio-images") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

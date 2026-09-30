function requiredPublic(value: string | undefined) {
  return value?.trim() || "";
}

/** Auth lives at /auth/v1 — never include /rest/v1 in the project URL. */
function normalizeSupabaseUrl(value: string) {
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/(rest|auth)\/v1$/i, "");
}

export const publicEnv = {
  siteUrl: requiredPublic(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
  supabaseUrl: normalizeSupabaseUrl(requiredPublic(process.env.NEXT_PUBLIC_SUPABASE_URL)),
  supabaseAnonKey: requiredPublic(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};

export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageProvider: process.env.STORAGE_PROVIDER ?? "cloudinary",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3Region: process.env.S3_REGION ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
};

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function isServiceRoleConfigured() {
  return Boolean(serverEnv.supabaseServiceRoleKey);
}

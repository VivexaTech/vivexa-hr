import { serverEnv } from "@/lib/env";

export type StoredFile = {
  url: string;
  provider: "cloudinary" | "s3" | "supabase";
  key?: string;
};

export async function getUploadSignature(folder: string) {
  if (serverEnv.storageProvider === "s3") {
    return {
      provider: "s3" as const,
      ready: Boolean(serverEnv.s3Bucket && serverEnv.s3AccessKeyId),
      folder,
    };
  }

  return {
    provider: "cloudinary" as const,
    ready: Boolean(serverEnv.cloudinaryCloudName && serverEnv.cloudinaryApiKey),
    cloudName: serverEnv.cloudinaryCloudName,
    folder,
  };
}

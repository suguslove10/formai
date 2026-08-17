/**
 * Stubbed S3-compatible file storage interface.
 * Matches AWS S3 SDK / Cloudflare R2 / MinIO API shape for future wiring.
 */

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface FileStorageProvider {
  uploadFile(file: File | Blob, path: string): Promise<UploadResult>;
  getPresignedUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; key: string }>;
  deleteFile(key: string): Promise<boolean>;
}

export class StubFileStorageProvider implements FileStorageProvider {
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME || "formai-uploads";
    this.region = process.env.S3_REGION || "us-east-1";
  }

  async uploadFile(file: File | Blob, path: string): Promise<UploadResult> {
    const key = `uploads/${Date.now()}-${path}`;
    // Stub implementation returns a mock public URL
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      key,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    };
  }

  async getPresignedUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `uploads/${Date.now()}-${filename}`;
    return {
      uploadUrl: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?stubbed-signature=true`,
      key,
    };
  }

  async deleteFile(_key: string): Promise<boolean> {
    return true;
  }
}

export const storage = new StubFileStorageProvider();

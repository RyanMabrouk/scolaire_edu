import React, { useState, useRef } from "react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import crypto from "crypto";

// Type definitions
interface InitUploadRequest {
  totalChunks: number;
  fileSize: number;
  title: string;
  description: string;
  tags?: string[];
}

interface InitUploadResponse {
  uploadJobId: string;
}

interface UploadStateResponse {
  uploadJobId: string;
  totalChunks?: {
    [key: string]: string;
  };
}

interface SessionResponse {
  urlToEdge: string;
}

interface UploadProgressCallback {
  (progress: {
    chunkNumber: number;
    totalChunks: number;
    percentage: number;
    uploadJobId: string;
  }): void;
}

interface BMDRMUploadOptions {
  apiKey: string;
  file: File | Buffer;
  title: string;
  description: string;
  tags?: string[];
  chunkSize?: number; // Default 10MB
  onProgress?: UploadProgressCallback;
}

class BMDRMUploader {
  private readonly baseUrl = "https://uploads.bmdrm.com/api/public/fileupload";
  private readonly sessionUrl = "https://edge-lb.video-crypt.com/api/Sessions";

  /**
   * Calculate MD5 hash of a chunk
   */
  private calculateHash(chunk: Buffer): string {
    return crypto.createHash("md5").update(chunk).digest("hex");
  }

  /**
   * Split file into chunks
   */
  private async splitFileIntoChunks(
    file: File | Buffer,
    chunkSize: number,
  ): Promise<Buffer[]> {
    const chunks: Buffer[] = [];
    let buffer: Buffer;

    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      buffer = file;
    }

    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Initialize upload session
   */
  private async initializeUpload(
    apiKey: string,
    totalChunks: number,
    fileSize: number,
    title: string,
    description: string,
    tags?: string[],
  ): Promise<string> {
    const requestData: InitUploadRequest = {
      totalChunks,
      fileSize,
      title,
      description,
      tags,
    };

    try {
      const response: AxiosResponse<InitUploadResponse> = await axios.post(
        `${this.baseUrl}/Init`,
        requestData,
        {
          headers: {
            accept: "text/plain",
            "API-KEY": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.uploadJobId;
    } catch (error) {
      console.log(
        "🚀 ~ BMDRMUploader ~ error:",
        isAxiosError(error) ? error.response?.data : error,
      );
      throw new Error(`Failed to initialize upload: ${error}`);
    }
  }

  /**
   * Upload a single chunk
   */
  private async uploadChunk(
    apiKey: string,
    uploadJobId: string,
    chunkNumber: number,
    chunk: Buffer,
    hash: string,
  ): Promise<void> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(chunk)]);
    formData.append("chunkFile", blob);

    try {
      await axios.post(`${this.baseUrl}/Upload`, formData, {
        params: {
          chunkNumber,
          hash,
          uploadJobId,
        },
        headers: {
          accept: "*/*",
          "API-KEY": apiKey,
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      throw new Error(`Failed to upload chunk ${chunkNumber}: ${error}`);
    }
  }

  /**
   * Check upload state/progress
   */
  private async checkUploadState(
    apiKey: string,
    uploadJobId: string,
  ): Promise<UploadStateResponse> {
    try {
      const response: AxiosResponse<UploadStateResponse> = await axios.get(
        `${this.baseUrl}/State`,
        {
          params: { uploadJobId },
          headers: {
            accept: "text/plain",
            "API-KEY": apiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to check upload state: ${error}`);
    }
  }

  /**
   * Finalize upload (clear endpoint)
   */
  private async finalizeUpload(
    apiKey: string,
    uploadJobId: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/Clear`,
        {},
        {
          params: { uploadJobId },
          headers: {
            accept: "*/*",
            "API-KEY": apiKey,
          },
        },
      );
    } catch (error) {
      throw new Error(`Failed to finalize upload: ${error}`);
    }
  }

  /**
   * Retrieve video session for playback
   */
  async getVideoSession(
    apiKey: string,
    videoId: string,
    userId: string,
  ): Promise<string> {
    try {
      const response: AxiosResponse<SessionResponse> = await axios.get(
        this.sessionUrl,
        {
          params: { videoId, userId },
          headers: {
            accept: "text/plain",
            apiKey: apiKey,
          },
        },
      );

      return response.data.urlToEdge;
    } catch (error) {
      throw new Error(`Failed to retrieve video session: ${error}`);
    }
  }

  /**
   * Main upload function
   */
  async uploadFile(options: BMDRMUploadOptions): Promise<{
    uploadJobId: string;
    success: boolean;
    message: string;
  }> {
    const {
      apiKey,
      file,
      title,
      description,
      tags,
      chunkSize = 10 * 1024 * 1024, // 10MB default
      onProgress,
    } = options;

    try {
      // Get file size
      const fileSize = file instanceof File ? file.size : file.length;

      // Multi-chunk upload for larger files
      const chunks = await this.splitFileIntoChunks(file, chunkSize);
      const totalChunks = chunks.length;

      // Initialize upload
      const uploadJobId = await this.initializeUpload(
        apiKey,
        totalChunks,
        fileSize,
        title,
        description,
        tags,
      );

      // Upload chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunkNumber = i + 1;
        const chunk = chunks[i];
        const hash = this.calculateHash(chunk);

        await this.uploadChunk(apiKey, uploadJobId, chunkNumber, chunk, hash);

        // Report progress
        if (onProgress) {
          onProgress({
            chunkNumber,
            totalChunks,
            percentage: Math.round((chunkNumber / totalChunks) * 100),
            uploadJobId,
          });
        }

        // Optional: Check state after each chunk
        await this.checkUploadState(apiKey, uploadJobId);
      }

      // Finalize upload
      await this.finalizeUpload(apiKey, uploadJobId);

      return {
        uploadJobId,
        success: true,
        message: "File uploaded successfully",
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error}`);
    }
  }
}

// Usage example
export async function uploadToBMDRM(options: BMDRMUploadOptions) {
  const uploader = new BMDRMUploader();
  return await uploader.uploadFile(options);
}

// Example usage:
/*
const file = document.getElementById('fileInput').files[0]; // or Buffer for Node.js
const result = await uploadToBMDRM({
  apiKey: '123e4567-e89b-12d3-a456-426614174000',
  file: file,
  title: 'My Video',
  description: 'Video description',
  tags: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}% (${progress.chunkNumber}/${progress.totalChunks})`);
  }
});

console.log('Upload result:', result);
*/

export { BMDRMUploader };
export type { BMDRMUploadOptions, UploadProgressCallback };

// React component for video upload

interface VideoUploadProps {
  onUploadComplete: (videoId: string) => void;
  onUploadError: (error: string) => void;
  title: string;
  description?: string;
  tags?: string[];
}

interface UploadProgress {
  chunkNumber: number;
  totalChunks: number;
  percentage: number;
  uploadJobId: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadComplete,
  onUploadError,
  title,
  description = "",
  tags = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // You'll need to get this from your environment or configuration
  const BMDRM_API_KEY = process.env.NEXT_PUBLIC_BMDRM_API_KEY || "";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        onUploadError("Please select a valid video file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError("Please select a file first");
      return;
    }

    if (!BMDRM_API_KEY) {
      onUploadError("BMDRM API key not configured");
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      const uploader = new BMDRMUploader();

      const result = await uploader.uploadFile({
        apiKey: BMDRM_API_KEY,
        file: selectedFile,
        title,
        description,
        tags,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (result.success) {
        onUploadComplete(result.uploadJobId);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        onUploadError(result.message || "Upload failed");
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="rounded-md bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Uploading chunk {uploadProgress.chunkNumber} of{" "}
              {uploadProgress.totalChunks}
            </span>
            <span className="font-medium text-blue-600">
              {uploadProgress.percentage}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Upload ID: {uploadProgress.uploadJobId}
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload Video"}
      </button>

      {/* Upload Status */}
      {isUploading && (
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Uploading video...
              </p>
              <p className="text-sm text-blue-600">
                Please don't close this page while the upload is in progress.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;

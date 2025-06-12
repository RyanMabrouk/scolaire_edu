import React, { useState, useRef } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

// Type definitions
interface InitUploadRequest {
  totalChunks: number;
  fileSize: number;
  title: string;
  description: string;
}

interface InitUploadResponse {
  uploadJobId: string;
}

interface UploadProgressCallback {
  (progress: {
    chunkNumber: number;
    totalChunks: number;
    percentage: number;
    uploadJobId: string;
    totalBytesUploaded: number;
  }): void;
}

interface BMDRMUploadOptions {
  apiKey: string;
  file: File;
  title: string;
  description: string;
  onProgress?: UploadProgressCallback;
}

interface BMDRMUploadResult {
  url: string;
  duration?: number;
  uploadJobId: string;
  success: boolean;
  message: string;
}

class BMDRMUploader {
  private readonly bmdrmUploadUrl = "https://uploads.bmdrm.com/api";
  private readonly bmdrmGetVideoUrl = "https://cdn-lb.video-crypt.com/api";
  private readonly CHUNK_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB to match server

  /**
   * Calculate MD5 hash using CryptoJS (matching server implementation)
   */
  private computeMD5(chunk: Buffer): string {
    const wordArray = CryptoJS.lib.WordArray.create(chunk);
    return CryptoJS.MD5(wordArray).toString();
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize upload session (matching server implementation)
   */
  private async initializeUpload(
    apiKey: string,
    payload: {
      totalChunks: number;
      fileSize: number;
      title: string;
      description: string;
    },
  ): Promise<{ uploadJobId?: string }> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "API-KEY": apiKey,
      };

      const initUploadUrl = `${this.bmdrmUploadUrl}/public/fileupload/Init`;

      const response = await fetch(initUploadUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status: ${response.status}, response: ${errorText}`,
        );
      }

      if (response.headers.get("Content-Length") === "0") {
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to initialize BMDRM upload:", error);
      throw new Error(`Failed to initialize BMDRM upload: ${error}`);
    }
  }

  /**
   * Upload a single chunk with retry logic (matching server implementation)
   */
  private async uploadChunk(
    uploadJobId: string,
    chunkNumber: number,
    chunk: Buffer,
    apiKey: string,
  ): Promise<boolean> {
    const hash = this.computeMD5(chunk);
    const uploadChunkUrl = `${this.bmdrmUploadUrl}/public/fileupload/Upload?chunkNumber=${chunkNumber}&uploadJobId=${uploadJobId}&hash=${hash}`;

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(chunk)]);
    formData.append("chunkFile", blob, `chunk_${chunkNumber}.part`);

    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(uploadChunkUrl, {
          method: "POST",
          headers: {
            "API-KEY": apiKey,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
      } catch (error) {
        if ((error as Error).message.includes("408") && attempt < maxRetries) {
          const retryDelay = 1000 * Math.pow(2, attempt - 1);
          await this.delay(retryDelay);
        } else {
          console.error("Error during chunk upload:", error);
          if (attempt === maxRetries) {
            throw error;
          }
        }
      }
    }

    throw new Error("Max retries exceeded for chunk upload");
  }

  /**
   * Get video session from BMDRM for playback
   */
  async getVideoSession(
    videoId: string,
    userId: string,
    apiKey: string,
  ): Promise<string> {
    try {
      const response = await fetch(
        `${this.bmdrmGetVideoUrl}/Sessions?videoId=${videoId}`,
        {
          method: "GET",
          headers: {
            apiKey: apiKey,
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.urlToEdge || data.url || data;
    } catch (error) {
      console.error("Error during getting BMDRM video session:", error);
      throw new Error(`Error during getting BMDRM video session: ${error}`);
    }
  }

  /**
   * Process file in chunks similar to server stream processing
   */
  private async processFileInChunks(
    file: File,
    chunkSize: number,
    onChunkProcessed: (chunk: Buffer, chunkNumber: number) => Promise<void>,
  ): Promise<Buffer[]> {
    const chunks: Buffer[] = [];
    let chunkNumber = 1;
    let offset = 0;

    // Store all chunks for duration calculation (like server implementation)
    const allChunks: Buffer[] = [];

    while (offset < file.size) {
      const chunkEnd = Math.min(offset + chunkSize, file.size);
      const fileSlice = file.slice(offset, chunkEnd);
      const arrayBuffer = await fileSlice.arrayBuffer();
      const chunkBuffer = Buffer.from(arrayBuffer);

      allChunks.push(chunkBuffer);
      await onChunkProcessed(chunkBuffer, chunkNumber);

      offset = chunkEnd;
      chunkNumber++;
    }

    return allChunks;
  }

  /**
   * Main upload function matching server implementation pattern
   */
  async uploadFile(options: BMDRMUploadOptions): Promise<BMDRMUploadResult> {
    const { apiKey, file, title, description, onProgress } = options;

    try {
      const fileSize = file.size;
      const totalChunks = Math.ceil(fileSize / this.CHUNK_SIZE_IN_BYTES);

      // Initialize upload
      const response = await this.initializeUpload(apiKey, {
        totalChunks,
        fileSize,
        title,
        description,
      });

      if (!response.uploadJobId) {
        throw new Error("Failed to initialize BMDRM upload");
      }

      let totalBytesUploaded = 0;
      const accumulatedChunksForDuration: Buffer[] = [];

      // Process file in chunks (similar to server stream processing)
      await this.processFileInChunks(
        file,
        this.CHUNK_SIZE_IN_BYTES,
        async (chunkBuffer: Buffer, chunkNumber: number) => {
          // Upload chunk
          await this.uploadChunk(
            response.uploadJobId!,
            chunkNumber,
            chunkBuffer,
            apiKey,
          );

          // Track progress
          totalBytesUploaded += chunkBuffer.length;
          const progress = Math.round((totalBytesUploaded / fileSize) * 100);

          // Store chunk for duration calculation
          accumulatedChunksForDuration.push(chunkBuffer);

          // Report progress
          if (onProgress) {
            onProgress({
              chunkNumber,
              totalChunks,
              percentage: progress,
              uploadJobId: response.uploadJobId!,
              totalBytesUploaded,
            });
          }
        },
      );

      // Don't get video link immediately - BMDRM needs processing time
      // The video URL will be retrieved later when needed for playback

      return {
        url: "", // Empty URL since video is still processing
        uploadJobId: response.uploadJobId!,
        success: true,
        message: "File uploaded successfully - video is processing",
      };
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error(`Upload failed: ${error}`);
    }
  }

  /**
   * Get video information from BMDRM
   */
  async getVideoInfos(apiKey: string, videoId: string) {
    try {
      const response = await axios.get(
        `https://app.bmdrm.com/api/PublicVideos/${videoId}`,
        {
          headers: {
            "API-KEY": apiKey,
          },
        },
      );

      return response?.data;
    } catch (error) {
      console.error("Error during getting BMDRM video infos:", error);
      throw new Error(`Error during getting BMDRM video infos: ${error}`);
    }
  }

  /**
   * Delete video from BMDRM
   */
  async deleteVideo(apiKey: string, videoId: string) {
    try {
      const response = await axios.delete(
        `${this.bmdrmUploadUrl}/PublicVideos`,
        {
          params: {
            id: videoId,
          },
          headers: {
            "API-KEY": apiKey,
          },
        },
      );
      return response?.data;
    } catch (error) {
      console.error("Error deleting video from BMDRM:", error);
      throw new Error(`Error deleting video: ${error}`);
    }
  }
}

// Usage function
export async function uploadToBMDRM(options: BMDRMUploadOptions) {
  const uploader = new BMDRMUploader();
  return await uploader.uploadFile(options);
}

export { BMDRMUploader };
export type { BMDRMUploadOptions, UploadProgressCallback, BMDRMUploadResult };

// React component for video upload

interface VideoUploadProps {
  onUploadComplete: (result: BMDRMUploadResult) => void;
  onUploadError: (error: string) => void;
  title: string;
  description?: string;
}

interface UploadProgress {
  chunkNumber: number;
  totalChunks: number;
  percentage: number;
  uploadJobId: string;
  totalBytesUploaded: number;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadComplete,
  onUploadError,
  title,
  description = "",
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
      // Validate file type (only video files)
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
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (result.success) {
        onUploadComplete(result);
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

  const formatBytes = (bytes: number): string => {
    return formatFileSize(bytes);
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
          <div className="flex justify-between text-xs text-gray-500">
            <span>Upload ID: {uploadProgress.uploadJobId}</span>
            <span>
              {formatBytes(uploadProgress.totalBytesUploaded)} uploaded
            </span>
          </div>
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
                Uploading video to BMDRM...
              </p>
              <p className="text-sm text-blue-600">
                Please don't close this page while the upload is in progress.
                Large files may take several minutes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;

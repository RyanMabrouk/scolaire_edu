"use client";

import React, { useState, useEffect, useRef } from "react";
import { BMDRMSessionResponse } from "@/types";
import { BMDRMUploader } from "@/components/admin/VideoUpload";

interface BMDRMVideoPlayerProps {
  videoId: string;
  lessonId: string;
  title: string;
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export default function BMDRMVideoPlayer({
  videoId,
  lessonId,
  title,
  onProgressUpdate,
  onComplete,
  className = "",
}: BMDRMVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVideoSession();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId, lessonId]);

  const fetchVideoSession = async () => {
    console.log("🚀 ~ fetchVideoSession ~ fetchVideoSession:", videoId);
    try {
      setLoading(true);
      setError(null);

      // Get BMDRM API key from environment
      const apiKey = process.env.NEXT_PUBLIC_BMDRM_API_KEY;
      if (!apiKey) {
        throw new Error("BMDRM API key not configured");
      }

      // Use BMDRMUploader to get video session
      const uploader = new BMDRMUploader();
      const userId = "user-" + Date.now(); // This should be the actual authenticated user ID

      // Use the getVideoLinkFromBmdrm method (we need to add it back)
      const url = await uploader.getVideoSession(videoId, userId, apiKey);
      console.log("🚀 ~ fetchVideoSession ~ url:", url);

      setVideoUrl(url);
    } catch (err) {
      console.error("Error fetching video session:", err);
      setError(err instanceof Error ? err.message : "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      // Start progress tracking
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;

          if (duration > 0) {
            const progressPercent = Math.round((currentTime / duration) * 100);
            setProgress(progressPercent);
            onProgressUpdate?.(progressPercent);
          }
        }
      }, 1000);
    }
  };

  const handleVideoEnd = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(100);
    onProgressUpdate?.(100);
    onComplete?.();
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
  ) => {
    console.error("Video playback error:", e);
    setError("Video playback failed. Please try refreshing the page.");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const retryLoad = async () => {
    setVideoUrl(null);
    await fetchVideoSession();
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-900 ${className}`}
        style={{ minHeight: "400px" }}
      >
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-900 ${className}`}
        style={{ minHeight: "400px" }}
      >
        <div className="p-8 text-center text-white">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium">Video Error</h3>
          <p className="mb-4 text-gray-300">{error}</p>
          <button
            onClick={retryLoad}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-900 ${className}`}
        style={{ minHeight: "400px" }}
      >
        <div className="text-center text-white">
          <p>No video URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg bg-black ${className}`}>
      <iframe
        src={videoUrl}
        title={title}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="h-full w-full border-0"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}

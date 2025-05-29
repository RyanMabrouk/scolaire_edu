"use client";

import React, { useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  className?: string;
}

export default function PDFViewer({
  pdfUrl,
  title,
  className = "",
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError("Failed to load PDF. Please try again.");
  };

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* PDF Controls */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={openInNewTab}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
              title="Open in new tab"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
            <button
              onClick={downloadPDF}
              className="rounded bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
              title="Download PDF"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative" style={{ minHeight: "600px" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="p-8 text-center">
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
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                PDF Error
              </h3>
              <p className="mb-4 text-gray-600">{error}</p>
              <div className="space-x-3">
                <button
                  onClick={openInNewTab}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={downloadPDF}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="h-full w-full border-0"
            style={{ minHeight: "600px" }}
            onLoad={handleLoad}
            onError={handleError}
            title={title}
          />
        )}
      </div>

      {/* PDF Info */}
      <div className="border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>PDF Document</span>
          <div className="flex items-center space-x-4">
            <span>Use browser controls to navigate</span>
            <div className="flex items-center space-x-1">
              <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">+</kbd>
              <span className="text-xs">to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

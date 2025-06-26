import React, { useState, useCallback, useRef } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { assetService } from '../../services/assetService';

interface AssetUploadProps {
  onUploadComplete?: () => void;
  className?: string;
}

export const AssetUpload: React.FC<AssetUploadProps> = ({ onUploadComplete, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadAssets, uploadProgress, uploadConfig } = useAssetStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate files before upload
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      files.forEach(file => {
        const validation = assetService.validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          validationErrors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (validationErrors.length > 0) {
        setUploadError(`Some files were rejected:\n${validationErrors.join('\n')}`);
      }

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      if (validFiles.length > uploadConfig.maxFilesPerUpload) {
        setUploadError(`Cannot upload more than ${uploadConfig.maxFilesPerUpload} files at once`);
        setIsUploading(false);
        return;
      }

      // Upload valid files
      await uploadAssets(validFiles);
      onUploadComplete?.();
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className={`asset-upload ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${
            isDragOver
              ? 'border-yellow-400 bg-yellow-400/10 scale-105'
              : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {/* Upload Icon */}
        <div className="mb-4">
          {isUploading ? (
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <svg
              className="w-16 h-16 mx-auto text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}
        </div>

        {/* Upload Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isUploading ? 'Uploading Assets...' : 'Upload Your Assets'}
          </h3>
          <p className="text-white/70">
            {isDragOver
              ? 'Drop files here to upload'
              : 'Drag & drop files here, or click to browse'}
          </p>

          {/* File Constraints */}
          <div className="text-sm text-white/50 space-y-1">
            <p>Maximum file size: {formatFileSize(uploadConfig.maxFileSize)}</p>
            <p>Maximum files per upload: {uploadConfig.maxFilesPerUpload}</p>
            <p>Supported formats: Images, Videos, Audio, PDFs</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={uploadConfig.allowedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-lg font-semibold text-white">Upload Progress</h4>
          {uploadProgress.map(progress => (
            <div key={progress.id} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium truncate flex-1 mr-4">
                  {progress.filename}
                </span>
                <span className="text-white/70 text-sm">
                  {progress.status === 'uploading' && `${progress.progress}%`}
                  {progress.status === 'processing' && 'Processing...'}
                  {progress.status === 'complete' && 'Complete'}
                  {progress.status === 'error' && 'Error'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === 'error'
                      ? 'bg-red-500'
                      : progress.status === 'complete'
                        ? 'bg-green-500'
                        : 'bg-yellow-400'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {/* Error Message */}
              {progress.error && <p className="text-red-300 text-sm mt-2">{progress.error}</p>}

              {/* Estimated Time */}
              {progress.estimatedTimeRemaining && progress.status === 'uploading' && (
                <p className="text-white/50 text-sm mt-1">
                  {Math.round(progress.estimatedTimeRemaining)}s remaining
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-red-300 font-medium">Upload Error</h4>
              <p className="text-red-200 text-sm mt-1 whitespace-pre-line">{uploadError}</p>
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="mt-3 text-red-300 hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">💡 Upload Tips</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Use descriptive filenames for better organization</li>
          <li>• High-quality images get better AI analysis results</li>
          <li>• Include keywords in filenames for auto-tagging</li>
          <li>• Supported formats: JPG, PNG, WebP, GIF, SVG, MP4, WebM, MP3, WAV, PDF</li>
        </ul>
      </div>
    </div>
  );
};

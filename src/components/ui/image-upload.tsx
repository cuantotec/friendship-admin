"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, CheckCircle, XCircle } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  placeholder = "Click to upload image",
  disabled = false,
  className = "",
  maxSize = 5, // 5MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"]
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type must be one of: ${acceptedTypes.join(", ")}`);
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload function provided, create object URL for preview
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-400 transition-colors
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">{placeholder}</span>
              <span className="text-xs text-gray-400">
                Max {maxSize}MB • {acceptedTypes.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import clsx from "clsx";

interface DropZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function DropZone({ onUpload, isLoading }: DropZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setDragError(null);
      if (rejectedFiles && (rejectedFiles as Array<unknown>).length > 0) {
        setDragError("Only PDF files are supported.");
        return;
      }
      if (acceptedFiles[0]) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setDragError(null);
  };

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          "relative border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 group",
          isDragActive
            ? "border-accent bg-accent/5 dropzone-active"
            : selectedFile
            ? "border-success/50 bg-success/3"
            : "border-border hover:border-ink/30 bg-cream/40 hover:bg-cream/70",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {/* Decorative corner marks */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-current opacity-20 rounded-tl" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-current opacity-20 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-current opacity-20 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-current opacity-20 rounded-br" />

        <div className="flex flex-col items-center text-center gap-4">
          {selectedFile ? (
            <>
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="font-display font-semibold text-ink text-lg">{selectedFile.name}</p>
                <p className="text-muted text-sm font-mono mt-0.5">{formatSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={removeFile}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/5"
              >
                <X className="w-3.5 h-3.5" />
                Remove file
              </button>
            </>
          ) : (
            <>
              <div
                className={clsx(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                  isDragActive
                    ? "bg-accent text-ink scale-110"
                    : "bg-ink/5 text-muted group-hover:bg-ink/10 group-hover:text-ink"
                )}
              >
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="font-display font-semibold text-ink text-lg">
                  {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                </p>
                <p className="text-muted text-sm mt-1">
                  or{" "}
                  <span className="text-ink underline underline-offset-2 decoration-dotted">
                    browse files
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="px-2 py-1 bg-ink/5 rounded-md font-mono">PDF only</span>
                <span>•</span>
                <span>Max 10MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {dragError && (
        <p className="text-danger text-sm text-center font-medium">{dragError}</p>
      )}

      {selectedFile && !isLoading && (
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-display font-semibold text-base tracking-wide transition-all duration-200
            bg-ink text-accent hover:bg-ink/85 active:scale-[0.98] shadow-lg shadow-ink/10"
        >
          Analyze My Resume →
        </button>
      )}

      {isLoading && (
        <div className="w-full py-4 rounded-xl font-display font-semibold text-base tracking-wide
          bg-ink text-paper flex items-center justify-center gap-3 opacity-80 cursor-not-allowed">
          <Loader2 className="w-5 h-5 animate-spin" />
          Scanning your resume...
        </div>
      )}
    </div>
  );
}

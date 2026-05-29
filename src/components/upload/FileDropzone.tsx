import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, Image, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

interface FileDropzoneProps {
  label: string;
  hint?: string;
  maxSizeMB?: number;
  onFileAccepted: (file: File) => void;
  accept?: Record<string, string[]>;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-5 h-5 text-primary" />;
  if (type === 'application/pdf') return <File className="w-5 h-5 text-red-500" />;
  return <FileText className="w-5 h-5 text-blue-500" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileDropzone({
  label,
  hint = '支持 PDF、Word、JPG、PNG',
  maxSizeMB = 10,
  onFileAccepted,
  accept = ACCEPTED_TYPES,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: { errors: { message: string }[] }[]) => {
      setError(null);
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        if (err.message.includes('too large')) {
          setError(`文件过大，最大支持 ${maxSizeMB}MB`);
        } else {
          setError('不支持的文件格式');
        }
        return;
      }
      if (accepted.length > 0) {
        setSelectedFile(accepted[0]);
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            {getFileIcon(selectedFile.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn('dropzone cursor-pointer', isDragActive && 'active')}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: isDragActive
                ? 'linear-gradient(135deg, hsl(214, 100%, 92%), hsl(213, 97%, 87%))'
                : 'linear-gradient(135deg, hsl(214, 100%, 96%), hsl(213, 97%, 93%))' }}>
              <Upload className={cn('w-5 h-5 transition-colors', isDragActive ? 'text-primary' : 'text-primary/60')} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? '放开即可上传' : label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">最大 {maxSizeMB}MB</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

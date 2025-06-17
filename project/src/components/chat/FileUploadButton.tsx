import React, { useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface FileUploadButtonProps {
  type: 'camera' | 'image' | 'document';
  onFileSelect: (file: File) => void;
  accept: string;
  icon: LucideIcon;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  type,
  onFileSelect,
  accept,
  icon: Icon
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="p-2 text-gray-600 hover:text-navy-blue"
        aria-label={`Upload ${type}`}
      >
        <Icon size={20} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
};

export default FileUploadButton;
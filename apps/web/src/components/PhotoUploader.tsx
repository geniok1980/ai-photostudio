import React, { useCallback, useState, useRef } from 'react';

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onFileSelect, selectedFile }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center ${
        dragOver
          ? 'border-purple-500 bg-purple-500/10'
          : selectedFile
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-400">{formatSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null as unknown as File);
            }}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Удалить
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">
              <span className="text-purple-400">Нажмите</span> или перетащите фото
            </p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG до 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;

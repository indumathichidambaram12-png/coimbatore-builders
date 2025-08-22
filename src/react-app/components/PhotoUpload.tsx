import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photo: File | null) => void;
  className?: string;
}

export default function PhotoUpload({ currentPhoto, onPhotoChange, className = '' }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoChange(file);
    }
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Worker Photo
      </label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Worker photo"
            className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 mx-auto"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center bg-gray-50">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Camera
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Gallery
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

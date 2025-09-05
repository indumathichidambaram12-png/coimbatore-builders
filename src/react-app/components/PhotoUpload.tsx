import { Camera } from 'lucide-react';

interface PhotoUploadProps {
  currentPhoto?: string;
  className?: string;
}

export default function PhotoUpload({ currentPhoto, className = '' }: PhotoUploadProps) {
  if (currentPhoto) {
    return (
      <div className={`relative w-24 h-24 ${className}`}>
        <img
          src={currentPhoto}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full ${className}`}>
      <Camera className="w-8 h-8 text-gray-400" />
    </div>
  );
}

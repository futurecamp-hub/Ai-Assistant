import React from 'react';
import { ImageUpload } from './ImageUpload';
import { useEditor } from '../EditorContext';

export const UploadScreen: React.FC = () => {
  const { setOriginalImage, navigateTo } = useEditor();

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginalImage(file, url);
    
    setTimeout(() => {
      navigateTo('edit');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Photo Enhancer
        </h1>
        <p className="text-xl text-gray-600">
          Transform your product photos for marketplaces
        </p>
      </div>
      
      <div className="w-full animate-slide-up">
        <ImageUpload onImageSelect={handleImageSelect} />
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Optimized for Wildberries, Ozon, and other marketplaces
        </p>
      </div>
    </div>
  );
};

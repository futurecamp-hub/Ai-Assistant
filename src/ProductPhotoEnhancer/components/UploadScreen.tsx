import React, { useContext } from 'react';
import { EditorContext } from '../App';
import { EditorState } from '../types';
import ImageUpload from './ImageUpload';

const UploadScreen: React.FC = () => {
  const context = useContext(EditorContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }

  const { goToScreen, setState } = context;

  const handleImageUpload = (file: File) => {
    setState(prev => ({
      ...prev,
      originalImage: file
    }));
    
    // Transition to edit screen after a small delay for smooth animation
    setTimeout(() => {
      goToScreen('edit');
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
          Product Photo Enhancer
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8">
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
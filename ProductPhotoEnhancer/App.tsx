import React from 'react';
import { EditorProvider, useEditor } from './EditorContext';
import { UploadScreen } from './components/UploadScreen';
import { EditScreen } from './components/EditScreen';
import { ResultScreen } from './components/ResultScreen';

const AppContent: React.FC = () => {
  const { currentScreen } = useEditor();

  return (
    <div className="min-h-screen">
      {currentScreen === 'upload' && <UploadScreen />}
      {currentScreen === 'edit' && <EditScreen />}
      {currentScreen === 'result' && <ResultScreen />}
    </div>
  );
};

const ProductPhotoEnhancerApp: React.FC = () => {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
};

export default ProductPhotoEnhancerApp;

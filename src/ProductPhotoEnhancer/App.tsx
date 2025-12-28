import React, { useState, useContext, createContext } from 'react';
import UploadScreen from './components/UploadScreen';
import EditScreen from './components/EditScreen';
import ResultScreen from './components/ResultScreen';
import { EditorState, Template, Style, Mood } from './types';

// Create context for the editor state
type EditorContextType = {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  goToScreen: (screen: 'upload' | 'edit' | 'result') => void;
  goBack: () => void;
};

export const EditorContext = createContext<EditorContextType | null>(null);

const ProductPhotoEnhancer: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    originalImage: null,
    marketplace: 'WB',
    selectedTemplate: null,
    selectedStyles: [],
    selectedMood: null,
    userDescription: '',
    generatedPrompt: '',
    enhancedImage: ''
  });

  const [currentScreen, setCurrentScreen] = useState<'upload' | 'edit' | 'result'>('upload');

  const goToScreen = (screen: 'upload' | 'edit' | 'result') => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    switch (currentScreen) {
      case 'edit':
        setCurrentScreen('upload');
        break;
      case 'result':
        setCurrentScreen('edit');
        break;
      default:
        break;
    }
  };

  const contextValue: EditorContextType = {
    state,
    setState,
    goToScreen,
    goBack
  };

  return (
    <EditorContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 font-sans">
        {currentScreen === 'upload' && <UploadScreen />}
        {currentScreen === 'edit' && <EditScreen />}
        {currentScreen === 'result' && <ResultScreen />}
      </div>
    </EditorContext.Provider>
  );
};

export default ProductPhotoEnhancer;
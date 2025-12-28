import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EditorState, Screen, Marketplace, Template, Style, Mood } from './types';

interface EditorContextType {
  state: EditorState;
  currentScreen: Screen;
  setOriginalImage: (file: File, url: string) => void;
  setMarketplace: (marketplace: Marketplace) => void;
  setSelectedTemplate: (template: Template | null) => void;
  toggleStyle: (style: Style) => void;
  setSelectedMood: (mood: Mood | null) => void;
  setUserDescription: (description: string) => void;
  setEnhancedImage: (imageUrl: string, prompt: string) => void;
  navigateTo: (screen: Screen) => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const initialState: EditorState = {
  originalImage: null,
  originalImageUrl: null,
  marketplace: 'Both',
  selectedTemplate: null,
  selectedStyles: [],
  selectedMood: null,
  userDescription: '',
  generatedPrompt: undefined,
  enhancedImage: undefined,
};

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EditorState>(initialState);
  const [currentScreen, setCurrentScreen] = useState<Screen>('upload');

  const setOriginalImage = (file: File, url: string) => {
    setState(prev => ({
      ...prev,
      originalImage: file,
      originalImageUrl: url,
    }));
  };

  const setMarketplace = (marketplace: Marketplace) => {
    setState(prev => ({ ...prev, marketplace }));
  };

  const setSelectedTemplate = (template: Template | null) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
  };

  const toggleStyle = (style: Style) => {
    setState(prev => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style],
    }));
  };

  const setSelectedMood = (mood: Mood | null) => {
    setState(prev => ({ ...prev, selectedMood: mood }));
  };

  const setUserDescription = (description: string) => {
    setState(prev => ({ ...prev, userDescription: description }));
  };

  const setEnhancedImage = (imageUrl: string, prompt: string) => {
    setState(prev => ({
      ...prev,
      enhancedImage: imageUrl,
      generatedPrompt: prompt,
    }));
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const reset = () => {
    setState(initialState);
    setCurrentScreen('upload');
  };

  return (
    <EditorContext.Provider
      value={{
        state,
        currentScreen,
        setOriginalImage,
        setMarketplace,
        setSelectedTemplate,
        toggleStyle,
        setSelectedMood,
        setUserDescription,
        setEnhancedImage,
        navigateTo,
        reset,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

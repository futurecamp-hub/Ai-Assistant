// Template types
export type Template = {
  id: string;
  name: string;
  marketplace: 'WB' | 'Ozon' | 'both';
  description: string;
};

// Style types
export type Style = 'minimal' | 'premium' | 'eco' | 'fashion' | 'tech' | 'lifestyle';

// Mood types
export type Mood = 'clean' | 'warm' | 'bright' | 'dark' | 'professional';

// Marketplace types
export type Marketplace = 'WB' | 'Ozon' | 'Both';

// Main editor state
export type EditorState = {
  originalImage: File | null;
  marketplace: Marketplace;
  selectedTemplate: Template | null;
  selectedStyles: Style[];
  selectedMood: Mood | null;
  userDescription: string;
  generatedPrompt?: string;
  enhancedImage?: string;
};
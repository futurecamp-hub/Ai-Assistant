export type Marketplace = 'WB' | 'Ozon' | 'Both';

export type Style = 'minimal' | 'premium' | 'eco' | 'fashion' | 'tech' | 'lifestyle';

export type Mood = 'clean' | 'warm' | 'bright' | 'dark' | 'professional';

export interface Template {
  id: string;
  name: string;
  marketplace: Marketplace;
  description: string;
  previewImage?: string;
}

export interface EditorState {
  originalImage: File | null;
  originalImageUrl: string | null;
  marketplace: Marketplace;
  selectedTemplate: Template | null;
  selectedStyles: Style[];
  selectedMood: Mood | null;
  userDescription: string;
  generatedPrompt?: string;
  enhancedImage?: string;
}

export type Screen = 'upload' | 'edit' | 'result';

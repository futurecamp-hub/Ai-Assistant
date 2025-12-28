import { Template, Style, Mood } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'wb-studio-clean',
    name: 'WB Studio Clean',
    marketplace: 'WB',
    description: 'Clean studio photo with white background, optimal for Wildberries',
  },
  {
    id: 'ozon-lifestyle-soft',
    name: 'Ozon Lifestyle Soft',
    marketplace: 'Ozon',
    description: 'Soft lifestyle setting with natural lighting, perfect for Ozon',
  },
  {
    id: 'premium-apple-look',
    name: 'Premium Apple Look',
    marketplace: 'Both',
    description: 'Premium Apple-style studio photo with perfect lighting',
  },
];

export const STYLES: Style[] = [
  'minimal',
  'premium',
  'eco',
  'fashion',
  'tech',
  'lifestyle',
];

export const MOODS: Mood[] = [
  'clean',
  'warm',
  'bright',
  'dark',
  'professional',
];

export const STYLE_LABELS: Record<Style, string> = {
  minimal: 'Minimal',
  premium: 'Premium',
  eco: 'Eco',
  fashion: 'Fashion',
  tech: 'Tech',
  lifestyle: 'Lifestyle',
};

export const MOOD_LABELS: Record<Mood, string> = {
  clean: 'Clean',
  warm: 'Warm',
  bright: 'Bright',
  dark: 'Dark',
  professional: 'Professional',
};

export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

import { Template, Style, Mood, Marketplace } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'wb-studio-clean',
    name: 'WB_STUDIO_CLEAN',
    marketplace: 'WB',
    description: 'Clean studio photo for Wildberries marketplace'
  },
  {
    id: 'ozon-lifestyle-soft',
    name: 'OZON_LIFESTYLE_SOFT',
    marketplace: 'Ozon',
    description: 'Soft lifestyle photo for Ozon marketplace'
  },
  {
    id: 'premium-apple-look',
    name: 'PREMIUM_APPLE_LOOK',
    marketplace: 'both',
    description: 'Premium Apple-style studio photo'
  }
];

export const STYLES: Style[] = ['minimal', 'premium', 'eco', 'fashion', 'tech', 'lifestyle'];

export const MOODS: Mood[] = ['clean', 'warm', 'bright', 'dark', 'professional'];

export const MARKETPLACES: Marketplace[] = ['WB', 'Ozon', 'Both'];
import React from 'react';
import { useEditor } from '../EditorContext';
import { TEMPLATES, STYLES, MOODS } from '../constants';
import { TemplateCard } from './TemplateCard';
import { StyleTag } from './StyleTag';
import { MoodButton } from './MoodButton';
import { Marketplace } from '../types';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const EditScreen: React.FC = () => {
  const {
    state,
    setMarketplace,
    setSelectedTemplate,
    toggleStyle,
    setSelectedMood,
    setUserDescription,
    navigateTo,
  } = useEditor();

  const handleEnhance = () => {
    console.log('Enhancement parameters:', {
      marketplace: state.marketplace,
      template: state.selectedTemplate,
      styles: state.selectedStyles,
      mood: state.selectedMood,
      description: state.userDescription,
    });

    const mockPrompt = `${state.selectedTemplate?.description || 'Professional product photo'}. Styles: ${state.selectedStyles.join(', ')}. Mood: ${state.selectedMood}. ${state.userDescription}`;
    
    setTimeout(() => {
      navigateTo('result');
    }, 500);
  };

  const marketplaces: Marketplace[] = ['WB', 'Ozon', 'Both'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-1/3 bg-white p-8 flex flex-col border-r border-gray-200">
        <button
          onClick={() => navigateTo('upload')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm">
            <img
              src={state.originalImageUrl || ''}
              alt="Original product"
              className="w-full rounded-2xl shadow-lg"
            />
            <p className="text-center text-sm text-gray-500 mt-4 font-medium">
              Original product
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Describe Your Result
            </h2>
            <p className="text-gray-600">
              Configure how you want your product photo to look
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Marketplace
              </label>
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                {marketplaces.map((marketplace) => (
                  <button
                    key={marketplace}
                    onClick={() => setMarketplace(marketplace)}
                    className={`
                      px-6 py-2 rounded-md text-sm font-medium transition-all
                      ${state.marketplace === marketplace
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    {marketplace}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Templates
              </label>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={state.selectedTemplate?.id === template.id}
                    onClick={() => setSelectedTemplate(
                      state.selectedTemplate?.id === template.id ? null : template
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Style Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((style) => (
                  <StyleTag
                    key={style}
                    style={style}
                    isSelected={state.selectedStyles.includes(style)}
                    onClick={() => toggleStyle(style)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Mood
              </label>
              <div className="flex flex-wrap gap-3">
                {MOODS.map((mood) => (
                  <MoodButton
                    key={mood}
                    mood={mood}
                    isSelected={state.selectedMood === mood}
                    onClick={() => setSelectedMood(
                      state.selectedMood === mood ? null : mood
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Custom Description
              </label>
              <textarea
                value={state.userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Describe how you want the image to look...&#10;&#10;Example: Clean Apple-style studio photo, white background, premium lighting, professional look"
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl
                  focus:border-gray-900 focus:outline-none transition-colors resize-none
                  placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={handleEnhance}
              disabled={!state.originalImage}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-lg
                flex items-center justify-center gap-2
                transition-all duration-200
                ${state.originalImage
                  ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Sparkles className="w-5 h-5" />
              Enhance Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

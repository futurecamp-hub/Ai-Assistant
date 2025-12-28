import React, { useContext, useState } from 'react';
import { EditorContext } from '../App';
import { TEMPLATES, STYLES, MOODS, MARKETPLACES } from '../constants';
import { Marketplace, Style, Mood, EditorState } from '../types';
import TemplateCard from './TemplateCard';
import StyleTag from './StyleTag';
import MoodButton from './MoodButton';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const EditScreen: React.FC = () => {
  const context = useContext(EditorContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }

  const { state, setState, goToScreen, goBack } = context;
  const [showPromptInfo, setShowPromptInfo] = useState(false);

  const handleMarketplaceChange = (marketplace: Marketplace) => {
    setState(prev => ({
      ...prev,
      marketplace
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    setState(prev => ({
      ...prev,
      selectedTemplate: template || null
    }));
  };

  const handleStyleToggle = (style: Style) => {
    setState(prev => {
      const selectedStyles = prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style];
      
      return {
        ...prev,
        selectedStyles
      };
    });
  };

  const handleMoodSelect = (mood: Mood) => {
    setState(prev => ({
      ...prev,
      selectedMood: mood
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({
      ...prev,
      userDescription: e.target.value
    }));
  };

  const handleEnhanceClick = () => {
    // Generate prompt based on selections
    const promptParts = [];
    
    if (state.selectedTemplate) {
      promptParts.push(state.selectedTemplate.description);
    }
    
    if (state.selectedMood) {
      promptParts.push(`Mood: ${state.selectedMood}`);
    }
    
    if (state.selectedStyles.length > 0) {
      promptParts.push(`Styles: ${state.selectedStyles.join(', ')}`);
    }
    
    if (state.userDescription) {
      promptParts.push(state.userDescription);
    }
    
    const generatedPrompt = promptParts.join(', ') || 'Enhance product photo';
    
    setState(prev => ({
      ...prev,
      generatedPrompt
    }));
    
    // Log to console for backend preparation
    console.log('Enhance parameters:', {
      marketplace: state.marketplace,
      template: state.selectedTemplate?.id,
      styles: state.selectedStyles,
      mood: state.selectedMood,
      description: state.userDescription,
      generatedPrompt: generatedPrompt
    });
    
    // Transition to result screen
    goToScreen('result');
  };

  const isEnhanceEnabled = state.originalImage !== null;

  return (
    <div className="min-h-screen flex flex-col p-4 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-8 text-gray-900">
        Describe Your Result
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left side - Original Image */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Original product</h2>
          {state.originalImage && (
            <div className="flex flex-col items-center">
              <img
                src={URL.createObjectURL(state.originalImage)}
                alt="Original"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="space-y-6">
          {/* Marketplace Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Marketplace</h3>
            <div className="flex gap-2">
              {MARKETPLACES.map(marketplace => (
                <button
                  key={marketplace}
                  onClick={() => handleMarketplaceChange(marketplace as any)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all text-sm ${
                    state.marketplace === marketplace
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {marketplace}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={state.selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>
          </div>

          {/* Style Tags */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Style Tags</h3>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(style => (
                <StyleTag
                  key={style}
                  style={style}
                  isSelected={state.selectedStyles.includes(style)}
                  onToggle={() => handleStyleToggle(style)}
                />
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Mood</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOODS.map(mood => (
                <MoodButton
                  key={mood}
                  mood={mood}
                  isSelected={state.selectedMood === mood}
                  onSelect={() => handleMoodSelect(mood)}
                />
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-900">Description</h3>
            <textarea
              value={state.userDescription}
              onChange={handleDescriptionChange}
              placeholder="Describe how you want the image to look"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-24"
            />
            <p className="text-xs text-gray-500 mt-2">
              Example: "Clean Apple-style studio photo, white background, premium lighting"
            </p>
          </div>

          {/* Enhance Button */}
          <div className="flex justify-end">
            <button
              onClick={handleEnhanceClick}
              disabled={!isEnhanceEnabled}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
                isEnhanceEnabled
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <span>Enhance Image</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScreen;
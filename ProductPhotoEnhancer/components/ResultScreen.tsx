import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ArrowLeft, Download, RefreshCw, ChevronDown, ChevronUp, Save } from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const { state, navigateTo, reset } = useEditor();
  const [showPrompt, setShowPrompt] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = state.enhancedImage || state.originalImageUrl || '';
    link.download = `enhanced-${state.originalImage?.name || 'image.jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefine = () => {
    navigateTo('edit');
  };

  const handleNewImage = () => {
    reset();
  };

  const generatedPrompt = state.generatedPrompt || 
    `${state.selectedTemplate?.description || 'Professional product photo'}. Styles: ${state.selectedStyles.join(', ')}. Mood: ${state.selectedMood}. ${state.userDescription}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigateTo('edit')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Edit</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefine}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg
              font-medium text-gray-700 hover:border-gray-300 transition-colors
              flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refine
          </button>
          
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg
              font-medium hover:bg-gray-800 transition-colors
              flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your Enhanced Image
            </h2>
            <p className="text-gray-600">
              Compare before and after by dragging the slider
            </p>
          </div>

          {state.selectedTemplate && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-medium">
                Template: {state.selectedTemplate.name}
              </span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6" style={{ height: '600px' }}>
            <BeforeAfterSlider
              beforeImage={state.originalImageUrl || ''}
              afterImage={state.enhancedImage || state.originalImageUrl || ''}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">
                Enhancement Details
              </span>
              {showPrompt ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {showPrompt && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="space-y-4 mt-4">
                  {state.selectedTemplate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Template</label>
                      <p className="text-gray-600 mt-1">{state.selectedTemplate.name}</p>
                    </div>
                  )}
                  
                  {state.selectedStyles.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Styles</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {state.selectedStyles.map((style) => (
                          <span key={style} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {state.selectedMood && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Mood</label>
                      <p className="text-gray-600 mt-1 capitalize">{state.selectedMood}</p>
                    </div>
                  )}
                  
                  {state.userDescription && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Custom Description</label>
                      <p className="text-gray-600 mt-1">{state.userDescription}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Generated Prompt</label>
                    <p className="text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg text-sm">
                      {generatedPrompt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleNewImage}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Start with a new image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

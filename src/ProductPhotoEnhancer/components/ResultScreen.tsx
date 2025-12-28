import React, { useContext, useState } from 'react';
import { EditorContext } from '../App';
import BeforeAfterSlider from './BeforeAfterSlider';
import { ArrowLeft, Download, RefreshCw, Save } from 'lucide-react';

const ResultScreen: React.FC = () => {
  const context = useContext(EditorContext);
  
  if (!context) {
    return <div>Loading...</div>;
  }

  const { state, goBack } = context;
  const [showPrompt, setShowPrompt] = useState(false);

  // For now, use the original image as both before and after since we don't have AI generation yet
  const beforeImage = state.originalImage ? URL.createObjectURL(state.originalImage) : '';
  const afterImage = state.originalImage ? URL.createObjectURL(state.originalImage) : '';

  const handleDownload = () => {
    if (state.originalImage) {
      const url = URL.createObjectURL(state.originalImage);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'enhanced-product.jpg';
      link.click();
    }
  };

  const handleRefine = () => {
    goBack();
  };

  const handleSaveTemplate = () => {
    console.log('Save template:', {
      name: `Custom Template - ${new Date().toISOString()}`,
      marketplace: state.marketplace,
      description: state.userDescription || 'Custom template',
      styles: state.selectedStyles,
      mood: state.selectedMood
    });
    alert('Template saved! (This would save to local storage in a real implementation)');
  };

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
        Enhancement Result
      </h1>

      <div className="flex-1 flex flex-col gap-8">
        {/* Before/After Slider */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Before & After</h2>
          <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />
        </div>

        {/* Prompt Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Prompt Information</h2>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              {showPrompt ? 'Hide Prompt' : 'Show Prompt'}
            </button>
          </div>

          {showPrompt && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Generated Prompt:</span> {state.generatedPrompt}
                </p>
              </div>

              {state.selectedTemplate && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {state.selectedTemplate.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {state.selectedTemplate.description}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {state.selectedStyles.map(style => (
                  <span key={style} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {style}
                  </span>
                ))}
                {state.selectedMood && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {state.selectedMood}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Download</span>
            </button>

            <button
              onClick={handleRefine}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Refine</span>
            </button>

            <button
              onClick={handleSaveTemplate}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Save Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
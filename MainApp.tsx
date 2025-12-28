import React, { useState } from 'react';
import App from './App';
import ProductPhotoEnhancer from './src/ProductPhotoEnhancer/App';

const MainApp: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<'bizmate' | 'photo-enhancer'>('photo-enhancer');

  return (
    <div className="min-h-screen">
      {/* Simple app switcher for development */}
      <div className="fixed top-4 right-4 z-50">
        <select
          value={currentApp}
          onChange={(e) => setCurrentApp(e.target.value as 'bizmate' | 'photo-enhancer')}
          className="p-2 border rounded-lg bg-white shadow-sm"
        >
          <option value="photo-enhancer">Product Photo Enhancer</option>
          <option value="bizmate">BizMate AI Workspace</option>
        </select>
      </div>

      {currentApp === 'bizmate' ? <App /> : <ProductPhotoEnhancer />}
    </div>
  );
};

export default MainApp;
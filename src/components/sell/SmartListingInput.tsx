import { useState, useRef } from 'react';
import { Sparkles, Upload, Loader2, Camera, Type, Zap } from 'lucide-react';
import { compressImage } from '../../lib/utils/imageCompression';

interface SmartListingInputProps {
  onTextParsed: (parsed: any) => void;
  onImageAnalyzed: (analysis: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function SmartListingInput({ 
  onTextParsed, 
  onImageAnalyzed, 
  onError, 
  disabled = false 
}: SmartListingInputProps) {
  const [inputText, setInputText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextParse = async () => {
    if (!inputText.trim() || isParsingText) return;

    setIsParsingText(true);
    try {
      const response = await fetch('/api/ai/parse-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        onTextParsed(data.parsed);
        setInputText(''); // Clear input after successful parse
      } else {
        onError(data.error || 'Failed to parse text');
      }
    } catch (error) {
      console.error('Text parsing error:', error);
      onError('Network error. Please try again.');
    } finally {
      setIsParsingText(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    // Validate file size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      onError('Image too large. Please use an image under 8MB.');
      return;
    }

    setIsAnalyzingImage(true);
    try {
      // Compress image for faster processing
      const compressedImage = await compressImage(file, 1024, 1024, 0.8);
      
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedImage })
      });

      const data = await response.json();

      if (response.ok) {
        onImageAnalyzed({
          ...data.analysis,
          originalImage: compressedImage
        });
      } else {
        onError(data.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      onError('Failed to process image. Please try again.');
    } finally {
      setIsAnalyzingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextParse();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Listing Creator</h3>
        <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
          AI Powered
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setMode('text')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === 'text'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Type size={16} />
          <span>Smart Text</span>
        </button>
        <button
          onClick={() => setMode('image')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === 'image'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Camera size={16} />
          <span>Photo First</span>
        </button>
      </div>

      {mode === 'text' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your item in one sentence
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={disabled || isParsingText}
                placeholder='Try: "iPhone 14 Pro Max 256GB, $850, Like New condition" or "Calculus textbook, $120, good condition"'
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {inputText.length}/500
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Zap className="w-4 h-4 inline mr-1" />
              AI will extract title, price, category, and condition
            </div>
            <button
              onClick={handleTextParse}
              disabled={disabled || !inputText.trim() || isParsingText}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isParsingText ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Parse with AI</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-purple-700">
              <strong>Examples:</strong>
            </p>
            <ul className="text-sm text-purple-600 mt-1 space-y-1">
              <li>• "MacBook Air M1, $800, excellent condition"</li>
              <li>• "Organic Chemistry textbook, $150, like new"</li>
              <li>• "IKEA desk chair, $45, good condition"</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload a photo of your item
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all ${
                disabled || isAnalyzingImage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={disabled || isAnalyzingImage}
                className="hidden"
              />
              
              {isAnalyzingImage ? (
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 size={32} className="text-purple-500 animate-spin" />
                  <p className="text-gray-600">Analyzing your photo...</p>
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <Upload size={32} className="text-gray-400" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 8MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>AI Vision will detect:</strong>
            </p>
            <ul className="text-sm text-blue-600 mt-1 space-y-1">
              <li>• Product type and brand</li>
              <li>• Condition assessment</li>
              <li>• Text in the image (labels, screens)</li>
              <li>• Suggested title and category</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useCallback } from 'react';
import { Camera, Sparkles, Loader2, ArrowRight, Edit3, Check, X } from 'lucide-react';
import { compressImage } from '../../lib/utils/imageCompression';

interface ImageFirstFlowProps {
  onComplete: (data: {
    title: string;
    price: number;
    category: string;
    condition: string;
    description: string;
    images: string[];
    confidence: number;
    suggestions: string[];
  }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

interface ImageAnalysis {
  title: string;
  category: string;
  condition: string;
  description: string;
  confidence: number;
  detectedText: string[];
  suggestions: string[];
}

export default function ImageFirstFlow({ onComplete, onError, disabled = false }: ImageFirstFlowProps) {
  const [step, setStep] = useState<'upload' | 'analyze' | 'suggest' | 'refine'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      onError('Image too large. Please use an image under 8MB.');
      return;
    }

    setIsProcessing(true);
    setStep('analyze');

    try {
      // Compress image
      const compressedImage = await compressImage(file, 1024, 1024, 0.8);
      setUploadedImage(compressedImage);

      // Analyze image with AI
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedImage })
      });

      const data = await response.json();

      if (response.ok) {
        const analysis = data.analysis;
        setImageAnalysis(analysis);
        
        // Generate multiple title suggestions
        const titles = generateTitleSuggestions(analysis);
        setSuggestedTitles(titles);
        setSelectedTitle(titles[0] || analysis.title);
        
        setStep('suggest');
      } else {
        onError(data.error || 'Failed to analyze image');
        setStep('upload');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      onError('Failed to process image. Please try again.');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTitleSuggestions = (analysis: ImageAnalysis): string[] => {
    const suggestions = [analysis.title];
    
    // Add variations based on detected text and category
    if (analysis.detectedText.length > 0) {
      const detectedText = analysis.detectedText.join(' ');
      if (detectedText !== analysis.title) {
        suggestions.push(detectedText);
      }
    }
    
    // Add category-specific variations
    if (analysis.category === 'Electronics' && analysis.title.toLowerCase().includes('iphone')) {
      suggestions.push(`${analysis.title} - ${analysis.condition}`);
      suggestions.push(`${analysis.title} Smartphone`);
    }
    
    if (analysis.category === 'Textbooks') {
      suggestions.push(`${analysis.title} Textbook`);
      suggestions.push(`${analysis.title} - College Edition`);
    }
    
    // Remove duplicates and limit to 4 suggestions
    return Array.from(new Set(suggestions)).slice(0, 4);
  };

  const handleTitleSelection = (title: string) => {
    setSelectedTitle(title);
  };

  const handleCustomTitle = () => {
    setRefinementInput(selectedTitle);
    setStep('refine');
  };

  const handleRefinement = async () => {
    if (!refinementInput.trim()) {
      onError('Please enter a description');
      return;
    }

    setIsRefining(true);

    try {
      // Parse the refinement input with AI
      const response = await fetch('/api/ai/parse-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: refinementInput.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        const parsed = data.parsed;
        
        // Combine image analysis with parsed text
        const finalData = {
          title: parsed.title || selectedTitle,
          price: parsed.price || 0,
          category: parsed.category || imageAnalysis?.category || 'Other',
          condition: parsed.condition || imageAnalysis?.condition || 'Good',
          description: parsed.description || imageAnalysis?.description || '',
          images: [uploadedImage],
          confidence: Math.min(parsed.confidence, imageAnalysis?.confidence || 0),
          suggestions: [...(parsed.suggestions || []), ...(imageAnalysis?.suggestions || [])]
        };

        onComplete(finalData);
      } else {
        onError(data.error || 'Failed to parse input');
      }
    } catch (error) {
      console.error('Refinement error:', error);
      onError('Failed to process input. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleQuickComplete = () => {
    if (!imageAnalysis) return;

    // Use image analysis data with selected title
    const finalData = {
      title: selectedTitle,
      price: 0, // Will be asked later
      category: imageAnalysis.category,
      condition: imageAnalysis.condition,
      description: imageAnalysis.description,
      images: [uploadedImage],
      confidence: imageAnalysis.confidence,
      suggestions: imageAnalysis.suggestions
    };

    onComplete(finalData);
  };

  if (step === 'upload') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start with a Photo</h3>
          <p className="text-gray-600 mb-6">
            Upload a photo and I'll suggest titles and extract details automatically
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-blue-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={disabled}
              className="hidden"
            />
            
            <Camera size={48} className="text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Click to upload photo</p>
            <p className="text-sm text-gray-500">PNG, JPG up to 8MB</p>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-2">✨ AI will detect:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
              <div>• Product type & brand</div>
              <div>• Condition assessment</div>
              <div>• Text in image</div>
              <div>• Category suggestion</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyze') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="relative mb-6">
            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded item"
                className="w-32 h-32 object-cover rounded-xl mx-auto"
              />
            )}
            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your photo...</h3>
          <p className="text-gray-600">
            AI is identifying the product and extracting details
          </p>
          
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'suggest') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-4 mb-6">
          <img
            src={uploadedImage}
            alt="Uploaded item"
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Great! I found your item</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>📂 Category: <span className="font-medium">{imageAnalysis?.category}</span></div>
              <div>⭐ Condition: <span className="font-medium">{imageAnalysis?.condition}</span></div>
              {imageAnalysis?.detectedText && imageAnalysis.detectedText.length > 0 && (
                <div>📝 Text found: <span className="font-medium">{imageAnalysis.detectedText.join(', ')}</span></div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Choose a title or create your own:</h4>
          <div className="space-y-2">
            {suggestedTitles.map((title, index) => (
              <button
                key={index}
                onClick={() => handleTitleSelection(title)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedTitle === title
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{title}</span>
                  {selectedTitle === title && <Check size={16} className="text-blue-500" />}
                </div>
              </button>
            ))}
            
            <button
              onClick={handleCustomTitle}
              className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <Edit3 size={16} />
                <span>Write custom description with price...</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('upload')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} className="inline mr-2" />
            Try Different Photo
          </button>
          <button
            onClick={handleQuickComplete}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
          >
            <ArrowRight size={16} className="inline mr-2" />
            Continue with "{selectedTitle.slice(0, 20)}..."
          </button>
        </div>
      </div>
    );
  }

  if (step === 'refine') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-4 mb-6">
          <img
            src={uploadedImage}
            alt="Uploaded item"
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add details in one line</h3>
            <p className="text-sm text-gray-600">
              Include price, condition, or any other details. AI will parse everything automatically.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your item with price and details
          </label>
          <textarea
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            placeholder='e.g., "iPhone 14 Pro Max 256GB, $850, like new condition, includes case and charger"'
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-400 mt-1">
            {refinementInput.length}/500
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI will extract:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-purple-600">
            <div>• Title refinement</div>
            <div>• Price detection</div>
            <div>• Condition updates</div>
            <div>• Additional details</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('suggest')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleRefinement}
            disabled={!refinementInput.trim() || isRefining}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isRefining ? (
              <>
                <Loader2 size={16} className="inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={16} className="inline mr-2" />
                Parse with AI
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
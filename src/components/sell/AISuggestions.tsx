import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, CheckCircle } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: string[];
  confidence: number;
  onApplySuggestion?: (suggestion: string) => void;
  className?: string;
}

export default function AISuggestions({ 
  suggestions, 
  confidence, 
  onApplySuggestion,
  className = '' 
}: AISuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getConfidenceText = () => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const handleApplySuggestion = (suggestion: string, index: number) => {
    setAppliedSuggestions(prev => new Set(Array.from(prev).concat(index)));
    onApplySuggestion?.(suggestion);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getConfidenceColor()}`}>
                {getConfidenceText()}
              </span>
              <span className="text-sm text-gray-500">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {suggestions.map((suggestion, index) => {
            const isApplied = appliedSuggestions.has(index);
            
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  isApplied 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className={`text-sm flex-1 ${
                    isApplied ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {suggestion}
                  </p>
                  
                  {onApplySuggestion && !isApplied && (
                    <button
                      onClick={() => handleApplySuggestion(suggestion, index)}
                      className="ml-3 text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 transition-colors font-medium"
                    >
                      Apply
                    </button>
                  )}
                  
                  {isApplied && (
                    <div className="ml-3 flex items-center space-x-1 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-xs font-medium">Applied</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <Sparkles size={12} />
              <span>Suggestions powered by AI to help improve your listing</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
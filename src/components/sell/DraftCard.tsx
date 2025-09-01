import { CheckCircle, MapPin, Tag, Star, FileText } from 'lucide-react';

interface ListingDraft {
  title: string;
  price: number | null;
  images: string[];
  category: string;
  condition: string;
  meetingSpot: string;
  description: string;
}

interface DraftCardProps {
  draft: ListingDraft;
  onPublish: () => void;
  isPublishing: boolean;
}

export default function DraftCard({ draft, onPublish, isPublishing }: DraftCardProps) {
  const isComplete = () => {
    return draft.title && draft.price && draft.images.length > 0 && 
           draft.category && draft.condition && draft.meetingSpot && draft.description;
  };

  const getCompletionPercentage = () => {
    const fields = [
      draft.title,
      draft.price,
      draft.images.length > 0,
      draft.category,
      draft.condition,
      draft.meetingSpot,
      draft.description
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Listing Preview</h2>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion</span>
            <span className="font-medium">{getCompletionPercentage()}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Images */}
        {draft.images.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Photos ({draft.images.length})</h3>
            <div className="grid grid-cols-2 gap-2">
              {draft.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  {idx === 3 && draft.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{draft.images.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title & Price */}
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {draft.title || 'Item Title'}
          </h3>
          {draft.price && (
            <p className="text-2xl font-bold text-orange-600 mt-1">
              ${draft.price.toFixed(2)}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          {draft.category && (
            <div className="flex items-center space-x-2 text-sm">
              <Tag size={16} className="text-gray-400" />
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{draft.category}</span>
            </div>
          )}

          {draft.condition && (
            <div className="flex items-center space-x-2 text-sm">
              <Star size={16} className="text-gray-400" />
              <span className="text-gray-600">Condition:</span>
              <span className="font-medium">{draft.condition}</span>
            </div>
          )}

          {draft.meetingSpot && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-gray-600">Meeting Spot:</span>
              <span className="font-medium">{draft.meetingSpot}</span>
            </div>
          )}

          {draft.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <FileText size={16} className="text-gray-400" />
                <span className="text-gray-600">Description:</span>
              </div>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                {draft.description}
              </p>
            </div>
          )}
        </div>

        {/* Required Fields Checklist */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center space-x-2 ${draft.title ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.title ? 'text-green-500' : 'text-gray-300'} />
              <span>Item title</span>
            </div>
            <div className={`flex items-center space-x-2 ${draft.price ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.price ? 'text-green-500' : 'text-gray-300'} />
              <span>Price</span>
            </div>
            <div className={`flex items-center space-x-2 ${draft.images.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.images.length > 0 ? 'text-green-500' : 'text-gray-300'} />
              <span>At least 1 photo</span>
            </div>
          </div>
        </div>

        {/* Optional Fields Checklist */}
        <div className="bg-orange-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Optional (Recommended)</h4>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center space-x-2 ${draft.category ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.category ? 'text-green-500' : 'text-gray-300'} />
              <span>Category</span>
            </div>
            <div className={`flex items-center space-x-2 ${draft.condition ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.condition ? 'text-green-500' : 'text-gray-300'} />
              <span>Condition</span>
            </div>
            <div className={`flex items-center space-x-2 ${draft.meetingSpot ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.meetingSpot ? 'text-green-500' : 'text-gray-300'} />
              <span>Meeting spot</span>
            </div>
            <div className={`flex items-center space-x-2 ${draft.description ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle size={14} className={draft.description ? 'text-green-500' : 'text-gray-300'} />
              <span>Description</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Button */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={onPublish}
          disabled={!isComplete() || isPublishing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isComplete() && !isPublishing
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPublishing ? 'Publishing...' : isComplete() ? 'Publish Listing' : 'Complete Required Fields'}
        </button>
        
        {isComplete() && (
          <p className="text-xs text-gray-600 mt-2 text-center">
            Your listing will be live for 14 days
          </p>
        )}
      </div>
    </div>
  );
}
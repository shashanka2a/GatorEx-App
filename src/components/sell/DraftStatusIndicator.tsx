import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Check, Loader2, Wifi, WifiOff } from 'lucide-react';

interface DraftStatusIndicatorProps {
  isOnline: boolean;
  lastSaved: Date | null;
  isSaving?: boolean;
  className?: string;
}

export default function DraftStatusIndicator({ 
  isOnline, 
  lastSaved, 
  isSaving = false,
  className = '' 
}: DraftStatusIndicatorProps) {
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Show "Saved" message briefly when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      setShowSavedMessage(true);
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const getStatusText = () => {
    if (isSaving) return 'Saving...';
    if (showSavedMessage) return 'Saved';
    if (!isOnline) return 'Offline';
    if (lastSaved) {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just saved';
      if (diffMins < 60) return `Saved ${diffMins}m ago`;
      return `Saved ${Math.floor(diffMins / 60)}h ago`;
    }
    return 'Auto-save enabled';
  };

  const getStatusIcon = () => {
    if (isSaving) return <Loader2 className="w-3 h-3 animate-spin" />;
    if (showSavedMessage) return <Check className="w-3 h-3" />;
    if (!isOnline) return <WifiOff className="w-3 h-3" />;
    return <Cloud className="w-3 h-3" />;
  };

  const getStatusColor = () => {
    if (isSaving) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (showSavedMessage) return 'text-green-600 bg-green-50 border-green-200';
    if (!isOnline) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {!isOnline && (
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}

// Alternative compact version for mobile
export function CompactDraftStatusIndicator({ 
  isOnline, 
  lastSaved, 
  isSaving = false,
  className = '' 
}: DraftStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (isSaving) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (!isOnline) return <CloudOff className="w-4 h-4 text-orange-500" />;
    return <Cloud className="w-4 h-4 text-green-500" />;
  };

  const getTooltipText = () => {
    if (isSaving) return 'Saving draft...';
    if (!isOnline) return 'Offline - changes saved locally';
    if (lastSaved) {
      return `Last saved: ${lastSaved.toLocaleTimeString()}`;
    }
    return 'Auto-save enabled';
  };

  return (
    <div 
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-help ${className}`}
      title={getTooltipText()}
    >
      {getStatusIcon()}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useLoading } from '../../contexts/LoadingContext';

export default function LoadingBar() {
  const { isNavigating } = useLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isNavigating) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => clearInterval(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div 
        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-200 ease-out shadow-sm"
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.1s ease-out',
          boxShadow: isNavigating ? '0 0 10px rgba(249, 115, 22, 0.5)' : 'none'
        }}
      />
    </div>
  );
}
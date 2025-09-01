import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    const variants = {
      default: 'bg-orange-100 text-orange-800',
      secondary: 'bg-gray-100 text-gray-800',
      outline: 'border border-gray-200 text-gray-700'
    };
    
    return (
      <span
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
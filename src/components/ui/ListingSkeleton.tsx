import { Card } from './card';

export function ListingSkeleton() {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden h-full flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 flex-shrink-0 bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        
        {/* Price and Category Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Description Skeleton */}
        <div className="mb-3 h-10">
          <div className="h-3 bg-gray-200 rounded mb-1" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Location and Date Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        
        {/* Seller Info Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Button Skeleton */}
        <div className="mt-auto">
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </Card>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
}
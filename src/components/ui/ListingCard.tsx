import { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Heart, MapPin, Shield, Clock, Mail, Phone } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  meetingSpot: string;
  createdAt: string;
  images: { url: string }[];
  user: { 
    name: string | null;
  };
}

interface ListingCardProps {
  listing: Listing;
  onListingClick: (listing: Listing) => void;
  onContactSeller: (action: 'sms' | 'email', listing: Listing) => void;
  isFavorited?: boolean;
  onFavoriteChange?: (listingId: string, favorited: boolean) => void;
}

export const ListingCard = memo(function ListingCard({ 
  listing, 
  onListingClick, 
  onContactSeller,
  isFavorited = false,
  onFavoriteChange
}: ListingCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Deduplicate images to handle any database issues
  const uniqueImages = listing.images.filter((image, index, self) => 
    index === self.findIndex(img => img.url === image.url)
  );

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session || loadingFavorite) return;
    
    setLoadingFavorite(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorited(data.favorited);
        onFavoriteChange?.(listing.id, data.favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <Card 
      className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-0 overflow-hidden cursor-pointer group h-full flex flex-col"
      onClick={() => onListingClick(listing)}
    >
      {/* Image Section - Fixed Height */}
      <div className="relative h-48 flex-shrink-0 bg-gray-100">
        {uniqueImages.length > 0 ? (
          <>
            <ImageWithFallback
              src={uniqueImages[0].url}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📦</span>
          </div>
        )}
        
        {/* Heart Icon - Top Right */}
        <div className="absolute top-3 right-3">
          {session ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-0 w-9 h-9 rounded-full shadow-lg backdrop-blur-sm border border-white/30 transition-all duration-200 ${
                favorited 
                  ? 'bg-red-50/90 hover:bg-red-100/90 text-red-500 hover:text-red-600' 
                  : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
              }`}
              onClick={toggleFavorite}
              disabled={loadingFavorite}
            >
              <Heart 
                className={`w-4 h-4 ${loadingFavorite ? 'animate-pulse' : ''}`}
                fill={favorited ? 'currentColor' : 'none'}
              />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 w-9 h-9 bg-white/80 text-gray-400 rounded-full shadow-lg backdrop-blur-sm border border-white/30 cursor-not-allowed"
              disabled
            >
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Condition Badge - Bottom Left (smaller) */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/95 text-gray-700 text-xs font-medium shadow-sm border-0 px-2 py-1 backdrop-blur-sm">
            {listing.condition}
          </Badge>
        </div>

        {/* Image Count - Bottom Right */}
        {uniqueImages.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-white/95 text-gray-700 text-xs font-medium shadow-sm border-0 px-2 py-1 backdrop-blur-sm">
              +{uniqueImages.length - 1}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content Section - Improved Hierarchy */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Title - Larger and More Prominent */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
          {listing.title}
        </h3>
        
        {/* Price and Category - Same Line with Better Spacing */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">${listing.price}</span>
          <Badge className="bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200 px-2 py-1">
            {listing.category}
          </Badge>
        </div>
        
        {/* Description - More Subtle */}
        {listing.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {listing.description}
          </p>
        )}
        
        {/* Meta Information Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
          {/* Location and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{listing.meetingSpot}</span>
            </div>
            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
          
          {/* Seller Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                <Shield className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 truncate">
              👤 {listing.user.name || 'UF Student'}
            </div>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onListingClick(listing);
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5"
            size="sm"
          >
            {session ? '📞 Contact Seller' : '🔐 Sign in to contact'}
          </Button>
        </div>
      </div>
    </Card>
  );
});
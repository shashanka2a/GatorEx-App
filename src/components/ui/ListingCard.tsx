import { memo } from 'react';
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
    email: string;
    name: string | null;
    phoneNumber: string | null;
  };
}

interface ListingCardProps {
  listing: Listing;
  onListingClick: (listing: Listing) => void;
  onContactSeller: (action: 'sms' | 'email', listing: Listing) => void;
}

export const ListingCard = memo(function ListingCard({ 
  listing, 
  onListingClick, 
  onContactSeller 
}: ListingCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Card 
      className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-0 overflow-hidden cursor-pointer group h-full flex flex-col"
      onClick={() => onListingClick(listing)}
    >
      {/* Image Section - Fixed Height */}
      <div className="relative h-48 flex-shrink-0 bg-gray-100">
        {listing.images.length > 0 ? (
          <ImageWithFallback
            src={listing.images[0].url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl text-gray-400">📦</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 w-8 h-8 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite logic here
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-black/80 text-white text-xs">
            {listing.condition}
          </Badge>
        </div>

        {listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/80 text-white text-xs">
              +{listing.images.length - 1} more
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content Section - Flexible Height */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title - Fixed Height */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12 leading-6">
          {listing.title}
        </h3>
        
        {/* Price and Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-orange-600">${listing.price}</span>
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            {listing.category}
          </Badge>
        </div>
        
        {/* Description - Fixed Height */}
        <div className="mb-3 h-10">
          {listing.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
          )}
        </div>
        
        {/* Location and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{listing.meetingSpot}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 truncate">
            👤 {listing.user.name || 'UF Student'}
          </div>
        </div>
        
        {/* Action Buttons - Fixed at Bottom */}
        <div className="mt-auto">
          {session ? (
            <div className="flex gap-2">
              {listing.user.phoneNumber && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactSeller('sms', listing);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Text
                </Button>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onContactSeller('email', listing);
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push('/verify');
              }}
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              🔐 Sign in to contact seller
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});
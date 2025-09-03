import { useState, useEffect, useCallback } from 'react';
import { X, Heart, MapPin, Clock, Shield, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
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

interface ContactDetails {
  email: string;
  phoneNumber: string | null;
  name: string | null;
}

interface ListingModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onContact: (action: 'sms' | 'email', listing: Listing) => void;
  isAuthenticated: boolean;
}

export default function ListingModal({ listing, isOpen, onClose, onContact, isAuthenticated }: ListingModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  
  // Deduplicate images to handle any database issues
  const uniqueImages = listing.images.filter((image, index, self) => 
    index === self.findIndex(img => img.url === image.url)
  );
  
  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const fetchContactDetails = useCallback(async () => {
    if (!isAuthenticated || contactDetails) return;
    
    setLoadingContact(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}/contact`);
      if (response.ok) {
        const data = await response.json();
        setContactDetails(data.seller);
        setShowContactDetails(true);
      } else {
        console.error('Failed to fetch contact details');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setLoadingContact(false);
    }
  }, [isAuthenticated, contactDetails, listing.id]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || loadingFavorite) return;
    
    setLoadingFavorite(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFavorite(false);
    }
  }, [isAuthenticated, loadingFavorite, listing.id]);

  const trackView = useCallback(async () => {
    if (viewTracked) return;
    
    try {
      await fetch(`/api/listings/${listing.id}/view`, {
        method: 'POST'
      });
      setViewTracked(true);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [listing.id, viewTracked]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/favorites/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingIds: [listing.id] })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favoritedIds.includes(listing.id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [isAuthenticated, listing.id]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === uniqueImages.length - 1 ? 0 : prev + 1
    );
  }, [uniqueImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? uniqueImages.length - 1 : prev - 1
    );
  }, [uniqueImages.length]);

  // Track view and check favorite status when modal opens
  useEffect(() => {
    if (isOpen && !viewTracked) {
      trackView();
      checkFavoriteStatus();
    }
  }, [isOpen, viewTracked, trackView, checkFavoriteStatus]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setViewTracked(false);
      setContactDetails(null);
      setShowContactDetails(false);
      setCurrentImageIndex(0);
      setIsFavorited(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextImage();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextImage, prevImage, onClose]);

  if (!isOpen) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gray-100">
              {uniqueImages.length > 0 ? (
                <div 
                  className="relative h-96 lg:h-full min-h-[400px] group"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <ImageWithFallback
                    src={uniqueImages[currentImageIndex].url}
                    alt={`${listing.title} - Image ${currentImageIndex + 1} of ${uniqueImages.length}`}
                    className="w-full h-full object-cover cursor-pointer select-none"
                    onClick={nextImage}
                    draggable={false}
                  />
                  
                  {uniqueImages.length > 1 && (
                    <>
                      {/* Navigation buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      {/* Image counter */}
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {uniqueImages.length}
                      </div>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {uniqueImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`w-3 h-3 rounded-full transition-all hover:scale-110 ${
                              index === currentImageIndex 
                                ? 'bg-white shadow-lg' 
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 lg:h-full min-h-[400px] flex items-center justify-center">
                  <span className="text-6xl text-gray-400">📦</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 lg:p-8 flex flex-col">
              <div className="flex-1">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 pr-4">
                      {listing.title}
                    </h1>
                    {isAuthenticated ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-3 transition-all ${
                          isFavorited 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        onClick={toggleFavorite}
                        disabled={loadingFavorite}
                      >
                        <Heart 
                          size={28} 
                          fill={isFavorited ? 'currentColor' : 'none'}
                          className={loadingFavorite ? 'animate-pulse' : ''}
                        />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="p-3 text-gray-300 cursor-not-allowed">
                        <Heart size={28} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-orange-600">${listing.price}</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {listing.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {listing.condition}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Details */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="font-medium">Meeting Spot:</span>
                    <span>{listing.meetingSpot}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="font-medium">Listed:</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        👤 {listing.user.name || 'UF Student'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          <Shield size={12} />
                          <span>UF Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="border-t pt-6">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {!showContactDetails ? (
                      <Button
                        onClick={fetchContactDetails}
                        disabled={loadingContact}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        {loadingContact ? 'Loading...' : '📞 View Contact Details'}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-blue-600" />
                              <span className="text-blue-800">{contactDetails?.email}</span>
                            </div>
                            {contactDetails?.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-blue-600" />
                                <span className="text-blue-800">{contactDetails.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {contactDetails?.phoneNumber && (
                            <Button
                              onClick={async () => {
                                // Track contact event
                                try {
                                  await fetch(`/api/listings/${listing.id}/contact-event`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      contactType: 'SMS',
                                      message: 'Contacted via SMS'
                                    })
                                  });
                                } catch (error) {
                                  console.error('Error tracking contact event:', error);
                                }
                                
                                onContact('sms', { 
                                  ...listing, 
                                  user: { 
                                    name: listing.user.name,
                                    phoneNumber: contactDetails.phoneNumber, 
                                    email: contactDetails.email 
                                  } 
                                } as any);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Phone size={16} className="mr-2" />
                              Text Seller
                            </Button>
                          )}
                          <Button
                            onClick={async () => {
                              // Track contact event
                              try {
                                await fetch(`/api/listings/${listing.id}/contact-event`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    contactType: 'EMAIL',
                                    message: 'Contacted via email'
                                  })
                                });
                              } catch (error) {
                                console.error('Error tracking contact event:', error);
                              }
                              
                              onContact('email', { 
                                ...listing, 
                                user: { 
                                  name: listing.user.name,
                                  phoneNumber: contactDetails?.phoneNumber || null, 
                                  email: contactDetails?.email || '' 
                                } 
                              } as any);
                            }}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                          >
                            <Mail size={16} className="mr-2" />
                            Email Seller
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Be respectful and follow UF community guidelines
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full border-2 border-dashed border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      🔐 Sign in to contact seller
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
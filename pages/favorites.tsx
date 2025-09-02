import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Heart, ArrowLeft } from 'lucide-react';
import { ListingCard } from '../src/components/ui/ListingCard';
import { ListingModal } from '../src/components/ui/ListingModal';
import { Button } from '../src/components/ui/button';

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

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchFavorites();
  }, [session, status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
        
        // Set initial favorite statuses
        const statuses: Record<string, boolean> = {};
        data.favorites.forEach((listing: Listing) => {
          statuses[listing.id] = true;
        });
        setFavoriteStatuses(statuses);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (listingId: string, favorited: boolean) => {
    setFavoriteStatuses(prev => ({
      ...prev,
      [listingId]: favorited
    }));

    if (!favorited) {
      // Remove from favorites list
      setFavorites(prev => prev.filter(listing => listing.id !== listingId));
    }
  };

  const handleContact = (action: 'sms' | 'email', listing: any) => {
    if (action === 'sms' && listing.user.phoneNumber) {
      const message = `Hi! I'm interested in your ${listing.title} listed for $${listing.price}. Is it still available?`;
      window.open(`sms:${listing.user.phoneNumber}?body=${encodeURIComponent(message)}`);
    } else if (action === 'email') {
      const subject = `Interested in: ${listing.title}`;
      const body = `Hi ${listing.user.name || 'there'},\n\nI'm interested in your ${listing.title} listed for $${listing.price}. Is it still available?\n\nThanks!`;
      window.open(`mailto:${listing.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Favorites - GatorEx</title>
        <meta name="description" content="Your favorite listings on GatorEx" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
                  <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start browsing listings and tap the heart icon to save your favorites here.
              </p>
              <Button
                onClick={() => router.push('/buy')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Browse Listings
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onListingClick={setSelectedListing}
                  onContactSeller={handleContact}
                  isFavorited={favoriteStatuses[listing.id] ?? true}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Listing Modal */}
        {selectedListing && (
          <ListingModal
            listing={selectedListing}
            isOpen={!!selectedListing}
            onClose={() => setSelectedListing(null)}
            onContact={handleContact}
            isAuthenticated={!!session}
          />
        )}
      </div>
    </>
  );
}
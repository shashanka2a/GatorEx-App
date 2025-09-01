import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Card } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Heart, MapPin, Shield, Clock, Eye, MessageCircle, Mail, Phone, Search, Filter, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../src/components/figma/ImageWithFallback';
import WebNav from '../src/components/navigation/WebNav';
import MobileNav from '../src/components/navigation/MobileNav';
import ListingModal from '../src/components/ui/ListingModal';
import { ListingGridSkeleton } from '../src/components/ui/ListingSkeleton';
import { ListingCard } from '../src/components/ui/ListingCard';

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

export default function BuyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const categories = ['all', 'electronics', 'textbooks', 'furniture', 'clothing', 'other'];

  // Fetch listings with optimized API call
  const fetchListings = useCallback(async (category?: string, search?: string, pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }
      
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      params.append('page', pageNum.toString());
      params.append('limit', '20');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      
      const data = await response.json();
      
      if (append) {
        setListings(prev => [...prev, ...data]);
      } else {
        setListings(data);
      }
      
      setHasMore(data.length === 20); // If we got less than 20, no more pages
    } catch (err) {
      setError('Failed to load listings. Please try again.');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Debounced search and category filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchListings(selectedCategory, searchTerm, 1, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, fetchListings]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchListings(selectedCategory, searchTerm, nextPage, true);
    }
  }, [loading, hasMore, page, selectedCategory, searchTerm, fetchListings]);

  // Memoized filtered listings for better performance
  const filteredListings = useMemo(() => {
    return listings; // API already handles filtering
  }, [listings]);

  const handleContactSeller = (action: 'sms' | 'email', listing: Listing) => {
    if (!session) {
      router.push('/verify');
      return;
    }

    if (action === 'sms' && listing.user.phoneNumber) {
      window.open(`sms:${listing.user.phoneNumber}?body=Hi! I'm interested in your "${listing.title}" listing on GatorEx.`);
    } else if (action === 'email') {
      window.open(`mailto:${listing.user.email}?subject=GatorEx: ${listing.title}&body=Hi! I'm interested in your "${listing.title}" listing on GatorEx.`);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <>
      <Head>
        <title>Buy - GatorEx</title>
        <meta name="description" content="Browse items for sale by UF students" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <WebNav userVerified={!!session?.user} onSearch={setSearchTerm} />
        <MobileNav userVerified={!!session?.user} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Hero Section */}
          <div className="bg-uf-gradient p-6 rounded-2xl text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Find Great Deals</h1>
                <p className="text-white/90">From fellow Gators you can trust</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{filteredListings.length}</div>
                <div className="text-xs text-white/80">Items Available</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all min-w-[160px] appearance-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Loading State */}
          {loading && <ListingGridSkeleton />}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-12 text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={() => fetchListings(selectedCategory, searchTerm)}
                className="bg-uf-gradient text-white hover:opacity-90"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredListings.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to list an item!'
                }
              </p>
              <Button className="bg-uf-gradient text-white hover:opacity-90">
                <MessageCircle className="w-4 h-4 mr-2" />
                List an Item
              </Button>
            </Card>
          )}

          {/* Listings Grid */}
          {!loading && !error && filteredListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onListingClick={handleListingClick}
                  onContactSeller={handleContactSeller}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && !error && filteredListings.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                variant="outline"
                className="px-8 py-3 border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Load More Listings
              </Button>
            </div>
          )}
        </div>

        {/* Listing Detail Modal */}
        {selectedListing && (
          <ListingModal
            listing={selectedListing}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onContact={handleContactSeller}
            isAuthenticated={!!session}
          />
        )}
      </div>
    </>
  );
}

// Remove getServerSideProps to enable client-side rendering for better performance
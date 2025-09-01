import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { prisma } from '../src/lib/db/prisma';
import { Card } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Heart, MapPin, Shield, Clock, Eye, MessageCircle, Mail, Phone, Search, Filter } from 'lucide-react';
import { ImageWithFallback } from '../src/components/figma/ImageWithFallback';
import WebNav from '../src/components/navigation/WebNav';
import MobileNav from '../src/components/navigation/MobileNav';

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

interface BuyPageProps {
  listings: Listing[];
}

export default function BuyPage({ listings }: BuyPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredListings, setFilteredListings] = useState(listings);

  const categories = ['all', 'electronics', 'textbooks', 'furniture', 'clothing', 'other'];

  useEffect(() => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    setFilteredListings(filtered);
  }, [searchTerm, selectedCategory, listings]);

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

  const handleSearch = (query: string) => {
    setSearchTerm(query);
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
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all min-w-[160px]"
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

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card 
                  key={listing.id} 
                  className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-0 overflow-hidden"
                >
                  <div className="relative">
                    {listing.images.length > 0 ? (
                      <ImageWithFallback
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">📦</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <Button variant="ghost" size="sm" className="p-0 w-8 h-8 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {listing.condition}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-uf-orange">${listing.price}</span>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        {listing.category}
                      </Badge>
                    </div>
                    
                    {listing.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.meetingSpot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          <Shield className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        👤 {listing.user.name || 'UF Student'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {session ? (
                        <div className="flex gap-2">
                          {listing.user.phoneNumber && (
                            <Button
                              onClick={() => handleContactSeller('sms', listing)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                              size="sm"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Text
                            </Button>
                          )}
                          <Button
                            onClick={() => handleContactSeller('email', listing)}
                            className="flex-1 bg-uf-gradient hover:opacity-90 text-white"
                            size="sm"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => router.push('/verify')}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch published listings - no authentication required for browsing
    const listings = await prisma.listing.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        images: {
          select: { url: true }
        },
        user: {
          select: { 
            email: true,
            name: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      props: {
        listings: JSON.parse(JSON.stringify(listings))
      },
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return {
      props: {
        listings: []
      },
    };
  }
};
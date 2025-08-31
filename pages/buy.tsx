import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSessionFromNextRequest } from '../src/lib/auth/session';
import { prisma } from '../src/lib/db/turso';

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
  userEmail: string;
}

export default function BuyPage({ listings, userEmail }: BuyPageProps) {
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/verify';
  };

  return (
    <>
      <Head>
        <title>Buy - GatorEx</title>
        <meta name="description" content="Browse items for sale by UF students" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-orange-600">🐊 GatorEx</h1>
                <nav className="hidden md:flex space-x-8">
                  <Link href="/buy" className="text-orange-600 font-medium">Buy</Link>
                  <Link href="/sell" className="text-gray-700 hover:text-orange-600">Sell</Link>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to list an item!'
                }
              </p>
              <Link
                href="/sell"
                className="inline-block mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                List an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {listing.images.length > 0 && (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <p className="text-2xl font-bold text-orange-600 mb-2">
                      ${listing.price}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {listing.category}
                      </span>
                      <span>{listing.condition}</span>
                    </div>
                    
                    {listing.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>📍 {listing.meetingSpot}</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      <div>👤 {listing.user.name}</div>
                      {listing.user.phoneNumber && (
                        <div>📱 {listing.user.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {listing.user.phoneNumber && (
                        <a
                          href={`sms:${listing.user.phoneNumber}?body=Hi! I'm interested in your "${listing.title}" listing on GatorEx.`}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium text-center"
                        >
                          💬 Text
                        </a>
                      )}
                      <a
                        href={`mailto:${listing.user.email}?subject=GatorEx: ${listing.title}&body=Hi! I'm interested in your "${listing.title}" listing on GatorEx.`}
                        className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium text-center"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    // This will be handled by middleware, but let's double-check
    const session = getSessionFromNextRequest(req as any);
    
    if (!session) {
      return {
        redirect: {
          destination: '/verify',
          permanent: false,
        },
      };
    }

    // Check if user has completed profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { profileCompleted: true, email: true }
    });

    if (!user?.profileCompleted) {
      return {
        redirect: {
          destination: '/complete-profile',
          permanent: false,
        },
      };
    }

    // Fetch published listings
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
        listings: JSON.parse(JSON.stringify(listings)),
        userEmail: session.email
      },
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return {
      props: {
        listings: [],
        userEmail: ''
      },
    };
  }
};
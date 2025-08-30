import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, Filter, Grid, List } from 'lucide-react';
import Layout from '../src/components/layout/Layout';
import { checkEmailVerification } from '../src/lib/email/verification';

// Mock listings data
const mockListings = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Excellent Condition',
    price: '$650',
    originalPrice: '$845',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    location: 'Via WhatsApp',
    likes: 23,
    views: 156,
    category: 'Electronics',
    seller: {
      name: 'Alex Johnson',
      verified: true,
      rating: 4.8,
      responseTime: '2h',
      trustLevel: 'TRUSTED'
    },
    timePosted: '2 hours ago',
    condition: 'Excellent',
    trending: true,
    savings: 25,
    description: 'Barely used iPhone 13 Pro in excellent condition. Includes original box and charger.',
    whatsappLink: 'https://wa.me/1234567890?text=Hi! I\'m interested in your iPhone 13 Pro listing on GatorEx.'
  },
  {
    id: '2',
    title: 'Calculus Textbook - 8th Edition',
    price: '$120',
    originalPrice: '$280',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    location: 'Via WhatsApp',
    likes: 8,
    views: 45,
    category: 'Books',
    seller: {
      name: 'Sarah Chen',
      verified: true,
      rating: 4.9,
      responseTime: '1h',
      trustLevel: 'BASIC'
    },
    timePosted: '1 day ago',
    condition: 'Good',
    trending: false,
    savings: 57,
    description: 'Used calculus textbook in good condition. Some highlighting but all pages intact.',
    whatsappLink: 'https://wa.me/1234567891?text=Hi! I\'m interested in your Calculus textbook listing on GatorEx.'
  },
  {
    id: '3',
    title: 'Gaming Chair - Like New',
    price: '$200',
    originalPrice: '$300',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    location: 'Via WhatsApp',
    likes: 15,
    views: 89,
    category: 'Furniture',
    seller: {
      name: 'Mike Rodriguez',
      verified: true,
      rating: 4.7,
      responseTime: '3h',
      trustLevel: 'BASIC'
    },
    timePosted: '3 days ago',
    condition: 'Like New',
    trending: false,
    savings: 33,
    description: 'Barely used gaming chair, very comfortable for long study sessions.',
    whatsappLink: 'https://wa.me/1234567892?text=Hi! I\'m interested in your Gaming Chair listing on GatorEx.'
  },
  {
    id: '4',
    title: 'MacBook Air M1 - 2021',
    price: '$800',
    originalPrice: '$999',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    location: 'Via WhatsApp',
    likes: 42,
    views: 234,
    category: 'Electronics',
    seller: {
      name: 'Emma Wilson',
      verified: true,
      rating: 4.9,
      responseTime: '1h',
      trustLevel: 'TRUSTED'
    },
    timePosted: '5 hours ago',
    condition: 'Excellent',
    trending: true,
    savings: 20,
    description: 'MacBook Air M1 in excellent condition. Perfect for students. Includes charger.',
    whatsappLink: 'https://wa.me/1234567893?text=Hi! I\'m interested in your MacBook Air listing on GatorEx.'
  }
];

export default function HomePage() {
  const [listings, setListings] = useState(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [userVerified, setUserVerified] = useState(false);

  useEffect(() => {
    const verified = checkEmailVerification();
    setUserVerified(verified);
  }, []);

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Furniture', 'Transportation', 'Other'];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement actual search functionality
    console.log('Searching for:', query);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout userVerified={userVerified} onSearch={handleSearch}>
      <Head>
        <title>Buy Items - GatorEx</title>
        <meta name="description" content="Buy items safely from fellow UF students" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Search & Filters */}
        <div className="md:hidden mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{filteredListings.length} items</span>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid/List */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className={`
                  bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer
                  ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'overflow-hidden'}
                `}
              >
                <div className={viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'}>
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'p-4'}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-medium text-gray-900 ${viewMode === 'list' ? 'text-lg' : ''}`}>
                      {listing.title}
                    </h3>
                    {listing.trending && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">{listing.price}</span>
                    {listing.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{listing.originalPrice}</span>
                    )}
                    {listing.savings > 0 && (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        {listing.savings}% off
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{listing.condition}</span>
                    <span>{listing.timePosted}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                    
                    <a
                      href={listing.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Analytics event
                        if (typeof window !== 'undefined' && (window as any).gtag) {
                          (window as any).gtag('event', 'contact_seller', {
                            event_category: 'listings',
                            event_label: listing.id
                          });
                        }
                      }}
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
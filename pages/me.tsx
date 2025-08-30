import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Star, 
  Package, 
  Clock, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit3
} from 'lucide-react';
import Layout from '../src/components/layout/Layout';

// Mock data - replace with actual user data
const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  ufEmail: 'alex.johnson@ufl.edu',
  verified: true,
  trustLevel: 'TRUSTED',
  trustScore: 85,
  rating: 4.8,
  totalSales: 12,
  responseTime: '2h'
};

const mockListings = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Excellent Condition',
    price: 650,
    status: 'PUBLISHED',
    createdAt: new Date('2024-01-15'),
    expiresAt: new Date('2024-01-29'),
    views: 45,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'
  },
  {
    id: '2',
    title: 'Calculus Textbook - 8th Edition',
    price: 120,
    status: 'DRAFT',
    createdAt: new Date('2024-01-20'),
    expiresAt: new Date('2024-02-03'),
    views: 0,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
  },
  {
    id: '3',
    title: 'Gaming Chair - Like New',
    price: 200,
    status: 'EXPIRED',
    createdAt: new Date('2023-12-01'),
    expiresAt: new Date('2023-12-15'),
    views: 23,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
  }
];

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [listings, setListings] = useState(mockListings);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'expired'>('active');

  // Check if user is verified
  const userVerified = user.verified;

  const handleRenewListing = async (listingId: string) => {
    // TODO: Implement renewal logic
    console.log('Renewing listing:', listingId);
    
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'listing_renewed', {
        event_category: 'profile',
        event_label: listingId
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    switch (activeTab) {
      case 'active':
        return listing.status === 'PUBLISHED';
      case 'draft':
        return listing.status === 'DRAFT';
      case 'expired':
        return listing.status === 'EXPIRED';
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'text-green-600 bg-green-100';
      case 'DRAFT':
        return 'text-yellow-600 bg-yellow-100';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'TRUSTED':
        return 'text-blue-600 bg-blue-100';
      case 'BASIC':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!userVerified) {
    return (
      <Layout userVerified={userVerified}>
        <Head>
          <title>Profile - GatorEx</title>
        </Head>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <AlertCircle size={64} className="mx-auto text-orange-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Your UF Email
            </h1>
            <p className="text-gray-600 mb-6">
              To access your profile and start buying/selling, please verify your UF email address.
            </p>
            <Link
              href="/verify"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center"
            >
              <Mail size={20} className="mr-2" />
              Verify Email
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userVerified={userVerified}>
      <Head>
        <title>Profile - GatorEx</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                <User size={32} className="text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{user.ufEmail}</span>
                  {user.verified && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(user.trustLevel)}`}>
                    {user.trustLevel}
                  </span>
                  <span className="text-sm text-gray-600">
                    Trust Score: {user.trustScore}/100
                  </span>
                </div>
              </div>
            </div>
            
            <button className="text-gray-400 hover:text-gray-600">
              <Edit3 size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-900">{user.rating}</span>
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{user.totalSales}</div>
              <p className="text-xs text-gray-600">Total Sales</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{user.responseTime}</div>
              <p className="text-xs text-gray-600">Avg Response</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">
                {listings.filter(l => l.status === 'PUBLISHED').length}
              </div>
              <p className="text-xs text-gray-600">Active Listings</p>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active ({listings.filter(l => l.status === 'PUBLISHED').length})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'draft'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Drafts ({listings.filter(l => l.status === 'DRAFT').length})
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'expired'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired ({listings.filter(l => l.status === 'EXPIRED').length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} listings
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'active' && "You don't have any active listings yet."}
                  {activeTab === 'draft' && "No draft listings to complete."}
                  {activeTab === 'expired' && "No expired listings to renew."}
                </p>
                {activeTab === 'active' && (
                  <Link
                    href="/sell"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Create Your First Listing
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">
                              {listing.title}
                            </h3>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ${listing.price}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>{listing.views} views</span>
                              <span>Created {listing.createdAt.toLocaleDateString()}</span>
                              {listing.status === 'PUBLISHED' && (
                                <span>Expires {listing.expiresAt.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                              {listing.status}
                            </span>
                            
                            {listing.status === 'EXPIRED' && (
                              <button
                                onClick={() => handleRenewListing(listing.id)}
                                className="text-orange-600 hover:text-orange-700 p-1"
                                title="Renew listing"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                            
                            {listing.status === 'DRAFT' && (
                              <button
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Complete listing"
                              >
                                <Edit3 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
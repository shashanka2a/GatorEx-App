import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Star, 
  Package, 
  Clock, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit3,
  Loader2
} from 'lucide-react';
import Layout from '../src/components/layout/Layout';

interface UserProfile {
  id: string;
  name: string;
  ufEmail: string;
  verified: boolean;
  profileCompleted: boolean;
  trustLevel: string;
  trustScore: number;
  rating: number;
  totalSales: number;
  responseTime: string;
  totalViews: number;
  joinedAt: string;
  listings: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    createdAt: string;
    expiresAt: string | null;
    views: number;
    image: string | null;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'expired'>('active');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      setLoading(false);
      return;
    }

    fetchUserProfile();
  }, [session, status]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData = await response.json();
      setUser(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is verified
  const userVerified = user?.verified || false;

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

  const filteredListings = user?.listings.filter(listing => {
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
  }) || [];

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

  if (loading) {
    return (
      <Layout userVerified={false}>
        <Head>
          <title>Profile - GatorEx</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
            <h1 className="text-xl font-medium text-gray-900">Loading your profile...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !session) {
    return (
      <Layout userVerified={false}>
        <Head>
          <title>Profile - GatorEx</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-xl font-medium text-gray-900 mb-4">
              {error || 'Please sign in to view your profile'}
            </h1>
            <Link
              href="/verify"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{user?.ufEmail}</span>
                  {user?.verified && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        🐊 UF Verified
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(user?.trustLevel || 'BASIC')}`}>
                    {user?.trustLevel}
                  </span>
                  <span className="text-sm text-gray-600">
                    Trust Score: {user?.trustScore}/100
                  </span>
                  <span className="text-sm text-gray-600">
                    Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ''}
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
                <span className="font-semibold text-gray-900">{user?.rating}</span>
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{user?.totalSales}</div>
              <p className="text-xs text-gray-600">Total Listings</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{user?.totalViews}</div>
              <p className="text-xs text-gray-600">Total Views</p>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">
                {user?.listings.filter(l => l.status === 'PUBLISHED').length}
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
                Active ({user?.listings.filter(l => l.status === 'PUBLISHED').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'draft'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Drafts ({user?.listings.filter(l => l.status === 'DRAFT').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'expired'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired ({user?.listings.filter(l => l.status === 'EXPIRED').length || 0})
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
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                      
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
                              <span>Created {new Date(listing.createdAt).toLocaleDateString()}</span>
                              {listing.status === 'PUBLISHED' && listing.expiresAt && (
                                <span>Expires {new Date(listing.expiresAt).toLocaleDateString()}</span>
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
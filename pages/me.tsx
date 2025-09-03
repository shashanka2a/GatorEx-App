import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  Loader2,
  Eye,
  Heart,
  DollarSign,
  Users,
  MessageSquare
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
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'expired' | 'sold'>('active');

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
      setError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/user/profile', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=60' // Cache for 1 minute
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your profile');
        }
        throw new Error('Failed to fetch profile');
      }
      
      const profileData = await response.json();
      setUser(profileData);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      }
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

  const handleMarkAsSold = async (listingId: string) => {
    if (!confirm('Are you sure you want to mark this listing as sold? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}/mark-sold`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh profile data
        fetchUserProfile();
        alert('Listing marked as sold successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to mark listing as sold');
      }
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      alert('Failed to mark listing as sold');
    }
  };

  const viewListingContacts = (listingId: string) => {
    // Navigate to contacts page for this listing
    router.push(`/listing/${listingId}/contacts`);
  };

  const filteredListings = user?.listings.filter(listing => {
    switch (activeTab) {
      case 'active':
        return listing.status === 'PUBLISHED';
      case 'draft':
        return listing.status === 'DRAFT';
      case 'expired':
        return listing.status === 'EXPIRED';
      case 'sold':
        return listing.status === 'SOLD';
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
      case 'SOLD':
        return 'text-blue-600 bg-blue-100';
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
        <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
          {/* Loading Skeleton */}
          <div className="animate-pulse">
            {/* Profile Header Skeleton */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
            
            {/* Listings Skeleton */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12">
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

        <div className="max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12">
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

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 pb-24 md:pb-8">
        {/* User Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 md:space-x-4 flex-1">
              <div className="bg-orange-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-orange-600 md:w-8 md:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
                <div className="flex items-center space-x-2 mt-1 flex-wrap">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{user?.ufEmail}</span>
                  {user?.verified && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        🐊 UF Verified
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getTrustLevelColor(user?.trustLevel || 'BASIC')}`}>
                    {user?.trustLevel}
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    Trust Score: {user?.trustScore}/100
                  </span>
                  <span className="text-xs md:text-sm text-gray-600">
                    Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href="/referrals"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                🎁 Referrals
              </Link>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit3 size={20} />
              </button>
            </div>
          </div>

          {/* Profile Completeness Meter */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(((user?.name ? 1 : 0) + (user?.ufEmail ? 1 : 0) + (user?.verified ? 1 : 0) + ((user?.listings?.length || 0) > 0 ? 1 : 0)) / 4 * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.round(((user?.name ? 1 : 0) + (user?.ufEmail ? 1 : 0) + (user?.verified ? 1 : 0) + ((user?.listings?.length || 0) > 0 ? 1 : 0)) / 4 * 100)}%` }}
              ></div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {!user?.name && <span className="text-gray-600">• Add profile picture</span>}
              {!user?.verified && <span className="text-gray-600">• Verify UF email</span>}
              {(user?.listings?.length || 0) === 0 && <span className="text-gray-600">• Create your first listing</span>}
              {user?.name && user?.verified && (user?.listings?.length || 0) > 0 && (
                <span className="text-green-600 font-medium">🎉 Profile complete!</span>
              )}
            </div>
          </div>

          {/* Key Stats - Highlighted */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-center mb-2">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span className="font-bold text-gray-900 text-lg">{user?.rating}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Rating</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="font-bold text-gray-900 mb-2 text-lg">{user?.totalSales}</div>
              <p className="text-xs text-gray-600 font-medium">Total Listings</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="font-bold text-gray-900 mb-2 text-lg">{user?.totalViews || 0}</div>
              <p className="text-xs text-gray-600 font-medium">Total Views</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="font-bold text-gray-900 mb-2 text-lg">
                {user?.listings.filter(l => l.status === 'SOLD').length}
              </div>
              <p className="text-xs text-gray-600 font-medium">Items Sold</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Link href="/favorites" className="block p-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-50 p-3 rounded-full group-hover:bg-red-100 transition-colors">
                    <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Favorites</h3>
                    <p className="text-sm text-gray-600">3 saved items</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              {/* Mini preview carousel */}
              <div className="flex space-x-2 overflow-x-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </Link>
          </div>
          
          <Link
            href="/sell"
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-all border border-orange-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-3 rounded-full group-hover:bg-orange-600 transition-colors">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Listing</h3>
                <p className="text-sm text-orange-700">Start selling today 🚀</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Listings Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 md:space-x-8 px-4 md:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-3 md:py-4 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === 'active'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active ({user?.listings.filter(l => l.status === 'PUBLISHED').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-3 md:py-4 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === 'draft'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Drafts ({user?.listings.filter(l => l.status === 'DRAFT').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`py-3 md:py-4 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === 'expired'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired ({user?.listings.filter(l => l.status === 'EXPIRED').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-3 md:py-4 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === 'sold'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sold ({user?.listings.filter(l => l.status === 'SOLD').length || 0})
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                {activeTab === 'active' && (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ready to start selling?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create your first listing and start earning! The GatorEx community is waiting to see what you have to offer.
                    </p>
                    <Link
                      href="/sell"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium inline-flex items-center"
                    >
                      <Package size={20} className="mr-2" />
                      Create Your First Listing
                    </Link>
                  </div>
                )}
                
                {activeTab === 'draft' && (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">✏️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No drafts yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Draft listings are automatically saved when you start creating a listing. Come back anytime to finish them!
                    </p>
                  </div>
                )}
                
                {activeTab === 'expired' && (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">⏰</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      All listings are fresh!
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Great job keeping your listings active! Expired listings will appear here when they need renewal.
                    </p>
                  </div>
                )}
                
                {activeTab === 'sold' && (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Your first sale awaits!
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Once you make your first sale, you'll see it here. Keep promoting your listings to increase visibility!
                    </p>
                    {user?.listings.filter(l => l.status === 'PUBLISHED').length === 0 && (
                      <Link
                        href="/sell"
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium inline-flex items-center"
                      >
                        <DollarSign size={20} className="mr-2" />
                        Start Selling Now
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-gray-300">
                    <div className="flex items-start space-x-4">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                          onClick={() => {
                            // Open image in modal or new tab
                            if (listing.image) {
                              window.open(listing.image, '_blank');
                            }
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Package size={28} className="text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors text-lg">
                              {listing.title}
                            </h3>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              ${listing.price}
                            </p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Eye size={14} />
                                <span className="font-medium">{listing.views} views</span>
                              </div>
                              <span>Created {new Date(listing.createdAt).toLocaleDateString()}</span>
                              {listing.status === 'PUBLISHED' && listing.expiresAt && (
                                <span className="text-orange-600 font-medium">
                                  Expires {new Date(listing.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(listing.status)}`}>
                              {listing.status}
                            </span>
                            
                            {/* Quick Action Buttons */}
                            <div className="flex items-center space-x-2">
                              {listing.status === 'PUBLISHED' && (
                                <>
                                  <button
                                    onClick={() => viewListingContacts(listing.id)}
                                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors flex items-center space-x-1"
                                    title="View contacts"
                                  >
                                    <Users size={12} />
                                    <span>Contacts</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
                                    }}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                    title="Share listing"
                                  >
                                    <MessageSquare size={12} />
                                    <span>Share</span>
                                  </button>
                                  <button
                                    onClick={() => router.push(`/edit-listing/${listing.id}`)}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                                    title="Edit listing"
                                  >
                                    <Edit3 size={12} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsSold(listing.id)}
                                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center space-x-1"
                                    title="Mark as sold"
                                  >
                                    <DollarSign size={12} />
                                    <span>Sold</span>
                                  </button>
                                </>
                              )}
                              
                              {listing.status === 'SOLD' && (
                                <button
                                  onClick={() => viewListingContacts(listing.id)}
                                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors flex items-center space-x-1"
                                  title="View contacts"
                                >
                                  <Users size={12} />
                                  <span>Contacts</span>
                                </button>
                              )}
                              
                              {listing.status === 'EXPIRED' && (
                                <button
                                  onClick={() => handleRenewListing(listing.id)}
                                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors flex items-center space-x-1"
                                  title="Renew listing"
                                >
                                  <RefreshCw size={12} />
                                  <span>Renew</span>
                                </button>
                              )}
                              
                              {listing.status === 'DRAFT' && (
                                <button
                                  onClick={() => router.push('/sell')}
                                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                  title="Complete listing"
                                >
                                  <Edit3 size={12} />
                                  <span>Complete</span>
                                </button>
                              )}
                            </div>
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
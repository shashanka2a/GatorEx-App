import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { checkClientAuthAndTerms } from '../src/lib/auth/terms-check';
import { 
  User, 
  Mail, 
  Star, 
  Package, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit3,
  Loader2,
  Eye,
  Heart,
  DollarSign,
  Users,
  MessageSquare,
  X,
  Save,
  QrCode,
  CreditCard,
  Copy,
  Share2,
  Shield,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import Layout from '../src/components/layout/Layout';

interface UserProfile {
  id: string;
  name: string;
  phoneNumber?: string;
  ufEmail: string;
  verified: boolean;
  profileCompleted: boolean;
  trustLevel: string;
  trustScore: number;
  venmoId?: string;
  cashappId?: string;
  zelleId?: string;
  paymentQrCode?: string;
  preferredPaymentMethod?: string;
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
  favorites?: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'expired' | 'sold'>('active');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: '',
    venmoId: '',
    cashappId: '',
    zelleId: '',
    paymentQrCode: '',
    preferredPaymentMethod: 'venmo'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      const result = await checkClientAuthAndTerms();
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      
      // If we get here, user is fully authenticated
      fetchUserProfile();
    };
    
    checkAuth();
  }, [status, router]);

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
      
      // Initialize edit form with current data
      setEditForm({
        name: profileData.name || '',
        phoneNumber: profileData.phoneNumber || '',
        venmoId: profileData.venmoId || '',
        cashappId: profileData.cashappId || '',
        zelleId: profileData.zelleId || '',
        paymentQrCode: profileData.paymentQrCode || '',
        preferredPaymentMethod: profileData.preferredPaymentMethod || 'venmo'
      });
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

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Refresh profile data
      await fetchUserProfile();
      setShowEditModal(false);
      setShowPaymentModal(false);
      
      // Show success message (you could add a toast notification here)
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
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

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-8">
        {/* Personalized Header */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Hey, {user?.name?.split(' ')[0] || 'Gator'}! 👋</h1>
                  <p className="text-orange-100 text-sm">Welcome back to your marketplace</p>
                </div>
              </div>
              <button 
                onClick={handleEditProfile}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors"
                title="Edit Profile"
              >
                <Edit3 size={20} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-orange-200" />
                <span className="text-orange-100">{user?.ufEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-orange-200" />
                <span className="text-orange-100">
                  Since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Stats & Verification Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Overview</h2>
            <Link
              href="/referrals"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              🎁 Referrals
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Strength</span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(((user?.name ? 1 : 0) + (user?.verified ? 2 : 0) + ((user?.listings?.length || 0) > 0 ? 1 : 0) + ((user?.trustScore || 0) > 50 ? 1 : 0)) / 5 * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${Math.round(((user?.name ? 1 : 0) + (user?.verified ? 2 : 0) + ((user?.listings?.length || 0) > 0 ? 1 : 0) + ((user?.trustScore || 0) > 50 ? 1 : 0)) / 5 * 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                {user?.verified ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertCircle size={14} className="text-orange-500" />
                )}
                <span className={user?.verified ? "text-green-600" : "text-orange-600"}>
                  {user?.verified ? "UF Verified" : "Verification Pending"}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(user?.trustLevel || 'BASIC')}`}>
                {user?.trustLevel} • {user?.trustScore}/100
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-center mb-2">
                <Star size={18} className="text-yellow-500 mr-1" />
                <span className="font-bold text-gray-900 text-xl">{user?.rating}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Rating</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <Package size={18} className="text-green-500 mr-1" />
                <span className="font-bold text-gray-900 text-xl">{user?.totalSales}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Listings</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <Eye size={18} className="text-blue-500 mr-1" />
                <span className="font-bold text-gray-900 text-xl">{user?.totalViews || 0}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Views</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <DollarSign size={18} className="text-purple-500 mr-1" />
                <span className="font-bold text-gray-900 text-xl">
                  {user?.listings.filter(l => l.status === 'SOLD').length}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Sold</p>
            </div>
          </div>
        </div>

        {/* Payment Wallet & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Payment Wallet */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Payment Wallet</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.id}`);
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Copy profile link"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${user?.name}'s GatorEx Profile`,
                        url: `${window.location.origin}/profile/${user?.id}`
                      });
                    }
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Share profile"
                >
                  <Share2 size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* QR Code Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                <div className="bg-white p-3 rounded-lg inline-block mb-3 shadow-sm">
                  <QrCode size={48} className="text-gray-700" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Quick Profile Share</p>
                <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors">
                  Generate QR
                </button>
              </div>
              
              {/* Payment Methods */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Payment Methods</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
                
                {/* Show configured payment methods */}
                {user?.venmoId && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">V</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Venmo</p>
                        <p className="text-xs text-gray-600">@{user.venmoId}</p>
                      </div>
                    </div>
                    {user.preferredPaymentMethod === 'venmo' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                )}
                
                {user?.cashappId && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">$</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">CashApp</p>
                        <p className="text-xs text-gray-600">${user.cashappId}</p>
                      </div>
                    </div>
                    {user.preferredPaymentMethod === 'cashapp' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                )}
                
                {user?.zelleId && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Z</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Zelle</p>
                        <p className="text-xs text-gray-600">{user.zelleId}</p>
                      </div>
                    </div>
                    {user.preferredPaymentMethod === 'zelle' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                )}
                
                {!user?.venmoId && !user?.cashappId && !user?.zelleId && (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add Payment Method
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Favorites & Create Listing */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <Link href="/favorites" className="block p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
                      <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Favorites</h3>
                      <p className="text-sm text-gray-600">{user?.favorites?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {user?.favorites && user.favorites.length > 0 ? (
                    user.favorites.slice(0, 4).map((favorite, index) => (
                      <div key={favorite.id || index} className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                        {favorite.image ? (
                          <img src={favorite.image} alt={favorite.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package size={14} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 3 }, (_, i) => (
                      <div key={`placeholder-${i}`} className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Heart size={12} className="text-gray-300" />
                      </div>
                    ))
                  )}
                </div>
              </Link>
            </div>
            
            <Link
              href="/sell"
              className="block bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all text-white group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Create Listing</h3>
                  <p className="text-sm text-orange-100">Start selling today 🚀</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Listings Section - Compressed */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-6 px-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'active'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>Active</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {user?.listings.filter(l => l.status === 'PUBLISHED').length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'draft'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Edit3 size={16} />
                  <span>Drafts</span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {user?.listings.filter(l => l.status === 'DRAFT').length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'expired'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>Expired</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {user?.listings.filter(l => l.status === 'EXPIRED').length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'sold'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Sold</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {user?.listings.filter(l => l.status === 'SOLD').length || 0}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredListings.length === 0 ? (
              <div className="text-center py-8">
                {activeTab === 'active' && (
                  <div>
                    <div className="text-4xl mb-3">🚀</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start selling?</h3>
                    <p className="text-gray-600 mb-4 text-sm">Create your first listing and start earning!</p>
                    <Link
                      href="/sell"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium inline-flex items-center text-sm"
                    >
                      <Package size={16} className="mr-2" />
                      Create Listing
                    </Link>
                  </div>
                )}
                
                {activeTab === 'draft' && (
                  <div>
                    <div className="text-4xl mb-3">✏️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No drafts yet</h3>
                    <p className="text-gray-600 text-sm">Drafts are automatically saved when you create listings.</p>
                  </div>
                )}
                
                {activeTab === 'expired' && (
                  <div>
                    <div className="text-4xl mb-3">⏰</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All listings are fresh!</h3>
                    <p className="text-gray-600 text-sm">Great job keeping your listings active!</p>
                  </div>
                )}
                
                {activeTab === 'sold' && (
                  <div>
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your first sale awaits!</h3>
                    <p className="text-gray-600 text-sm">Keep promoting your listings to increase visibility!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-gray-300">
                    <div className="flex items-start space-x-4">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                          onClick={() => {
                            if (listing.image) {
                              window.open(listing.image, '_blank');
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                              {listing.title}
                            </h3>
                            <p className="text-lg font-bold text-green-600">${listing.price}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                              {listing.status}
                            </span>
                            {listing.status === 'PUBLISHED' && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Eye size={12} />
                                <span>{listing.views}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                            {listing.status === 'PUBLISHED' && listing.expiresAt && (
                              <span className="text-orange-600">
                                Expires {new Date(listing.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {listing.status === 'PUBLISHED' && (
                              <>
                                <button
                                  onClick={() => viewListingContacts(listing.id)}
                                  className="p-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                  title="View contacts"
                                >
                                  <Users size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
                                  }}
                                  className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                  title="Share listing"
                                >
                                  <Share2 size={12} />
                                </button>
                                <button
                                  onClick={() => router.push(`/edit-listing/${listing.id}`)}
                                  className="p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  title="Edit listing"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleMarkAsSold(listing.id)}
                                  className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                  title="Mark as sold"
                                >
                                  <DollarSign size={12} />
                                </button>
                              </>
                            )}
                            
                            {listing.status === 'SOLD' && (
                              <button
                                onClick={() => viewListingContacts(listing.id)}
                                className="p-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                title="View contacts"
                              >
                                <Users size={12} />
                              </button>
                            )}
                            
                            {listing.status === 'EXPIRED' && (
                              <button
                                onClick={() => handleRenewListing(listing.id)}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium hover:bg-orange-200 transition-colors"
                                title="Renew listing"
                              >
                                Renew
                              </button>
                            )}
                            
                            {listing.status === 'DRAFT' && (
                              <button
                                onClick={() => router.push('/sell')}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                                title="Complete listing"
                              >
                                Complete
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your UF email cannot be changed as it's used for verification.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Preferred Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Payment Method
                </label>
                <select
                  value={editForm.preferredPaymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, preferredPaymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="venmo">Venmo</option>
                  <option value="cashapp">CashApp</option>
                  <option value="zelle">Zelle</option>
                </select>
              </div>

              {/* Venmo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <span>Venmo Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={editForm.venmoId}
                  onChange={(e) => setEditForm({ ...editForm, venmoId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="@username (without @)"
                />
              </div>
              
              {/* CashApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span>CashApp Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={editForm.cashappId}
                  onChange={(e) => setEditForm({ ...editForm, cashappId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="username (without $)"
                />
              </div>
              
              {/* Zelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span>Zelle Email/Phone</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={editForm.zelleId}
                  onChange={(e) => setEditForm({ ...editForm, zelleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com or phone number"
                />
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center space-x-2">
                    <QrCode size={16} className="text-gray-600" />
                    <span>Payment QR Code (Optional)</span>
                  </div>
                </label>
                <textarea
                  value={editForm.paymentQrCode}
                  onChange={(e) => setEditForm({ ...editForm, paymentQrCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste QR code data or payment link here"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can paste a payment QR code data or direct payment link here
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Adding multiple payment methods gives buyers more options and can increase your sales!
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Payment Methods
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
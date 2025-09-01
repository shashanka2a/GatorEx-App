import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Layout from '../../src/components/layout/Layout';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  meetingSpot: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  userId: string;
  images: Array<{ url: string }>;
}

export default function EditListingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchListing = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/listings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
      } else {
        setError('Listing not found');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && session) {
      fetchListing();
    }
  }, [id, session, fetchListing]);

  const handleSave = async () => {
    if (!listing) return;
    
    setSaving(true);
    try {
      // Only send the fields that can be updated
      const updateData = {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        meetingSpot: listing.meetingSpot
      };

      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        router.push('/me');
      } else {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        setError(errorData.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving listing:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/me');
      } else {
        setError('Failed to delete listing');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <Layout userVerified={!!session?.user}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p>Loading listing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout userVerified={!!session?.user}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Listing not found'}
            </h1>
            <button
              onClick={() => router.push('/me')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Profile
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userVerified={!!session?.user}>
      <Head>
        <title>Edit Listing - GatorEx</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/me')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="mr-2 inline" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <Save size={16} className="mr-2 inline" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={listing?.title || ''}
              onChange={(e) => listing && setListing({...listing, title: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              value={listing?.price || ''}
              onChange={(e) => listing && setListing({...listing, price: parseFloat(e.target.value)})}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={listing?.description || ''}
              onChange={(e) => listing && setListing({...listing, description: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={listing?.category || ''}
                onChange={(e) => listing && setListing({...listing, category: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="textbooks">Textbooks</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={listing?.condition || ''}
                onChange={(e) => listing && setListing({...listing, condition: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Spot
            </label>
            <input
              type="text"
              value={listing?.meetingSpot || ''}
              onChange={(e) => listing && setListing({...listing, meetingSpot: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Reitz Union, Library West"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
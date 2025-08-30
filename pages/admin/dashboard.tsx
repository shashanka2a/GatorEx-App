import { useState, useEffect } from 'react';
import { Card } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';

interface DashboardStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  shadowBannedListings: number;
  verifiedUsers: number;
  totalUsers: number;
  trustedUsers: number;
  shadowBannedUsers: number;
  recentListings: any[];
  moderationStats: {
    blockedToday: number;
    spamAttempts: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="p-8">Error loading dashboard</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">WhatsApp Listings Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Published</h3>
          <p className="text-3xl font-bold text-green-600">{stats.publishedListings}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.draftListings}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Shadow Banned</h3>
          <p className="text-3xl font-bold text-red-600">{stats.shadowBannedListings}</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Verified Users</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.verifiedUsers}/{stats.totalUsers}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Trusted Users</h3>
          <p className="text-3xl font-bold text-green-600">{stats.trustedUsers}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Banned Users</h3>
          <p className="text-3xl font-bold text-red-600">{stats.shadowBannedUsers}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Blocked Today</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.moderationStats.blockedToday}</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
        <div className="space-y-4">
          {stats.recentListings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">{listing.title}</h3>
                <p className="text-sm text-gray-500">
                  {listing.price ? `$${listing.price}` : 'DM for price'} • {listing.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  listing.status === 'PUBLISHED' ? 'default' :
                  listing.status === 'DRAFT' ? 'secondary' : 'destructive'
                }>
                  {listing.status}
                </Badge>
                {listing.user?.verified && (
                  <Badge variant="outline" className="text-green-600">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
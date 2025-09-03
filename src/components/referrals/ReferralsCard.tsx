import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface ReferralSummary {
  clicks: number;
  verified: number;
  earned: number;
  referralCode: string;
  nextTier: {
    refs: number;
    reward: {
      description: string;
    };
  } | null;
}

export default function ReferralsCard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    
    fetchSummary();
  }, [session]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/referrals/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded mb-2"></div>
        <div className="h-4 bg-white/20 rounded mb-4 w-3/4"></div>
        <div className="h-10 bg-white/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">🎁 Earn Rewards</h3>
          <p className="text-purple-100 text-sm">Refer friends and get paid!</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{summary?.verified || 0}</div>
          <div className="text-xs text-purple-100">Referrals</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold">${((summary?.earned || 0) / 100).toFixed(0)}</div>
          <div className="text-xs text-purple-100">Earned</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold">{summary?.clicks || 0}</div>
          <div className="text-xs text-purple-100">Clicks</div>
        </div>
      </div>

      {summary?.nextTier && (
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <div className="text-sm text-purple-100 mb-1">Next Reward:</div>
          <div className="font-semibold text-sm">{summary.nextTier.reward.description}</div>
          <div className="text-xs text-purple-100">
            {summary.nextTier.refs - summary.verified} more referrals needed
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/referrals')}
        className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
      >
        View Referrals Dashboard
      </button>
    </div>
  );
}
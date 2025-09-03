import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AchievementBadges from './AchievementBadges';
import StickyReferralBar from './StickyReferralBar';
import SuccessStories from './SuccessStories';
import { REFERRAL_CONFIG } from '../../lib/referrals/config';
import WebNav from '../navigation/WebNav';
import MobileNav from '../navigation/MobileNav';

interface ReferralSummary {
  clicks: number;
  verified: number;
  earned: number;
  thisWeekPoints: number;
  referralCode: string;
  referralLink: string;
  nextTier: {
    refs: number;
    reward: {
      type: string;
      amount_cents: number;
      description: string;
    };
  } | null;
}

interface LeaderboardEntry {
  rank: number;
  points: number;
  email: string;
}

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-float opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    ))}
  </div>
);

// Confetti component for celebrations
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 3}s`
          }}
        >
          <div className="w-2 h-2 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

// Recent activity component
const RecentActivity = () => {
  const activities = [
    { name: 'Sarah M.', action: 'earned $15', time: '2 min ago' },
    { name: 'Mike K.', action: 'joined via referral', time: '5 min ago' },
    { name: 'Emma L.', action: 'earned $5', time: '12 min ago' },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full mr-2"></span>
        Live Activity
      </h3>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between text-sm text-white/80">
            <span>{activity.name} {activity.action}</span>
            <span className="text-xs text-white/60">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced reward card with hover effects and brand styling
const RewardCard = ({ 
  icon, 
  title, 
  description, 
  refs, 
  bgColor, 
  iconBg, 
  textColor,
  achieved = false 
}: {
  icon: string;
  title: string;
  description: string;
  refs: number;
  bgColor: string;
  iconBg: string;
  textColor: string;
  achieved?: boolean;
}) => {
  // Special styling for brand cards
  const getBrandStyling = (title: string) => {
    if (title.includes('Amazon')) {
      return {
        bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50',
        iconBg: 'bg-gradient-to-r from-orange-500 to-yellow-600',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      };
    }
    if (title.includes('Best Buy')) {
      return {
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        iconBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      };
    }
    if (title.includes('ChatGPT')) {
      return {
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        iconBg: 'bg-gradient-to-r from-green-600 to-emerald-600',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      };
    }
    if (title.includes('iPhone')) {
      return {
        bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
        iconBg: 'bg-gradient-to-r from-gray-800 to-slate-800',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800'
      };
    }
    if (title.includes('AirPods')) {
      return {
        bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
        iconBg: 'bg-gradient-to-r from-gray-600 to-slate-600',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-700'
      };
    }
    if (title.includes('Marketing Lead')) {
      return {
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
        iconBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      };
    }
    return {
      bgColor,
      iconBg,
      borderColor: 'border-gray-200',
      textColor
    };
  };

  const brandStyle = getBrandStyling(title);

  return (
    <div className={`${brandStyle.bgColor} border ${brandStyle.borderColor} rounded-xl p-4 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-xl ${achieved ? 'ring-2 ring-green-400 shadow-lg' : ''}`}>
      {achieved && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        </div>
      )}
      
      <div className={`w-14 h-14 ${brandStyle.iconBg} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
        <span className="text-white text-xl">{icon}</span>
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-1 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{description}</p>
      <div className={`${brandStyle.textColor} font-bold text-sm bg-white/50 rounded-full px-3 py-1 inline-block`}>
        {refs} referrals
      </div>
      
      {/* Brand-specific decorative elements */}
      {title.includes('Amazon') && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-orange-300 rounded-full opacity-20"></div>
      )}
      {title.includes('Best Buy') && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-blue-300 rounded-full opacity-20"></div>
      )}
      {title.includes('ChatGPT') && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-green-300 rounded-full opacity-20"></div>
      )}
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Achievement glow effect */}
      {achieved && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-xl"></div>
      )}
    </div>
  );
};

// Progress bar with animation
const AnimatedProgressBar = ({ progress, className = "" }: { progress: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-3 overflow-hidden ${className}`}>
    <div 
      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
      style={{ width: `${Math.min(progress, 100)}%` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
    </div>
  </div>
);

export default function EnhancedReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalUsers] = useState(257); // Mock data - replace with real API

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [summaryRes, leaderboardRes] = await Promise.all([
        fetch('/api/referrals/summary'),
        fetch('/api/referrals/leaderboard?period=week')
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!summary?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(summary.referralLink);
      setCopied(true);
      setShowConfetti(true);
      
      setTimeout(() => {
        setCopied(false);
        setShowConfetti(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    if (!summary?.referralLink) return;
    
    const text = "Check out GatorEx - the best marketplace for students!";
    const url = summary.referralLink;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      instagram: url, // Instagram doesn't support direct sharing, just copy link
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };
    
    if (platform === 'native' && navigator.share) {
      navigator.share({ title: 'Join GatorEx', text, url });
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  if (status === 'loading' || (session && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-red-500 flex items-center justify-center">
        <div className="text-white text-xl flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          Loading...
        </div>
      </div>
    );
  }

  const progressPercentage = summary?.nextTier ? 
    (summary.verified / summary.nextTier.refs) * 100 : 100;

  return (
    <>
      <Head>
        <title>Refer Friends, Earn Rewards - GatorEx</title>
        <meta name="description" content="Share GatorEx with your friends and earn amazing rewards. The more you refer, the more you earn!" />
      </Head>

      {/* Navigation */}
      <WebNav userVerified={!!session} />
      <MobileNav userVerified={!!session} />

      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-red-500 relative overflow-hidden pt-16 md:pt-0">
        <FloatingParticles />
        <Confetti show={showConfetti} />

        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 pb-24 md:pb-8">
          {/* Hero Section with Social Proof */}
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Refer Friends, Earn Rewards
            </h1>
            <p className="text-xl opacity-90 mb-4">
              Share GatorEx with your friends and earn amazing rewards. The more you refer, the more you earn!
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-80">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span>Join {totalUsers.toLocaleString()} students earning rewards</span>
              </div>
            </div>
          </div>

          {/* Enhanced Rewards Tiers */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Unlock Amazing Rewards
            </h2>
            <p className="text-gray-600 text-center mb-6">
              See what you can earn as you build your referral network
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {REFERRAL_CONFIG.tiers.map((tier, index) => {
                const getRewardIcon = (description: string) => {
                  if (description.includes('Amazon')) return '🎁';
                  if (description.includes('Best Buy') && description.includes('Gift Card')) return '🛒';
                  if (description.includes('ChatGPT')) return '🤖';
                  if (description.includes('Totaltech')) return '⭐';
                  if (description.includes('AirPods')) return '🎧';
                  if (description.includes('iPhone')) return '📱';
                  if (description.includes('Marketing Lead')) return '🏢';
                  return '🎁';
                };

                const getRewardDetails = (description: string) => {
                  if (description.includes('$10 Amazon')) {
                    return {
                      bgColor: 'bg-orange-50',
                      iconBg: 'bg-orange-500',
                      textColor: 'text-orange-600',
                      desc: 'Gift card reward'
                    };
                  }
                  if (description.includes('$25 Amazon')) {
                    return {
                      bgColor: 'bg-orange-50',
                      iconBg: 'bg-orange-600',
                      textColor: 'text-orange-600',
                      desc: 'Gift card reward'
                    };
                  }
                  if (description.includes('ChatGPT')) {
                    return {
                      bgColor: 'bg-green-50',
                      iconBg: 'bg-green-600',
                      textColor: 'text-green-600',
                      desc: 'Subscription service'
                    };
                  }
                  if (description.includes('$100 Best Buy')) {
                    return {
                      bgColor: 'bg-blue-50',
                      iconBg: 'bg-blue-600',
                      textColor: 'text-blue-600',
                      desc: 'Gift card reward'
                    };
                  }
                  if (description.includes('Totaltech')) {
                    return {
                      bgColor: 'bg-blue-50',
                      iconBg: 'bg-blue-700',
                      textColor: 'text-blue-700',
                      desc: 'Subscription service'
                    };
                  }
                  if (description.includes('AirPods')) {
                    return {
                      bgColor: 'bg-gray-50',
                      iconBg: 'bg-gray-600',
                      textColor: 'text-gray-700',
                      desc: 'Premium tech reward'
                    };
                  }
                  if (description.includes('iPhone')) {
                    return {
                      bgColor: 'bg-gray-50',
                      iconBg: 'bg-gray-800',
                      textColor: 'text-gray-800',
                      desc: 'Premium tech reward'
                    };
                  }
                  if (description.includes('Marketing Lead')) {
                    return {
                      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
                      iconBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
                      textColor: 'text-purple-700',
                      desc: 'Company equity reward'
                    };
                  }
                  return {
                    bgColor: 'bg-gray-50',
                    iconBg: 'bg-gray-500',
                    textColor: 'text-gray-600',
                    desc: 'Reward'
                  };
                };

                const rewardDetails = getRewardDetails(tier.reward.description);
                
                return (
                  <RewardCard
                    key={index}
                    icon={getRewardIcon(tier.reward.description)}
                    title={tier.reward.description}
                    description={rewardDetails.desc}
                    refs={tier.refs}
                    bgColor={rewardDetails.bgColor}
                    iconBg={rewardDetails.iconBg}
                    textColor={rewardDetails.textColor}
                    achieved={session && summary ? summary.verified >= tier.refs : false}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {/* {session && <RecentActivity />} */}

          {/* Success Stories */}
          {/* <SuccessStories /> */}

          {/* Referral Link Section */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Start Earning Now!
            </h2>
            <p className="text-gray-600 mb-4">
              Share your unique link and get rewarded for every successful referral
            </p>
            
            {session ? (
              summary ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="text"
                      value={summary.referralLink}
                      readOnly
                      className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={copyReferralLink}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                        copied 
                          ? 'bg-green-500 text-white scale-105' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {copied ? (
                        <span className="flex items-center">
                          <span className="mr-2">✓</span>
                          Copied!
                        </span>
                      ) : 'Copy'}
                    </button>
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => shareToSocial('twitter')}
                      className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      🐦 Twitter
                    </button>
                    <button
                      onClick={() => shareToSocial('facebook')}
                      className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors"
                    >
                      📘 Facebook
                    </button>
                    <button
                      onClick={() => shareToSocial('whatsapp')}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={() => shareToSocial('native')}
                      className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                    >
                      📱 More
                    </button>
                  </div>
                  
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="mr-2">🎯</span>
                    Start earning $5 per successful referral
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <span className="text-orange-600 text-2xl">🔗</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Generate Your Referral Link</h3>
                    <p className="text-gray-600 mb-6">
                      Click below to generate your unique referral link and start earning rewards
                    </p>
                  </div>
                  
                  <button
                    onClick={fetchData}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Generate My Referral Link
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    🎯 Earn $5 for every successful referral
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <span className="text-orange-600 text-2xl">🔗</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Your Referral Link</h3>
                  <p className="text-gray-600 mb-6">
                    Sign in with your UF email to generate your unique referral link and start earning rewards
                  </p>
                </div>
                
                <button
                  onClick={() => router.push('/login-otp')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign In to Get Started
                </button>
                
                <p className="text-sm text-gray-500 mt-4">
                  🎯 Earn $5 for every successful referral
                </p>
              </div>
            )}
          </div>

          {/* Progress Section with Animation */}
          {session && summary && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-orange-500 text-xl animate-pulse">🏆</span>
                <h2 className="text-xl font-semibold text-gray-800 ml-2">
                  Your Progress to Next Reward
                </h2>
              </div>
              <p className="text-center text-gray-600 mb-6">
                Just {summary.nextTier ? summary.nextTier.refs - summary.verified : 0} more referrals to unlock your next reward
              </p>

              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <div className="group">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-blue-600 font-bold text-xl">{summary.verified}</span>
                  </div>
                  <p className="text-sm text-gray-600">Friends</p>
                  <p className="text-xs text-gray-500">Progress to GatorEx Voucher</p>
                </div>
                
                <div className="group">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-orange-600 font-bold text-xl">${(summary.earned / 100).toFixed(0)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Earned</p>
                </div>
                
                <div className="group">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-purple-600 font-bold text-xl">{summary.nextTier?.refs || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">Next Milestone</p>
                  <p className="text-xs text-orange-500">Get {summary.nextTier?.reward.description}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{summary.verified}/{summary.nextTier?.refs || 0}</span>
                </div>
                <AnimatedProgressBar progress={progressPercentage} />
              </div>
            </div>
          )}



          {/* Performance Stats with Animations */}
          {session && summary && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
                Your Referral Performance
              </h2>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="group">
                  <div className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {summary.clicks}
                  </div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {summary.verified > 0 ? Math.round((summary.verified / summary.clicks) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {summary.thisWeekPoints}
                  </div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Badges */}
          {session && summary && (
            <AchievementBadges 
              referrals={summary.verified}
              clicks={summary.clicks}
              streak={0} // You can implement streak tracking later
            />
          )}

          {/* Enhanced Leaderboard */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <span className="text-2xl mr-2 animate-pulse">👑</span>
              <h2 className="text-xl font-semibold text-gray-800">Community Leaderboard</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">
              See how you stack up against other GatorEx referrers
            </p>

            {session && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300 ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{entry.email}</div>
                        <div className="text-sm text-gray-500">{entry.points} referrals</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-500">${entry.points * 5}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">👑</span>
                </div>
                <p className="text-gray-500 mb-4">
                  {session ? 'No leaderboard data available yet' : 'Sign in to see the community leaderboard'}
                </p>
                {!session && (
                  <button
                    onClick={() => router.push('/login-otp')}
                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Sign In to View Rankings
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Enhanced CTA Section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Ready to Maximize Your Earnings?</h2>
              <p className="text-lg opacity-90 mb-6">
                Your network is your net worth. Start sharing today and turn your connections into cash!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session ? (
                  <>
                    <button
                      onClick={copyReferralLink}
                      className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      📱 Share on Social Media
                    </button>
                    <button
                      onClick={() => router.push('/me')}
                      className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                    >
                      📊 View Referral History
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login-otp')}
                      className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      📱 Get Started Now
                    </button>
                    <button
                      onClick={() => router.push('/buy')}
                      className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                    >
                      🛍️ Browse Marketplace
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm opacity-75 mt-4">
                🔒 Secure • Terms and conditions apply to all referral programs
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Referral Bar for Mobile */}
        <StickyReferralBar referralLink={summary?.referralLink} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-confetti {
          animation: confetti 3s linear forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </>
  );
}
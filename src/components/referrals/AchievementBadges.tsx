import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  referrals: number;
  clicks: number;
  streak?: number;
}

export default function AchievementBadges({ referrals, clicks, streak = 0 }: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);


  useEffect(() => {
    const achievementList: Achievement[] = [
      {
        id: 'first_referral',
        title: 'First Steps',
        description: 'Get your first referral',
        icon: '🎯',
        unlocked: referrals >= 1,
        progress: Math.min(referrals, 1),
        maxProgress: 1
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Share your link 10 times',
        icon: '🦋',
        unlocked: clicks >= 10,
        progress: Math.min(clicks, 10),
        maxProgress: 10
      },
      {
        id: 'amazon_shopper',
        title: 'Amazon Shopper',
        description: 'Unlock your first Amazon gift card',
        icon: '🛒',
        unlocked: referrals >= 3,
        progress: Math.min(referrals, 3),
        maxProgress: 3
      },
      {
        id: 'tech_enthusiast',
        title: 'Tech Enthusiast',
        description: 'Earn Best Buy gift card',
        icon: '💻',
        unlocked: referrals >= 8,
        progress: Math.min(referrals, 8),
        maxProgress: 8
      },
      {
        id: 'ai_pioneer',
        title: 'AI Pioneer',
        description: 'Unlock ChatGPT Pro subscription',
        icon: '🤖',
        unlocked: referrals >= 15,
        progress: Math.min(referrals, 15),
        maxProgress: 15
      },
      {
        id: 'influencer',
        title: 'Campus Influencer',
        description: 'Reach 25 successful referrals',
        icon: '⭐',
        unlocked: referrals >= 25,
        progress: Math.min(referrals, 25),
        maxProgress: 25
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Share for 7 days straight',
        icon: '🔥',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: 'gator_legend',
        title: 'Gator Legend',
        description: 'Get 100 successful referrals',
        icon: '🏆',
        unlocked: referrals >= 100,
        progress: Math.min(referrals, 100),
        maxProgress: 100
      }
    ];



    setAchievements(achievementList);
  }, [referrals, clicks, streak, achievements]);

  return (
    <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-6 flex items-center justify-center">
        <span className="mr-2">🏅</span>
        Your Achievements
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'border-yellow-300 bg-yellow-50 shadow-md'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {achievement.unlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}

            <div className="text-center">
              <div className={`text-3xl mb-2 ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${
                achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-xs mb-2 ${
                achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>

              {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
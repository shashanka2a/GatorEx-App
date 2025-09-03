import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface StickyReferralBarProps {
  referralLink?: string;
}

export default function StickyReferralBar({ referralLink }: StickyReferralBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Show the bar only on referrals page and if user is signed in
    if (router.pathname === '/referrals' && session && referralLink) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [router.pathname, session, referralLink]);

  const copyLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareNative = () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join GatorEx',
        text: 'Check out GatorEx - the best marketplace for students!',
        url: referralLink
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Your Referral Link</p>
          <p className="text-xs text-gray-500 truncate">{referralLink}</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={copyLink}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {copied ? '✓' : 'Copy'}
          </button>
          
          <button
            onClick={shareNative}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
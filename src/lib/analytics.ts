// Analytics utility for tracking user interactions
export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: properties?.category || 'general',
        event_label: properties?.label,
        value: properties?.value,
        ...properties
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, properties);
    }

    // Add other analytics providers here (Mixpanel, Amplitude, etc.)
  },

  // Specific tracking methods
  trackTabSwitch: (tab: string, source: 'mobile' | 'web' = 'mobile') => {
    analytics.track('tab_switch', {
      category: 'navigation',
      label: tab,
      source
    });
  },

  trackSellCTA: (source: string) => {
    analytics.track('sell_cta_click', {
      category: 'selling',
      label: source
    });
  },

  trackContactSeller: (listingId: string) => {
    analytics.track('contact_seller', {
      category: 'listings',
      label: listingId
    });
  },

  trackSearch: (query: string, resultsCount: number) => {
    analytics.track('search', {
      category: 'discovery',
      label: query,
      value: resultsCount
    });
  },

  trackListingView: (listingId: string) => {
    analytics.track('listing_view', {
      category: 'listings',
      label: listingId
    });
  },

  trackEmailVerification: (step: 'requested' | 'completed') => {
    analytics.track('email_verification', {
      category: 'auth',
      label: step
    });
  },

  trackWaitlistSignup: (feature: string) => {
    analytics.track('waitlist_signup', {
      category: 'engagement',
      label: feature
    });
  }
};

// Initialize analytics
export const initAnalytics = () => {
  // Google Analytics initialization would go here
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_title: 'GatorEx',
      page_location: window.location.href
    });
  }
};
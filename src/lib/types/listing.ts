export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  images?: string[];
  buttons?: Array<{
    text: string;
    value: string;
  }>;
}

export interface ListingDraft {
  title: string;
  price: number | null;
  images: string[];
  category: string;
  condition: string;
  meetingSpot: string;
  description: string;
}

export interface UserStats {
  dailyListings: number;
  totalLiveListings: number;
  canCreateListing: boolean;
  rateLimitMessage?: string;
}

export interface DraftResumeData {
  draft: ListingDraft;
  step: number;
  messages: Message[];
  sessionId: string;
  lastSaved: string;
  completionPercentage: number;
}
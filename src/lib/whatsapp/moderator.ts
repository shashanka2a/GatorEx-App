import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ModerationResult {
  allowed: boolean;
  reason?: string;
  category?: string;
}

// Restricted items and keywords
const RESTRICTED_ITEMS = {
  weapons: ['gun', 'knife', 'weapon', 'firearm', 'ammunition', 'sword', 'blade'],
  alcohol: ['beer', 'wine', 'vodka', 'whiskey', 'alcohol', 'liquor', 'drinks'],
  drugs: ['weed', 'marijuana', 'pills', 'drugs', 'prescription', 'adderall', 'xanax'],
  fake_docs: ['fake id', 'diploma', 'transcript', 'certificate', 'degree'],
  academic_dishonesty: ['essay writing', 'homework help', 'test answers', 'cheat'],
  adult: ['escort', 'massage', 'adult services'],
  animals: ['puppy', 'kitten', 'pet sale', 'animal'],
  illegal: ['stolen', 'counterfeit', 'replica', 'knock off']
};

const SUSPICIOUS_PATTERNS = [
  /cash\s*only/i,
  /no\s*questions\s*asked/i,
  /quick\s*sale/i,
  /must\s*sell\s*today/i,
  /urgent/i
];

export async function moderateContent(listingData: any): Promise<ModerationResult> {
  const content = `${listingData.title || ''} ${listingData.description || ''}`.toLowerCase();
  
  // Check restricted items
  for (const [category, keywords] of Object.entries(RESTRICTED_ITEMS)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        return {
          allowed: false,
          reason: 'restricted_item',
          category
        };
      }
    }
  }
  
  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        allowed: false,
        reason: 'suspicious_pattern',
        category: 'suspicious'
      };
    }
  }
  
  // Check for extremely low prices (potential scam)
  if (listingData.price && listingData.price < 5) {
    return {
      allowed: false,
      reason: 'suspicious_price',
      category: 'scam'
    };
  }
  
  return { allowed: true };
}

export async function recordSpamAttempt(userId: string, reason: string) {
  // Log spam attempt since spamAttempts field doesn't exist in current schema
  console.log(`Spam attempt recorded for user ${userId}: ${reason}`);
  
  // In a real implementation, you'd want to add a spamAttempts field to the User model
  // or create a separate SpamAttempt model to track this
}

export function getModerationMessage(reason: string, category?: string): string {
  switch (reason) {
    case 'restricted_item':
      return getRestrictedItemMessage(category);
    case 'suspicious_pattern':
      return "🚫 This listing contains suspicious content. Please review our community guidelines.";
    case 'suspicious_price':
      return "🤔 That price seems too low. Please double-check your listing for accuracy.";
    default:
      return "🚫 This content cannot be posted. Please check our community guidelines.";
  }
}

function getRestrictedItemMessage(category?: string): string {
  switch (category) {
    case 'weapons':
      return "🚫 Weapons and dangerous items aren't allowed on GatorEx. Stay safe, Gator! 🐊";
    case 'alcohol':
      return "🚫 Alcohol sales aren't permitted. Try the campus bookstore for other items! 📚";
    case 'drugs':
      return "🚫 Prescription drugs and controlled substances aren't allowed. Please follow campus guidelines.";
    case 'fake_docs':
      return "🚫 Academic documents can't be sold here. Contact your advisor for official transcripts.";
    case 'academic_dishonesty':
      return "🚫 Academic integrity is important! We don't allow homework or test assistance sales.";
    case 'adult':
      return "🚫 Adult services aren't permitted. Keep it campus-appropriate! 🎓";
    case 'animals':
      return "🚫 Pet sales aren't allowed. Check with local shelters for adoption! 🐕";
    case 'illegal':
      return "🚫 We don't allow stolen or counterfeit items. Keep it legal, Gator! ⚖️";
    default:
      return "🚫 This item isn't allowed on our marketplace. Please review our guidelines.";
  }
}
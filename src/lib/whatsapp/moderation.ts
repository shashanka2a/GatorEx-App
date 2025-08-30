export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

const DISALLOWED_ITEMS = [
  // Illegal items
  'drugs', 'marijuana', 'weed', 'cocaine', 'heroin', 'meth', 'pills',
  'weapons', 'gun', 'knife', 'sword', 'ammunition', 'explosive',
  'alcohol', 'beer', 'wine', 'liquor', 'vodka', 'whiskey',
  
  // Prohibited services
  'escort', 'massage', 'adult', 'sex', 'porn',
  'homework', 'essay', 'exam', 'test answers', 'cheat',
  
  // Animals (usually prohibited on campus)
  'puppy', 'kitten', 'pet', 'animal', 'dog', 'cat',
  
  // Dangerous items
  'fireworks', 'chemicals', 'poison', 'hazardous'
];

const SUSPICIOUS_PATTERNS = [
  /\b(quick|fast|easy)\s+(money|cash|profit)\b/i,
  /\b(work\s+from\s+home|make\s+money|get\s+rich)\b/i,
  /\b(mlm|pyramid|scheme)\b/i,
  /\b(bitcoin|crypto|investment)\b/i
];

export async function moderateContent(content: string): Promise<ModerationResult> {
  const lowerContent = content.toLowerCase();
  
  // Check for disallowed items
  for (const item of DISALLOWED_ITEMS) {
    if (lowerContent.includes(item)) {
      return {
        allowed: false,
        reason: getDisallowedReason(item)
      };
    }
  }
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        allowed: false,
        reason: "This looks like a business opportunity or scheme, which isn't allowed on GatorEx."
      };
    }
  }
  
  // Check for academic dishonesty
  if (lowerContent.includes('homework') || lowerContent.includes('assignment') || 
      lowerContent.includes('essay writing') || lowerContent.includes('test answers')) {
    return {
      allowed: false,
      reason: "Academic services violate UF's honor code and aren't allowed."
    };
  }
  
  return { allowed: true };
}

function getDisallowedReason(item: string): string {
  if (['drugs', 'marijuana', 'weed', 'cocaine', 'heroin', 'meth', 'pills'].includes(item)) {
    return "Controlled substances aren't allowed on GatorEx.";
  }
  
  if (['weapons', 'gun', 'knife', 'sword', 'ammunition', 'explosive'].includes(item)) {
    return "Weapons aren't allowed on campus or GatorEx.";
  }
  
  if (['alcohol', 'beer', 'wine', 'liquor', 'vodka', 'whiskey'].includes(item)) {
    return "Alcohol sales aren't allowed on GatorEx.";
  }
  
  if (['puppy', 'kitten', 'pet', 'animal', 'dog', 'cat'].includes(item)) {
    return "Pet sales aren't allowed. Try UF's pet adoption groups instead!";
  }
  
  if (['escort', 'massage', 'adult', 'sex', 'porn'].includes(item)) {
    return "Adult services aren't allowed on GatorEx.";
  }
  
  return "This item isn't allowed on GatorEx.";
}
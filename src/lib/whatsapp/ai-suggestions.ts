// AI-powered category and condition suggestions for listings

export interface CategoryConditionSuggestion {
  category: string;
  condition: string;
  confidence: number;
}

// Predefined categories that match the app's structure
const CATEGORIES = [
  'Electronics', 'Textbooks', 'Furniture', 'Clothing', 'Sports & Recreation',
  'Home & Garden', 'Transportation', 'Services', 'Food & Beverages', 
  'Beauty & Personal Care', 'Art & Crafts', 'Music & Instruments', 
  'Pet Supplies', 'Office & School Supplies', 'Health & Wellness',
  'Party & Events', 'Storage & Organization', 'Seasonal Items', 'Other'
];

const CONDITIONS = [
  'New',
  'Like New', 
  'Good',
  'Fair',
  'Poor'
];

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  'Electronics': [
    // Phones & Tablets
    'iphone', 'phone', 'smartphone', 'android', 'samsung', 'pixel', 'tablet', 'ipad',
    // Computers & Accessories
    'laptop', 'computer', 'macbook', 'pc', 'desktop', 'monitor', 'keyboard', 'mouse', 'webcam',
    'charger', 'cable', 'adapter', 'hub', 'dock', 'stand', 'case', 'sleeve',
    // Audio & Video
    'headphones', 'earbuds', 'airpods', 'speaker', 'bluetooth', 'tv', 'television',
    'camera', 'gopro', 'lens', 'tripod', 'microphone', 'recorder',
    // Gaming
    'gaming', 'xbox', 'playstation', 'nintendo', 'switch', 'console', 'controller',
    'steam', 'deck', 'vr', 'oculus', 'headset',
    // Kitchen Appliances
    'airfryer', 'air fryer', 'blender', 'microwave', 'toaster', 'coffee maker', 'keurig',
    'rice cooker', 'instant pot', 'pressure cooker', 'mixer', 'juicer', 'kettle',
    // Other Electronics
    'printer', 'scanner', 'router', 'modem', 'wifi', 'smart watch', 'fitbit', 'apple watch',
    'drone', 'projector', 'calculator', 'kindle', 'e-reader'
  ],
  'Textbooks': [
    'textbook', 'book', 'manual', 'study', 'edition', 'isbn', 'course', 'class',
    'calculus', 'chemistry', 'physics', 'biology', 'psychology', 'economics',
    'accounting', 'finance', 'marketing', 'statistics', 'algebra', 'geometry',
    'history', 'english', 'literature', 'philosophy', 'sociology', 'anthropology',
    'engineering', 'computer science', 'programming', 'java', 'python', 'c++',
    'medical', 'nursing', 'anatomy', 'physiology', 'pharmacology',
    'law', 'legal', 'business', 'management', 'operations'
  ],
  'Furniture': [
    // Seating
    'chair', 'desk chair', 'office chair', 'gaming chair', 'bean bag', 'stool',
    'couch', 'sofa', 'loveseat', 'futon', 'sectional',
    // Tables & Desks
    'desk', 'table', 'coffee table', 'dining table', 'end table', 'nightstand',
    'standing desk', 'computer desk', 'study table',
    // Bedroom
    'bed', 'mattress', 'bed frame', 'headboard', 'dresser', 'wardrobe', 'closet',
    'chest', 'drawer', 'armoire',
    // Storage & Organization
    'bookshelf', 'shelf', 'shelving', 'cabinet', 'storage', 'organizer',
    'tv stand', 'entertainment center', 'rack'
  ],
  'Clothing': [
    // Tops
    'shirt', 't-shirt', 'tshirt', 'tank top', 'blouse', 'sweater', 'hoodie',
    'sweatshirt', 'cardigan', 'jacket', 'coat', 'blazer', 'vest',
    // Bottoms
    'pants', 'jeans', 'shorts', 'skirt', 'dress', 'leggings', 'joggers',
    'sweatpants', 'khakis', 'chinos', 'trousers',
    // Footwear
    'shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers',
    'nike', 'adidas', 'converse', 'vans', 'jordans',
    // Accessories
    'hat', 'cap', 'beanie', 'scarf', 'gloves', 'belt', 'bag', 'backpack',
    'purse', 'wallet', 'watch', 'jewelry', 'necklace', 'bracelet', 'ring'
  ],
  'Sports & Recreation': [
    // Exercise Equipment
    'weights', 'dumbbells', 'barbell', 'kettlebell', 'resistance bands',
    'yoga mat', 'exercise bike', 'treadmill', 'elliptical', 'bench',
    // Sports Gear
    'basketball', 'football', 'soccer ball', 'tennis racket', 'golf clubs',
    'baseball bat', 'glove', 'helmet', 'pads', 'cleats',
    // Outdoor & Recreation
    'camping', 'tent', 'sleeping bag', 'backpack', 'hiking', 'fishing',
    'skateboard', 'longboard', 'roller blades', 'scooter',
    'pool', 'float', 'beach', 'cooler'
  ],
  'Home & Garden': [
    // Lighting & Decor
    'lamp', 'light', 'led', 'string lights', 'fairy lights', 'candle',
    'mirror', 'picture frame', 'wall art', 'poster', 'tapestry',
    // Textiles
    'rug', 'carpet', 'curtains', 'blinds', 'pillow', 'cushion',
    'blanket', 'throw', 'sheet', 'comforter', 'duvet',
    // Kitchen & Dining
    'dishes', 'plates', 'bowls', 'cups', 'mugs', 'utensils', 'cookware',
    'pots', 'pans', 'baking', 'cutting board', 'knife set',
    // Plants & Garden
    'plant', 'succulent', 'flower', 'pot', 'planter', 'vase',
    'garden', 'soil', 'fertilizer', 'seeds'
  ],
  'Transportation': [
    'car', 'vehicle', 'auto', 'truck', 'suv', 'sedan', 'honda', 'toyota',
    'ford', 'chevrolet', 'bmw', 'mercedes', 'audi',
    'bike', 'bicycle', 'mountain bike', 'road bike', 'electric bike',
    'scooter', 'moped', 'motorcycle', 'skateboard', 'longboard',
    'car parts', 'tires', 'wheels', 'battery', 'oil', 'filter'
  ],
  'Services': [
    'tutoring', 'tutor', 'lessons', 'teaching', 'help', 'assistance',
    'cleaning', 'moving', 'delivery', 'ride', 'transportation',
    'repair', 'fix', 'maintenance', 'installation', 'setup',
    'photography', 'photo', 'video', 'editing', 'design', 'graphic'
  ],
  'Food & Beverages': [
    'food', 'snacks', 'drinks', 'coffee', 'tea', 'energy drinks',
    'protein bars', 'supplements', 'vitamins', 'meal prep',
    'dining plan', 'gift card', 'restaurant', 'takeout'
  ],
  'Beauty & Personal Care': [
    'makeup', 'cosmetics', 'skincare', 'perfume', 'cologne', 'lotion',
    'shampoo', 'conditioner', 'hair products', 'styling tools',
    'nail polish', 'lipstick', 'foundation', 'mascara',
    'razor', 'toothbrush', 'soap', 'deodorant'
  ],
  'Art & Crafts': [
    'art supplies', 'paint', 'brushes', 'canvas', 'sketchbook',
    'colored pencils', 'markers', 'craft supplies', 'yarn',
    'sewing machine', 'fabric', 'beads', 'glue gun'
  ],
  'Music & Instruments': [
    'guitar', 'piano', 'keyboard', 'drums', 'violin', 'ukulele',
    'microphone', 'amplifier', 'music stand', 'sheet music',
    'headphones', 'audio interface', 'midi controller'
  ],
  'Pet Supplies': [
    'pet food', 'dog food', 'cat food', 'pet bed', 'leash',
    'collar', 'pet toys', 'litter box', 'aquarium', 'fish tank',
    'bird cage', 'pet carrier', 'grooming supplies'
  ],
  'Office & School Supplies': [
    'pens', 'pencils', 'notebooks', 'binders', 'folders',
    'stapler', 'paper', 'highlighters', 'sticky notes',
    'calculator', 'ruler', 'scissors', 'tape', 'glue'
  ],
  'Health & Wellness': [
    'vitamins', 'supplements', 'protein powder', 'first aid',
    'thermometer', 'blood pressure monitor', 'scale',
    'heating pad', 'ice pack', 'massage', 'essential oils'
  ],
  'Party & Events': [
    'decorations', 'balloons', 'party supplies', 'costumes',
    'halloween', 'christmas', 'birthday', 'graduation',
    'speakers', 'lights', 'photo booth', 'games'
  ],
  'Storage & Organization': [
    'storage bins', 'containers', 'organizers', 'hangers',
    'shoe rack', 'closet organizer', 'drawer dividers',
    'file cabinet', 'storage boxes', 'baskets'
  ],
  'Seasonal Items': [
    'winter clothes', 'summer gear', 'holiday decorations',
    'christmas tree', 'halloween costumes', 'beach gear',
    'winter boots', 'snow gear', 'fans', 'heaters'
  ]
};

// Condition keywords mapping
const CONDITION_KEYWORDS = {
  'New': [
    'new', 'brand new', 'unopened', 'sealed', 'never used', 'mint', 'perfect',
    'unused', 'original packaging', 'tags attached'
  ],
  'Like New': [
    'like new', 'barely used', 'excellent', 'pristine', 'almost new', 'mint condition',
    'perfect condition', 'no wear', 'flawless', 'immaculate'
  ],
  'Good': [
    'good', 'great', 'nice', 'solid', 'working', 'functional', 'clean',
    'well maintained', 'minor wear', 'light use', 'gently used'
  ],
  'Fair': [
    'fair', 'okay', 'decent', 'some wear', 'used', 'normal wear', 'signs of use',
    'scratches', 'scuffs', 'minor damage', 'cosmetic issues'
  ],
  'Poor': [
    'poor', 'rough', 'damaged', 'broken', 'cracked', 'torn', 'stained',
    'heavy wear', 'needs repair', 'for parts', 'as is'
  ]
};

export async function suggestCategoryAndCondition(itemName: string, description?: string): Promise<CategoryConditionSuggestion> {
  const text = `${itemName} ${description || ''}`.toLowerCase();
  
  // Try OpenAI first if available, fallback to keyword matching
  if (process.env.OPENAI_API_KEY) {
    try {
      return await getAISuggestion(text);
    } catch (error) {
      console.error('OpenAI suggestion failed, using fallback:', error);
    }
  }
  
  // Fallback to keyword-based matching
  return getKeywordBasedSuggestion(text);
}

async function getAISuggestion(text: string): Promise<CategoryConditionSuggestion> {
  const { OpenAI } = await import('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Analyze this item listing and suggest the best category and condition:

Item: "${text}"

Categories: ${CATEGORIES.join(', ')}
Conditions: ${CONDITIONS.join(', ')}

Respond with only: "Category: [category], Condition: [condition], Confidence: [0-100]"

Example: "Category: Electronics, Condition: Good, Confidence: 85"`;

  const response = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    max_tokens: 50,
    temperature: 0.1,
  });

  const result = response.choices[0]?.text?.trim();
  if (!result) {
    throw new Error('No response from OpenAI');
  }

  // Parse the response
  const categoryMatch = result.match(/Category:\s*([^,]+)/i);
  const conditionMatch = result.match(/Condition:\s*([^,]+)/i);
  const confidenceMatch = result.match(/Confidence:\s*(\d+)/i);

  const category = categoryMatch?.[1]?.trim() || 'Other';
  const condition = conditionMatch?.[1]?.trim() || 'Good';
  const confidence = parseInt(confidenceMatch?.[1] || '70');

  // Normalize and validate suggestions
  const validCategory = normalizeCategory(category);
  const validCondition = normalizeCondition(condition);

  return {
    category: validCategory,
    condition: validCondition,
    confidence
  };
}

function getKeywordBasedSuggestion(text: string): CategoryConditionSuggestion {
  let bestCategory = 'Other';
  let bestCategoryScore = 0;
  
  // Find best matching category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.length; // Longer keywords get higher scores
      }
    }
    
    if (score > bestCategoryScore) {
      bestCategoryScore = score;
      bestCategory = category;
    }
  }
  
  let bestCondition = 'Good';
  let bestConditionScore = 0;
  
  // Find best matching condition
  for (const [condition, keywords] of Object.entries(CONDITION_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.length;
      }
    }
    
    if (score > bestConditionScore) {
      bestConditionScore = score;
      bestCondition = condition;
    }
  }
  
  // Calculate confidence based on keyword matches
  const confidence = Math.min(90, Math.max(30, (bestCategoryScore + bestConditionScore) * 10));
  
  return {
    category: normalizeCategory(bestCategory),
    condition: normalizeCondition(bestCondition),
    confidence
  };
}

// Normalize category to proper capitalization
function normalizeCategory(category: string): string {
  const normalized = category.trim();
  
  // Find exact match (case insensitive)
  const exactMatch = CATEGORIES.find(cat => 
    cat.toLowerCase() === normalized.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Handle common variations
  const variations: { [key: string]: string } = {
    'electronics': 'Electronics',
    'textbooks': 'Textbooks',
    'books': 'Textbooks',
    'furniture': 'Furniture',
    'clothing': 'Clothing',
    'sports': 'Sports & Recreation',
    'sports & recreation': 'Sports & Recreation',
    'home': 'Home & Garden',
    'home & garden': 'Home & Garden',
    'transportation': 'Transportation',
    'services': 'Services',
    'food': 'Food & Beverages',
    'food & beverages': 'Food & Beverages',
    'beauty': 'Beauty & Personal Care',
    'beauty & personal care': 'Beauty & Personal Care',
    'art': 'Art & Crafts',
    'art & crafts': 'Art & Crafts',
    'music': 'Music & Instruments',
    'music & instruments': 'Music & Instruments',
    'pets': 'Pet Supplies',
    'pet supplies': 'Pet Supplies',
    'office': 'Office & School Supplies',
    'office & school supplies': 'Office & School Supplies',
    'health': 'Health & Wellness',
    'health & wellness': 'Health & Wellness',
    'party': 'Party & Events',
    'party & events': 'Party & Events',
    'storage': 'Storage & Organization',
    'storage & organization': 'Storage & Organization',
    'seasonal': 'Seasonal Items',
    'seasonal items': 'Seasonal Items',
    'other': 'Other'
  };
  
  const variation = variations[normalized.toLowerCase()];
  return variation || 'Other';
}

// Normalize condition to proper capitalization
function normalizeCondition(condition: string): string {
  const normalized = condition.trim();
  
  // Find exact match (case insensitive)
  const exactMatch = CONDITIONS.find(cond => 
    cond.toLowerCase() === normalized.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Handle common variations
  const variations: { [key: string]: string } = {
    'new': 'New',
    'like new': 'Like New',
    'likenew': 'Like New',
    'excellent': 'Like New',
    'good': 'Good',
    'great': 'Good',
    'fair': 'Fair',
    'okay': 'Fair',
    'poor': 'Poor',
    'bad': 'Poor'
  };
  
  const variation = variations[normalized.toLowerCase()];
  return variation || 'Good';
}

export function validateCategory(category: string): string {
  return normalizeCategory(category);
}

export function validateCondition(condition: string): string {
  return normalizeCondition(condition);
}

export function getAvailableCategories(): string[] {
  return [...CATEGORIES];
}

export function getAvailableConditions(): string[] {
  return [...CONDITIONS];
}
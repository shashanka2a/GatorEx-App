// AI-powered category and condition suggestions for listings

export interface CategoryConditionSuggestion {
  category: string;
  condition: string;
  confidence: number;
}

// Predefined categories that match the app's structure
const CATEGORIES = [
  'Electronics',
  'Books', 
  'Clothing',
  'Furniture',
  'Transportation',
  'Other'
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
    'phone', 'iphone', 'android', 'samsung', 'laptop', 'computer', 'macbook', 'pc',
    'tablet', 'ipad', 'headphones', 'airpods', 'speaker', 'tv', 'monitor', 'camera',
    'gaming', 'xbox', 'playstation', 'nintendo', 'switch', 'console', 'charger',
    'cable', 'mouse', 'keyboard', 'webcam', 'printer', 'router', 'bluetooth'
  ],
  'Books': [
    'book', 'textbook', 'novel', 'manual', 'guide', 'study', 'edition', 'isbn',
    'calculus', 'chemistry', 'biology', 'physics', 'history', 'english', 'math',
    'psychology', 'economics', 'accounting', 'finance', 'marketing', 'engineering'
  ],
  'Clothing': [
    'shirt', 'pants', 'dress', 'shoes', 'sneakers', 'boots', 'jacket', 'coat',
    'hoodie', 'sweater', 'jeans', 'shorts', 'skirt', 'blouse', 'suit', 'tie',
    'hat', 'cap', 'socks', 'underwear', 'bra', 'swimsuit', 'uniform', 'jersey'
  ],
  'Furniture': [
    'desk', 'chair', 'table', 'bed', 'mattress', 'couch', 'sofa', 'dresser',
    'bookshelf', 'lamp', 'mirror', 'rug', 'curtains', 'blinds', 'nightstand',
    'wardrobe', 'cabinet', 'shelf', 'ottoman', 'futon', 'recliner'
  ],
  'Transportation': [
    'bike', 'bicycle', 'scooter', 'skateboard', 'longboard', 'car', 'motorcycle',
    'moped', 'helmet', 'lock', 'pump', 'tire', 'wheel', 'pedal', 'chain'
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

  // Validate suggestions
  const validCategory = CATEGORIES.includes(category) ? category : 'Other';
  const validCondition = CONDITIONS.includes(condition) ? condition : 'Good';

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
    category: bestCategory,
    condition: bestCondition,
    confidence
  };
}

export function validateCategory(category: string): string {
  return CATEGORIES.includes(category) ? category : 'Other';
}

export function validateCondition(condition: string): string {
  return CONDITIONS.includes(condition) ? condition : 'Good';
}

export function getAvailableCategories(): string[] {
  return [...CATEGORIES];
}

export function getAvailableConditions(): string[] {
  return [...CONDITIONS];
}
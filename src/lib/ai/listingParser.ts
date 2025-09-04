import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedListing {
  title: string;
  price: number | null;
  category: string;
  condition: string;
  description: string;
  confidence: number;
  suggestions: string[];
}

export interface ImageAnalysis {
  title: string;
  category: string;
  condition: string;
  description: string;
  confidence: number;
  detectedText: string[];
  suggestions: string[];
}

const CATEGORIES = [
  'Electronics', 'Textbooks', 'Furniture', 'Clothing', 'Sports & Recreation',
  'Home & Garden', 'Transportation', 'Services', 'Other'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export class ListingParser {
  
  /**
   * Parse a single sentence into listing components
   * Example: "iPhone 14, $850, Like New" → {title: "iPhone 14", price: 850, condition: "Like New"}
   */
  static async parseListingText(input: string): Promise<ParsedListing> {
    try {
      const prompt = `
You are an expert at parsing marketplace listing information. Parse the following text into structured listing data.

Categories: ${CATEGORIES.join(', ')}
Conditions: ${CONDITIONS.join(', ')}

Input: "${input}"

Extract and return ONLY a JSON object with these fields:
{
  "title": "clean product title (required)",
  "price": number or null,
  "category": "best matching category from the list above",
  "condition": "best matching condition from the list above", 
  "description": "any additional details or context",
  "confidence": number between 0-1,
  "suggestions": ["array of helpful suggestions for the seller"]
}

Rules:
- Title should be clean and descriptive
- Price should be a number (no $ symbol) or null if not found
- Category must be from the provided list
- Condition must be from the provided list
- If unsure about category/condition, pick the most likely one
- Confidence should reflect how certain you are about the parsing
- Suggestions should help improve the listing

Example input: "iPhone 14, $850, Like New"
Example output: {"title": "iPhone 14", "price": 850, "category": "Electronics", "condition": "Like New", "description": "", "confidence": 0.95, "suggestions": ["Consider adding storage capacity (128GB, 256GB, etc.)", "Mention if it includes original box and accessories"]}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content) as ParsedListing;
      
      // Validate required fields
      if (!parsed.title) {
        throw new Error('Title is required');
      }

      // Ensure category and condition are valid
      if (!CATEGORIES.includes(parsed.category)) {
        parsed.category = 'Other';
      }
      
      if (!CONDITIONS.includes(parsed.condition)) {
        parsed.condition = 'Good';
      }

      return parsed;

    } catch (error) {
      console.error('Error parsing listing text:', error);
      
      // Fallback parsing
      return this.fallbackTextParsing(input);
    }
  }

  /**
   * Analyze an image to extract listing information
   */
  static async analyzeImage(imageBase64: string): Promise<ImageAnalysis> {
    try {
      const prompt = `
You are an expert at analyzing product images for marketplace listings. Analyze this image and extract listing information.

Categories: ${CATEGORIES.join(', ')}
Conditions: ${CONDITIONS.join(', ')}

Look for:
1. Product identification (brand, model, type)
2. Visible condition indicators
3. Any text in the image (labels, screens, packaging)
4. Category classification
5. Condition assessment

Return ONLY a JSON object:
{
  "title": "descriptive product title based on what you see",
  "category": "best matching category from the list",
  "condition": "estimated condition from the list",
  "description": "detailed description of what you observe",
  "confidence": number between 0-1,
  "detectedText": ["array of any text visible in the image"],
  "suggestions": ["helpful suggestions for the seller"]
}

Rules:
- Title should be specific and descriptive
- Category must be from the provided list
- Condition should be conservative estimate based on visible wear
- Include details about color, size, brand, model if visible
- Confidence should reflect how clear the image is
- Suggestions should help improve the listing
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI Vision');
      }

      const parsed = JSON.parse(content) as ImageAnalysis;
      
      // Validate and clean up response
      if (!parsed.title) {
        parsed.title = 'Item for Sale';
      }

      if (!CATEGORIES.includes(parsed.category)) {
        parsed.category = 'Other';
      }
      
      if (!CONDITIONS.includes(parsed.condition)) {
        parsed.condition = 'Good';
      }

      return parsed;

    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Fallback response
      return {
        title: 'Item for Sale',
        category: 'Other',
        condition: 'Good',
        description: 'Please add a description of your item',
        confidence: 0.1,
        detectedText: [],
        suggestions: [
          'Try taking a clearer photo with better lighting',
          'Include multiple angles of the item',
          'Add a description manually'
        ]
      };
    }
  }

  /**
   * Fallback text parsing without AI
   */
  private static fallbackTextParsing(input: string): ParsedListing {
    const text = input.toLowerCase().trim();
    
    // Extract price
    const priceMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : null;
    
    // Extract condition
    let condition = 'Good';
    for (const cond of CONDITIONS) {
      if (text.includes(cond.toLowerCase())) {
        condition = cond;
        break;
      }
    }
    
    // Extract category (basic keyword matching)
    let category = 'Other';
    const categoryKeywords = {
      'Electronics': ['iphone', 'phone', 'laptop', 'computer', 'tablet', 'tv', 'camera'],
      'Textbooks': ['textbook', 'book', 'manual', 'study'],
      'Furniture': ['chair', 'desk', 'table', 'bed', 'sofa', 'couch'],
      'Clothing': ['shirt', 'pants', 'dress', 'shoes', 'jacket'],
      'Transportation': ['car', 'bike', 'bicycle', 'scooter']
    };
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Clean title (remove price and condition)
    let title = input.trim();
    if (priceMatch) {
      title = title.replace(priceMatch[0], '').trim();
    }
    title = title.replace(new RegExp(condition, 'gi'), '').trim();
    title = title.replace(/[,\s]+$/, '').trim();
    
    if (!title) {
      title = 'Item for Sale';
    }

    return {
      title,
      price,
      category,
      condition,
      description: '',
      confidence: 0.6,
      suggestions: [
        'Consider adding more details about the item',
        'Include the reason for selling',
        'Mention if original packaging is included'
      ]
    };
  }

  /**
   * Generate smart suggestions based on parsed data
   */
  static async generateSuggestions(parsed: ParsedListing): Promise<string[]> {
    try {
      const prompt = `
You are helping a college student create a better marketplace listing. Based on this parsed listing data, provide 3-5 specific, actionable suggestions to improve the listing.

Listing data:
- Title: ${parsed.title}
- Price: ${parsed.price ? `$${parsed.price}` : 'Not specified'}
- Category: ${parsed.category}
- Condition: ${parsed.condition}
- Description: ${parsed.description || 'None provided'}

Focus on:
1. Missing information that buyers typically want
2. Ways to make the listing more trustworthy
3. Pricing optimization tips
4. Better presentation suggestions
5. Category-specific advice

Return ONLY a JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3"]

Keep suggestions concise, specific, and actionable.
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return parsed.suggestions || [];
      }

      const suggestions = JSON.parse(content) as string[];
      return suggestions;

    } catch (error) {
      console.error('Error generating suggestions:', error);
      return parsed.suggestions || [
        'Add more details about the item condition',
        'Include photos from multiple angles',
        'Mention if you have the original packaging'
      ];
    }
  }
}
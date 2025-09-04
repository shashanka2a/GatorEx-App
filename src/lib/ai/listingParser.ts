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
  'Home & Garden', 'Transportation', 'Services', 'Food & Beverages', 
  'Beauty & Personal Care', 'Art & Crafts', 'Music & Instruments', 
  'Pet Supplies', 'Office & School Supplies', 'Health & Wellness',
  'Party & Events', 'Storage & Organization', 'Seasonal Items', 'Other'
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

Category Guidelines for Student Marketplace:
- Electronics: phones, laptops, gaming consoles, kitchen appliances (air fryer, coffee maker, etc.), headphones, speakers, chargers, monitors, cameras, smart devices
- Textbooks: course books, study guides, academic materials, reference books, lab manuals, any educational content
- Furniture: dorm/apartment furniture (desks, chairs, beds, dressers, couches, tables, storage, bookshelves)
- Clothing: all apparel, shoes, accessories, bags, jewelry, hats, jackets, brand items
- Sports & Recreation: exercise equipment, sports gear, outdoor equipment, bikes, skateboards, gym accessories
- Home & Garden: decor, lighting, rugs, curtains, kitchen items, plants, cleaning supplies, organization
- Transportation: cars, bikes, scooters, car parts, vehicle accessories
- Services: tutoring, cleaning, moving, photography, repair services, lessons
- Food & Beverages: snacks, drinks, supplements, meal prep, dining plans, gift cards
- Beauty & Personal Care: makeup, skincare, hair products, personal hygiene items
- Art & Crafts: art supplies, paint, brushes, craft materials, sewing supplies
- Music & Instruments: guitars, keyboards, drums, audio equipment, sheet music
- Pet Supplies: pet food, toys, beds, carriers, grooming supplies, aquarium items
- Office & School Supplies: pens, notebooks, binders, calculators, stationery
- Health & Wellness: vitamins, supplements, fitness accessories, medical supplies
- Party & Events: decorations, costumes, party supplies, event equipment
- Storage & Organization: bins, containers, organizers, closet systems
- Seasonal Items: holiday decorations, seasonal clothing, weather-specific gear

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

Category Guidelines for Student Marketplace:
- Electronics: phones, laptops, gaming consoles, kitchen appliances (air fryer, blender, coffee maker, microwave, etc.), headphones, speakers, chargers, monitors, cameras, smart watches, calculators, printers
- Textbooks: course books, study guides, academic materials, reference books, lab manuals, any educational content for classes
- Furniture: dorm/apartment furniture (desks, chairs, beds, dressers, couches, tables, storage units, bookshelves, nightstands)
- Clothing: all apparel, shoes, accessories, bags, backpacks, jewelry, hats, jackets, brand clothing, athletic wear
- Sports & Recreation: exercise equipment, sports gear, outdoor equipment, bikes, skateboards, gym accessories, yoga mats, weights
- Home & Garden: decor, lighting, rugs, curtains, kitchen utensils, plants, cleaning supplies, organization items, mirrors
- Transportation: cars, motorcycles, bikes, scooters, car parts, vehicle accessories, parking permits
- Services: tutoring, cleaning, moving help, photography, repair services, lessons, academic assistance
- Food & Beverages: snacks, drinks, supplements, protein bars, meal prep containers, dining plan credits, restaurant gift cards
- Beauty & Personal Care: makeup, skincare products, hair styling tools, perfumes, personal hygiene items, grooming supplies
- Art & Crafts: art supplies, paints, brushes, canvases, craft materials, sewing machines, yarn, beads
- Music & Instruments: guitars, keyboards, drums, violins, audio equipment, microphones, sheet music, music stands
- Pet Supplies: pet food, toys, beds, leashes, carriers, grooming tools, aquarium equipment, bird cages
- Office & School Supplies: pens, notebooks, binders, calculators, staplers, paper, folders, study materials
- Health & Wellness: vitamins, supplements, fitness trackers, medical supplies, first aid kits, wellness products
- Party & Events: decorations, costumes, party supplies, holiday items, event equipment, photo booth props
- Storage & Organization: storage bins, organizers, hangers, closet systems, drawer dividers, baskets
- Seasonal Items: holiday decorations, seasonal clothing, winter gear, summer items, weather-specific equipment

Look for:
1. Product identification (brand, model, type)
2. Visible condition indicators
3. Any text in the image (labels, screens, packaging)
4. Category classification (kitchen appliances = Electronics)
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
    
    // Extract category (comprehensive keyword matching for ALL student marketplace items)
    let category = 'Other';
    const categoryKeywords = {
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
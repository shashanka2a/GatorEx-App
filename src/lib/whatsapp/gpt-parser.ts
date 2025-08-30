import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ListingSchema = z.object({
  action: z.enum(['create_listing', 'blocked', 'unclear']),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  contact: z.string().optional(),
  has_image: z.boolean().optional(),
  status: z.enum(['draft', 'ready']).optional(),
  missing_fields: z.array(z.enum(['title', 'price', 'image'])).optional(),
  price_indicators: z.array(z.string()).optional() // Track vague price terms
});

export async function generateListingFromMessage(content: string): Promise<any> {
  try {
    const prompt = `
You are a marketplace listing parser for a university student marketplace. 
Parse the following message and extract listing information.

MANDATORY FIELDS FOR PUBLISHING:
1. TITLE: Clear item name (not just "selling something")
2. PRICE: Numeric dollar amount (NOT "DM for price", "best offer", "OBO", etc.)
3. IMAGE: Must have at least one image attached

RULES:
- Only create listings for items being SOLD (not wanted/looking for)
- Block inappropriate content, weapons, illegal items, academic dishonesty
- Categories: Textbooks, Electronics, Furniture, Appliances, Clothing, Sports, Gaming, Tickets, Books, Other
- Conditions: New, Like New, Excellent, Good, Fair, Poor
- STRICT: If no numeric price (e.g., "DM for price", "best offer", "$?"), mark missing_fields: ["price"]
- STRICT: If vague title (e.g., "selling stuff", "item for sale"), mark missing_fields: ["title"]
- STRICT: If no image mentioned/attached, mark missing_fields: ["image"]
- Track vague price terms in price_indicators array
- Extract phone numbers or "DM me" as contact info

Message: "${content}"

Return JSON with this exact schema:
{
  "action": "create_listing" | "blocked" | "unclear",
  "title": "string (clear item name, not vague)",
  "description": "string (optional)",
  "price": number (ONLY if numeric dollar amount found, null otherwise),
  "category": "string (from allowed categories)",
  "condition": "string (from allowed conditions)",
  "contact": "string (phone/social media)",
  "has_image": boolean (true if image attached/mentioned),
  "status": "draft" | "ready" (ready ONLY if title, price, and has_image are all valid),
  "missing_fields": ["title", "price", "image"] (any missing mandatory fields),
  "price_indicators": ["DM for price", "best offer"] (vague price terms found)
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return ListingSchema.parse(parsed);
  } catch (error) {
    console.error('GPT parsing error:', error);
    return { action: 'unclear', missing_fields: ['title', 'price'] };
  }
}
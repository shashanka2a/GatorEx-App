#!/usr/bin/env node

/**
 * Polish existing listing titles for professional display using AI
 * This script applies proper capitalization, brand name corrections, and removes extra info
 */

const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI-powered title polishing function
async function polishTitleWithAI(title) {
  if (!title) return 'Item for Sale';
  
  // Try AI-powered title extraction first
  if (process.env.OPENAI_API_KEY) {
    try {
      const prompt = `
Extract a clean, professional product title from this text. Remove any extra information like "DM for price", "selling", contact instructions, or incomplete phrases.

Input: "${title}"

Rules:
1. Extract ONLY the product name and key details (brand, model, size, etc.)
2. Use proper capitalization for brands (iPhone, Samsung Galaxy, MacBook, etc.)
3. Remove selling instructions, contact info, or promotional text
4. If the title is incomplete or unclear, make it complete and professional
5. Keep it concise but descriptive

Examples:
- "Selling this apple mouse, DM for price!" → "Apple Mouse"
- "iphone 13 pro max 256gb" → "iPhone 13 Pro Max 256GB"
- "samsung galaxy s23 ultra like new condition" → "Samsung Galaxy S23 Ultra"
- "Apple Watch for" → "Apple Watch"
- "macbook air 13 inch 2022" → "MacBook Air 13" 2022"

Return ONLY the cleaned title, nothing else:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 100,
      });

      const cleanedTitle = response.choices[0]?.message?.content?.trim();
      if (cleanedTitle && cleanedTitle.length > 0 && cleanedTitle.length < 100) {
        return polishTitleBasic(cleanedTitle);
      }
    } catch (error) {
      console.error('AI title polishing failed for:', title, error.message);
    }
  }
  
  // Fallback to basic polishing
  return polishTitleBasic(title);
}

// Basic title polishing function (fallback)
function polishTitleBasic(title) {
  if (!title) return 'Item for Sale';
  
  let polished = title.trim();
  
  // Remove common selling phrases
  const sellingPhrases = [
    /^selling\s+/i,
    /^for\s+sale\s*:?\s*/i,
    /,?\s*dm\s+for\s+price!?$/i,
    /,?\s*message\s+me$/i,
    /,?\s*contact\s+me$/i,
    /,?\s*interested\?$/i,
    /,?\s*serious\s+buyers\s+only$/i,
    /,?\s*cash\s+only$/i,
    /,?\s*obo$/i,
    /,?\s*or\s+best\s+offer$/i
  ];
  
  sellingPhrases.forEach(phrase => {
    polished = polished.replace(phrase, '');
  });
  
  // Common brand/product name corrections
  const brandCorrections = {
    'iphone': 'iPhone',
    'ipad': 'iPad',
    'macbook': 'MacBook',
    'airpods': 'AirPods',
    'samsung': 'Samsung',
    'galaxy': 'Galaxy',
    'zflip': 'Z Flip',
    'zfold': 'Z Fold',
    'nintendo': 'Nintendo',
    'playstation': 'PlayStation',
    'xbox': 'Xbox',
    'airfryer': 'Air Fryer',
    'instant pot': 'Instant Pot',
    'macbook pro': 'MacBook Pro',
    'macbook air': 'MacBook Air',
    'apple watch': 'Apple Watch',
    'apple mouse': 'Apple Mouse',
    'magic mouse': 'Magic Mouse',
    'fitbit': 'Fitbit',
    'gopro': 'GoPro',
    'kindle': 'Kindle',
    'surface pro': 'Surface Pro',
    'thinkpad': 'ThinkPad',
    'chromebook': 'Chromebook'
  };
  
  // Apply brand corrections (case insensitive)
  for (const [incorrect, correct] of Object.entries(brandCorrections)) {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    polished = polished.replace(regex, correct);
  }
  
  // Capitalize first letter of each word for general items
  polished = polished.replace(/\b\w+/g, (word) => {
    // Don't change already corrected brand names
    if (Object.values(brandCorrections).includes(word)) {
      return word;
    }
    // Capitalize first letter, keep rest as is for mixed case words
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Handle common patterns
  polished = polished
    .replace(/\b(\d+)\s*(gb|tb|mb)\b/gi, '$1$2') // "128 GB" → "128GB"
    .replace(/\b(\d+)\s*(inch|in)\b/gi, '$1"') // "13 inch" → "13""
    .replace(/\bpro\b/gi, 'Pro')
    .replace(/\bair\b/gi, 'Air')
    .replace(/\bmax\b/gi, 'Max')
    .replace(/\bmini\b/gi, 'Mini')
    .replace(/\bplus\b/gi, 'Plus')
    .replace(/\bultra\b/gi, 'Ultra');
  
  // Clean up extra spaces and punctuation
  polished = polished
    .replace(/\s+/g, ' ')
    .replace(/[,\s]+$/, '')
    .trim();
  
  // Handle incomplete titles
  if (polished.endsWith(' for') || polished.endsWith(' For')) {
    polished = polished.replace(/\s+for$/i, '');
  }
  
  return polished || 'Item for Sale';
}

async function polishListingTitles() {
  try {
    console.log('🔍 Checking for listings with titles that need polishing...');
    
    // Get all listings
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`📊 Found ${listings.length} total listings`);
    
    const fixes = [];
    
    console.log('🤖 Using AI to polish titles...');
    
    for (const listing of listings) {
      const currentTitle = listing.title;
      const polishedTitle = await polishTitleWithAI(currentTitle);
      
      if (currentTitle !== polishedTitle) {
        fixes.push({
          id: listing.id,
          oldTitle: currentTitle,
          newTitle: polishedTitle
        });
      }
      
      // Add a small delay to avoid rate limiting
      if (process.env.OPENAI_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (fixes.length === 0) {
      console.log('✅ All titles are already properly formatted!');
      return;
    }
    
    console.log(`\n🔧 Found ${fixes.length} listings that need title polishing:`);
    fixes.forEach(fix => {
      console.log(`  • "${fix.oldTitle}" → "${fix.newTitle}"`);
    });
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n❓ Do you want to apply these title improvements? (y/N): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }
    
    // Apply fixes
    console.log('\n🔄 Applying title improvements...');
    
    for (const fix of fixes) {
      await prisma.listing.update({
        where: { id: fix.id },
        data: { title: fix.newTitle }
      });
      console.log(`✅ Updated: "${fix.oldTitle}" → "${fix.newTitle}"`);
    }
    
    console.log(`\n🎉 Successfully polished ${fixes.length} listing titles!`);
    
    // Show some examples of the improvements
    console.log('\n📈 Examples of improvements made:');
    fixes.slice(0, 5).forEach(fix => {
      console.log(`  "${fix.oldTitle}" → "${fix.newTitle}"`);
    });
    
  } catch (error) {
    console.error('❌ Error polishing titles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  polishListingTitles();
}

module.exports = { polishListingTitles };
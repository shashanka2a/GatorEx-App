// AI-powered category and condition suggestions
export async function suggestCategoryAndCondition(itemName: string): Promise<{
  category: string;
  condition: string;
}> {
  const item = itemName.toLowerCase();
  
  // Simple rule-based suggestions (can be enhanced with GPT-4o later)
  let category = 'Other';
  let condition = 'Good';
  
  // Category detection
  if (item.includes('phone') || item.includes('iphone') || item.includes('android')) {
    category = 'Electronics';
  } else if (item.includes('book') || item.includes('textbook') || item.includes('novel')) {
    category = 'Books';
  } else if (item.includes('bike') || item.includes('bicycle') || item.includes('scooter')) {
    category = 'Transportation';
  } else if (item.includes('shirt') || item.includes('dress') || item.includes('shoes') || item.includes('clothes')) {
    category = 'Clothing';
  } else if (item.includes('desk') || item.includes('chair') || item.includes('table') || item.includes('furniture')) {
    category = 'Furniture';
  } else if (item.includes('laptop') || item.includes('computer') || item.includes('tablet') || item.includes('headphones')) {
    category = 'Electronics';
  } else if (item.includes('car') || item.includes('vehicle') || item.includes('auto')) {
    category = 'Vehicles';
  }
  
  // Condition detection based on keywords
  if (item.includes('new') || item.includes('brand new') || item.includes('unopened')) {
    condition = 'New';
  } else if (item.includes('excellent') || item.includes('perfect') || item.includes('mint')) {
    condition = 'Excellent';
  } else if (item.includes('fair') || item.includes('worn') || item.includes('used')) {
    condition = 'Fair';
  } else if (item.includes('poor') || item.includes('damaged') || item.includes('broken')) {
    condition = 'Poor';
  }
  
  return { category, condition };
}

// Enhanced version with GPT-4o (for future implementation)
export async function suggestCategoryAndConditionWithAI(itemName: string): Promise<{
  category: string;
  condition: string;
}> {
  // TODO: Implement GPT-4o API call
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [{
  //     role: "user",
  //     content: `Categorize this item and suggest condition: "${itemName}". 
  //              Categories: Electronics, Books, Clothing, Furniture, Transportation, Vehicles, Other
  //              Conditions: New, Excellent, Good, Fair, Poor
  //              Respond with: Category: X, Condition: Y`
  //   }],
  //   max_tokens: 50
  // });
  
  // For now, fall back to rule-based
  return suggestCategoryAndCondition(itemName);
}
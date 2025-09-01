const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupTestListings() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning up test listings...');
    
    // First, let's see what listings exist
    const listingsResult = await client.query(`
      SELECT id, title, seller_id, created_at 
      FROM listings 
      ORDER BY created_at DESC
    `);
    
    const listings = listingsResult.rows;
    
    console.log(`\nFound ${listings.length} listings:`);
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id}) - ${new Date(listing.created_at).toLocaleString()}`);
    });
    
    // Delete test listings (you can modify this criteria)
    const testKeywords = ['test', 'iPhone 14 128 GB', 'sample', 'demo'];
    
    const testListings = listings.filter(listing => 
      testKeywords.some(keyword => 
        listing.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (testListings.length === 0) {
      console.log('\n✅ No test listings found to delete.');
      return;
    }
    
    console.log(`\n🗑️  Found ${testListings.length} test listings to delete:`);
    testListings.forEach(listing => {
      console.log(`- ${listing.title} (ID: ${listing.id})`);
    });
    
    // Delete the test listings
    const testIds = testListings.map(l => l.id);
    const placeholders = testIds.map((_, index) => `$${index + 1}`).join(',');
    
    await client.query(`DELETE FROM listings WHERE id IN (${placeholders})`, testIds);
    
    console.log(`\n✅ Successfully deleted ${testListings.length} test listings!`);
    
    // Show remaining listings
    const remainingResult = await client.query(`
      SELECT id, title, created_at 
      FROM listings 
      ORDER BY created_at DESC
    `);
    
    const remainingListings = remainingResult.rows;
    
    console.log(`\n📋 Remaining listings: ${remainingListings.length}`);
    remainingListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${new Date(listing.created_at).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the cleanup
cleanupTestListings();
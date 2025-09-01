const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateUserProfile() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking existing users...');
    
    // First, let's see what users exist
    const usersResult = await client.query(`
      SELECT id, name, email, "ufEmailVerified", "profileCompleted", "createdAt"
      FROM users 
      ORDER BY "createdAt" DESC
    `);
    
    const users = usersResult.rows;
    
    console.log(`\nFound ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email}) - Verified: ${user.ufEmailVerified}`);
    });
    
    if (users.length === 0) {
      console.log('\n❌ No users found. Please sign up first through the app.');
      return;
    }
    
    // Update the first user with actual details
    const userToUpdate = users[0];
    console.log(`\n📝 Updating user: ${userToUpdate.email}`);
    
    // You can customize these details
    const updatedName = 'Shashank Jagannatham'; // Replace with actual name
    
    await client.query(`
      UPDATE users 
      SET 
        name = $1,
        "profileCompleted" = true,
        "updatedAt" = NOW()
      WHERE id = $2
    `, [updatedName, userToUpdate.id]);
    
    console.log(`✅ Successfully updated user profile!`);
    console.log(`   Name: ${updatedName}`);
    console.log(`   Email: ${userToUpdate.email}`);
    console.log(`   Profile Completed: true`);
    
    // Show updated user
    const updatedResult = await client.query(`
      SELECT id, name, email, "ufEmailVerified", "profileCompleted"
      FROM users 
      WHERE id = $1
    `, [userToUpdate.id]);
    
    const updatedUser = updatedResult.rows[0];
    console.log('\n📋 Updated user details:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   UF Email Verified: ${updatedUser.ufEmailVerified}`);
    console.log(`   Profile Completed: ${updatedUser.profileCompleted}`);
    
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateUserProfile();
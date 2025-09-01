const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updateUserProfile() {
  try {
    console.log('🔍 Checking existing users...');
    
    // First, let's see what users exist
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        ufEmailVerified: true,
        profileCompleted: true,
        trustScore: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
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
    const trustScore = 75; // Set a good trust score
    
    const updatedUser = await prisma.user.update({
      where: { id: userToUpdate.id },
      data: {
        name: updatedName,
        profileCompleted: true,
        trustScore: trustScore
      }
    });
    
    console.log(`✅ Successfully updated user profile!`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Profile Completed: ${updatedUser.profileCompleted}`);
    console.log(`   Trust Score: ${updatedUser.trustScore}`);
    console.log(`   UF Email Verified: ${updatedUser.ufEmailVerified}`);
    
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateUserProfile();
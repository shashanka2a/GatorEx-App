const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createGiveawayTables() {
  try {
    console.log('Creating giveaway tables...');
    
    // The tables will be created automatically when Prisma schema is applied
    // This script is for manual verification and seeding
    
    // Create the iPhone 14 giveaway
    const existingGiveaway = await prisma.giveaway.findFirst({
      where: {
        title: 'iPhone 14 Launch Giveaway'
      }
    });

    if (!existingGiveaway) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now

      const giveaway = await prisma.giveaway.create({
        data: {
          title: 'iPhone 14 Launch Giveaway',
          description: 'Win an iPhone 14 by completing our launch requirements! Follow @gatorex.shop on Instagram, verify your UF email, and post at least one item to sell.',
          prize: 'iPhone 14',
          startDate: new Date(),
          endDate: endDate,
          isActive: true
        }
      });

      console.log('Created iPhone 14 giveaway:', giveaway.id);
    } else {
      console.log('iPhone 14 giveaway already exists:', existingGiveaway.id);
    }

    console.log('Giveaway setup completed successfully!');
    
  } catch (error) {
    console.error('Error creating giveaway tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGiveawayTables();
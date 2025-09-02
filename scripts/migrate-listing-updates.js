const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateListingUpdates() {
  try {
    console.log('🔄 Starting listing updates migration...');

    // Add SOLD status to ListingStatus enum if not exists
    try {
      await prisma.$executeRaw`
        ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'SOLD';
      `;
      console.log('✅ Added SOLD status to ListingStatus enum');
    } catch (error) {
      console.log('ℹ️ SOLD status already exists in enum');
    }

    // Add soldAt column to listings table if not exists
    try {
      await prisma.$executeRaw`
        ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "soldAt" TIMESTAMP(3);
      `;
      console.log('✅ Added soldAt column to listings table');
    } catch (error) {
      console.log('ℹ️ soldAt column already exists');
    }

    // Create ContactType enum if not exists
    try {
      await prisma.$executeRaw`
        CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'SMS', 'PHONE', 'VIEW_CONTACT');
      `;
      console.log('✅ Created ContactType enum');
    } catch (error) {
      console.log('ℹ️ ContactType enum already exists');
    }

    // Create contact_events table if not exists
    const contactEventsTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_events'
      );
    `;

    if (!contactEventsTableExists[0]?.exists) {
      await prisma.$executeRaw`
        CREATE TABLE "contact_events" (
          "id" TEXT NOT NULL,
          "listingId" TEXT NOT NULL,
          "contacterId" TEXT NOT NULL,
          "contactType" "ContactType" NOT NULL,
          "message" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "contact_events_pkey" PRIMARY KEY ("id")
        );
      `;

      // Add foreign key constraints
      await prisma.$executeRaw`
        ALTER TABLE "contact_events" ADD CONSTRAINT "contact_events_listingId_fkey" 
        FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      await prisma.$executeRaw`
        ALTER TABLE "contact_events" ADD CONSTRAINT "contact_events_contacterId_fkey" 
        FOREIGN KEY ("contacterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;

      console.log('✅ Created contact_events table with foreign keys');
    } else {
      console.log('ℹ️ contact_events table already exists');
    }

    console.log('✅ Listing updates migration completed');

  } catch (error) {
    console.error('❌ Error during listing updates migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateListingUpdates()
    .then(() => {
      console.log('🎉 Listing updates migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateListingUpdates };
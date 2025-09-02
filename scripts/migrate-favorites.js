const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateFavorites() {
  try {
    console.log('🔄 Starting favorites migration...');

    // Check if favorites table exists
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `;

    const tableExists = result[0]?.exists;

    if (tableExists) {
      console.log('✅ Favorites table already exists');
      return;
    }

    // Create favorites table
    await prisma.$executeRaw`
      CREATE TABLE "favorites" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "listingId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "favorites_userId_listingId_key" ON "favorites"("userId", "listingId");
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listingId_fkey" 
      FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('✅ Favorites table created successfully');
    console.log('✅ Foreign key constraints added');
    console.log('✅ Favorites migration completed');

  } catch (error) {
    console.error('❌ Error during favorites migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateFavorites()
    .then(() => {
      console.log('🎉 Favorites migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateFavorites };
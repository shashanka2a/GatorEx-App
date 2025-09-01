// Create OTP table directly using raw SQL
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createOTPTable() {
  console.log('🔢 Creating OTP Table via Prisma');
  console.log('=================================\n');

  try {
    console.log('🔌 Connecting to database...');
    
    // Create the table using raw SQL through Prisma
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "otp_codes" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('✅ OTP table created successfully!\n');
    
    // Verify table was created
    console.log('🔍 Verifying table structure...');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'otp_codes' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 OTP table structure:');
    result.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
    console.log('\n🎉 OTP system ready!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit /login-otp to test the OTP flow');
    console.log('3. Use a @ufl.edu or @gators.ufl.edu email address');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createOTPTable();
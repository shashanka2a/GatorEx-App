const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPaymentMethods() {
  try {
    console.log('🧪 Testing payment method functionality...');
    
    // Find a test user
    const user = await prisma.user.findFirst({
      where: {
        ufEmailVerified: true
      }
    });
    
    if (!user) {
      console.log('❌ No verified users found for testing');
      return;
    }
    
    console.log(`✅ Found test user: ${user.email}`);
    
    // Test updating payment methods
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        venmoId: 'test-venmo-user',
        cashappId: 'test-cashapp-user',
        zelleId: 'test@example.com',
        paymentQrCode: 'test-qr-code-data',
        preferredPaymentMethod: 'venmo'
      }
    });
    
    console.log('✅ Payment methods updated successfully');
    console.log('Payment methods:', {
      venmoId: updatedUser.venmoId,
      cashappId: updatedUser.cashappId,
      zelleId: updatedUser.zelleId,
      preferredPaymentMethod: updatedUser.preferredPaymentMethod
    });
    
    // Test fetching user with payment methods
    const userWithPayments = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        venmoId: true,
        cashappId: true,
        zelleId: true,
        paymentQrCode: true,
        preferredPaymentMethod: true
      }
    });
    
    console.log('✅ User profile with payment methods:', userWithPayments);
    
  } catch (error) {
    console.error('❌ Error testing payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentMethods();
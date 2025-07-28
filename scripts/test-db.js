const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible. Current user count: ${userCount}`);
    } catch (error) {
      console.log('⚠️  User table not accessible. You may need to run migrations.');
      console.log('   Run: npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if your database server is running');
    console.log('2. Verify DATABASE_URL in .env file');
    console.log('3. Check network connectivity');
    console.log('4. Ensure database exists and credentials are correct');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();

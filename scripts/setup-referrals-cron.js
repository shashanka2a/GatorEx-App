#!/usr/bin/env node

// Setup script for referrals system cron jobs
// This would typically be configured in your deployment platform (Vercel, Railway, etc.)

const cronJobs = [
  {
    name: 'Rebuild Weekly Leaderboard',
    schedule: '0 0 * * 1', // Every Monday at midnight
    endpoint: '/api/referrals/rebuild-leaderboard',
    description: 'Recalculates weekly leaderboard rankings'
  },
  {
    name: 'Cleanup Old Clicks',
    schedule: '0 2 * * 0', // Every Sunday at 2 AM
    endpoint: '/api/referrals/cleanup',
    description: 'Removes referral clicks older than 90 days'
  },
  {
    name: 'Process Monthly Prizes',
    schedule: '0 1 1 * *', // First day of month at 1 AM
    endpoint: '/api/referrals/monthly-prizes',
    description: 'Selects and grants monthly grand prizes'
  }
];

console.log('Referrals System Cron Jobs Configuration:');
console.log('==========================================');

cronJobs.forEach(job => {
  console.log(`\nJob: ${job.name}`);
  console.log(`Schedule: ${job.schedule}`);
  console.log(`Endpoint: ${job.endpoint}`);
  console.log(`Description: ${job.description}`);
  console.log(`\nExample curl command:`);
  console.log(`curl -X POST "${process.env.NEXTAUTH_URL || 'https://your-domain.com'}${job.endpoint}" \\`);
  console.log(`  -H "x-cron-secret: ${process.env.CRON_SECRET || 'your-cron-secret'}" \\`);
  console.log(`  -H "Content-Type: application/json"`);
});

console.log('\n\nEnvironment Variables Required:');
console.log('- CRON_SECRET: Secret key for authenticating cron requests');
console.log('- REFERRAL_SALT: Salt for hashing IP addresses and user agents');
console.log('- NEXTAUTH_URL: Your application URL');

console.log('\n\nNext Steps:');
console.log('1. Set up these cron jobs in your deployment platform');
console.log('2. Configure the required environment variables');
console.log('3. Test each endpoint manually first');
console.log('4. Monitor cron job execution logs');
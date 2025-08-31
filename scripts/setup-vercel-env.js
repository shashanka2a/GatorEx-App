#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Guide
 * 
 * This script provides instructions for setting up environment variables in Vercel.
 * Since Vercel doesn't automatically read .env.production files, you need to 
 * manually configure these in the Vercel dashboard.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 GatorEx Vercel Environment Setup Guide\n');

// Read the .env.production file
const envPath = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.production file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

console.log('📋 Environment Variables to Configure in Vercel:\n');
console.log('Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables\n');

// Critical variables that need real values
const criticalVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL', 
  'DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'SMTP_USER',
  'SMTP_PASS',
  'OPENAI_API_KEY',
  'WHATSAPP_ACCESS_TOKEN',
  'CLOUDINARY_API_SECRET'
];

console.log('🔑 CRITICAL VARIABLES (Replace placeholder values):');
criticalVars.forEach(key => {
  if (envVars[key]) {
    const value = envVars[key];
    const isPlaceholder = value.includes('your-') || value.includes('-here');
    const status = isPlaceholder ? '⚠️  NEEDS REAL VALUE' : '✅ Ready';
    console.log(`${key}=${value} ${status}`);
  }
});

console.log('\n📝 OTHER VARIABLES:');
Object.entries(envVars).forEach(([key, value]) => {
  if (!criticalVars.includes(key)) {
    console.log(`${key}=${value}`);
  }
});

console.log('\n🔧 Steps to Fix:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Add each variable above with the correct values');
console.log('3. Make sure to set them for "Production" environment');
console.log('4. Redeploy your application');

console.log('\n⚠️  SECURITY NOTE:');
console.log('Never commit real API keys to your repository!');
console.log('Always use Vercel\'s environment variable system for production secrets.');

console.log('\n🎯 Quick Fix for Current Error:');
console.log('The immediate issue is NEXTAUTH_SECRET. Add this to Vercel:');
console.log(`NEXTAUTH_SECRET=${envVars.NEXTAUTH_SECRET || 'gatorex-secret-key-2024'}`);
import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

// Base32 alphabet for referral codes
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const nanoid = customAlphabet(alphabet, 8);

export function generateReferralCode(): string {
  return nanoid();
}

export function hashWithSalt(value: string, salt: string): string {
  return crypto.createHash('sha256').update(value + salt).digest('hex');
}

export function hashIP(ip: string): string {
  const salt = process.env.REFERRAL_SALT || 'default-salt';
  return hashWithSalt(ip, salt);
}

export function hashUserAgent(ua: string): string {
  const salt = process.env.REFERRAL_SALT || 'default-salt';
  return hashWithSalt(ua, salt);
}

export function getISOWeek(date: Date = new Date()): string {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

export function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         '127.0.0.1';
}

export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || '';
}
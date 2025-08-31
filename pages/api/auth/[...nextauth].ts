import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import nodemailer from 'nodemailer';
import { prisma } from '../../../src/lib/db/prisma';

// UF email domains
const UF_DOMAINS = ['ufl.edu', 'gators.ufl.edu'];

function isValidUFEmail(email: string): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  return UF_DOMAINS.includes(domain);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_USER,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // Check if email is from UF domain
        if (!isValidUFEmail(email)) {
          throw new Error('Only UF email addresses (@ufl.edu or @gators.ufl.edu) are allowed');
        }

        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server);
        
        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to GatorEx 🐊`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        });
        
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
        }
      },
    }),
  ],
  pages: {
    signIn: '/verify',
    verifyRequest: '/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow UF emails
      if (user.email && !isValidUFEmail(user.email)) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        // Fetch fresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, ufEmailVerified: true, profileCompleted: true }
        });
        
        session.user.id = user.id;
        session.user.ufEmailVerified = dbUser?.ufEmailVerified || false;
        session.user.profileCompleted = dbUser?.profileCompleted || false;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch fresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { ufEmailVerified: true, profileCompleted: true }
        });
        token.ufEmailVerified = dbUser?.ufEmailVerified || false;
        token.profileCompleted = dbUser?.profileCompleted || false;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (user.email && isValidUFEmail(user.email)) {
        // Mark UF email as verified since they clicked the magic link
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            ufEmailVerified: true
          }
        });
      }
    },
  },
  session: {
    strategy: 'database',
  },
};

export default NextAuth(authOptions);

// Email HTML template
function html({ url, host }: { url: string; host: string; email: string }) {

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to GatorEx</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #FF7A00, #0021FF); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🐊 GatorEx</h1>
    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">UF Student Marketplace</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #FF7A00; margin-top: 0;">Sign in to GatorEx</h2>
    
    <p>Hi there! 👋</p>
    
    <p>Click the button below to sign in to your GatorEx account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" 
         style="background: linear-gradient(135deg, #FF7A00, #0021FF); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold; 
                display: inline-block;
                box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3);">
        🔐 Sign In to GatorEx
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color: #FF7A00; word-break: break-all;">${url}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0021FF; margin-top: 0; font-size: 16px;">🔒 Secure Sign-In</h3>
      <p style="margin: 10px 0; font-size: 14px; color: #666;">
        This magic link will sign you in securely without needing a password. 
        The link expires in 24 hours and can only be used once.
      </p>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      If you didn't request this sign-in link, you can safely ignore this email.<br>
      Someone may have typed your email address by mistake.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>Go Gators! 🐊 | GatorEx - Built by students, for students</p>
  </div>
</body>
</html>
`;
}

// Email text template
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to GatorEx (${host})\n\n${url}\n\n`;
}
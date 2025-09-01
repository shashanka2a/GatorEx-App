import { supabase } from '../supabase';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">🐊 GatorEx</h1>
          <p style="color: #666; margin: 5px 0;">University of Florida Marketplace</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Login Code</h2>
          <p style="color: #666; margin-bottom: 25px;">
            Enter this 6-digit code to sign in to GatorEx:
          </p>
          
          <div style="background: white; border: 2px solid #FF6B35; border-radius: 8px; 
                      padding: 20px; margin: 20px 0; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #FF6B35; 
                         letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code expires in 10 minutes for security.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p>© 2024 GatorEx - University of Florida Student Marketplace</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `GatorEx <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your GatorEx Login Code 🐊',
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

// Store OTP in database (using Supabase)
export async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error } = await supabase
      .from('otp_codes')
      .upsert({
        email,
        code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        created_at: new Date().toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Failed to store OTP:', error);
    return false;
  }
}

// Verify OTP
export async function verifyOTP(email: string, inputCode: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get the latest OTP for this email
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: 'No OTP found. Please request a new code.' };
    }

    // Check if expired
    if (new Date() > new Date(data.expires_at)) {
      return { success: false, message: 'Code expired. Please request a new code.' };
    }

    // Check attempts
    if (data.attempts >= 3) {
      return { success: false, message: 'Too many attempts. Please request a new code.' };
    }

    // Verify code
    if (data.code !== inputCode) {
      // Increment attempts
      await supabase
        .from('otp_codes')
        .update({ attempts: data.attempts + 1 })
        .eq('id', data.id);

      return { success: false, message: 'Invalid code. Please try again.' };
    }

    // Success - delete the used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', data.id);

    return { success: true, message: 'Code verified successfully!' };
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return { success: false, message: 'Verification failed. Please try again.' };
  }
}
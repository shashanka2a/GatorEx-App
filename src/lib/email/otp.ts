import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendOTPEmail(email: string, otpCode: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your GatorEx verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF7A00 0%, #FF9500 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🐊 GatorEx</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">UF Student Marketplace</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your UF Email</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Welcome to GatorEx! Please use the verification code below to complete your registration:
          </p>
          
          <div style="background: #f8f9fa; border: 2px dashed #FF7A00; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #FF7A00; letter-spacing: 4px; font-family: monospace;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This code will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.
          </p>
          
          <div style="background: #e8f4fd; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              <strong>Security Note:</strong> GatorEx stores your UF email to verify student access and ensure a safe marketplace for the UF community.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            GatorEx - University of Florida Student Marketplace<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}
// Email provider implementations for production
import nodemailer from 'nodemailer';

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string, text: string): Promise<void>;
}

// Gmail SMTP Provider
export class GmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"GatorEx" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
  }
}

// Factory function to get the appropriate provider
export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  switch (provider.toLowerCase()) {
    case 'gmail':
    default:
      return new GmailProvider();
  }
}
// Email provider implementations for production
import nodemailer from 'nodemailer';

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string, text: string): Promise<void>;
}

// Gmail SMTP Provider
export class GmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
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

// SendGrid Provider
export class SendGridProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    // Dynamic import to avoid bundling issues
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!);

    await sgMail.default.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@gatorex.com',
      subject,
      html,
      text,
    });
  }
}

// AWS SES Provider
export class SESProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    // Dynamic import to avoid bundling issues
    const AWS = await import('aws-sdk');
    
    const ses = new AWS.SES({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Source: process.env.SES_FROM_EMAIL || 'noreply@gatorex.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
          Text: { Data: text },
        },
      },
    };

    await ses.sendEmail(params).promise();
  }
}

// Factory function to get the appropriate provider
export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  switch (provider.toLowerCase()) {
    case 'sendgrid':
      return new SendGridProvider();
    case 'ses':
    case 'aws':
      return new SESProvider();
    case 'gmail':
    default:
      return new GmailProvider();
  }
}
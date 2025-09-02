import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '../src/components/ui/Logo';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - GatorEx</title>
        <meta name="description" content="GatorEx Privacy Policy and Data Protection" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <Logo className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose max-w-none">
              <h2>1. Information We Collect</h2>
              <h3>Personal Information</h3>
              <ul>
                <li>UF email address (for verification and communication)</li>
                <li>Name and profile information</li>
                <li>Phone number (optional, for buyer-seller communication)</li>
                <li>Listing information and photos</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>App usage patterns and preferences</li>
                <li>Device information and IP address</li>
                <li>Communication logs for support purposes</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <ul>
                <li>Verify your UF student status</li>
                <li>Facilitate marketplace transactions</li>
                <li>Send important service notifications</li>
                <li>Improve our services and user experience</li>
                <li>Ensure platform safety and prevent fraud</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <h3>With Other Users</h3>
              <p>
                Your contact information (email and phone) is only shared with authenticated UF students when they express 
                interest in your listings. Your name and verification status are visible in your listings.
              </p>

              <h3>We Do Not Share</h3>
              <ul>
                <li>Your information with third-party advertisers</li>
                <li>Personal data with non-UF entities</li>
                <li>Contact details without your consent</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. This includes:
              </p>
              <ul>
                <li>Encrypted data transmission</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits</li>
                <li>Limited access to personal data</li>
              </ul>

              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Control who can see your contact information</li>
                <li>Opt out of non-essential communications</li>
              </ul>

              <h2>6. Data Retention</h2>
              <p>
                We retain your information only as long as necessary to provide our services or as required by law. 
                When you delete your account, we remove your personal information within 30 days.
              </p>

              <h2>7. FERPA Compliance</h2>
              <p>
                As a platform serving UF students, we respect educational privacy rights under FERPA. 
                We do not share educational records or personally identifiable information from education records.
              </p>

              <h2>8. Cookies and Tracking</h2>
              <p>
                We use essential cookies for authentication and service functionality. We do not use tracking cookies 
                for advertising purposes.
              </p>

              <h2>9. Third-Party Services</h2>
              <p>
                We may use third-party services for essential functions (email delivery, image hosting). 
                These services are bound by privacy agreements and cannot use your data for their own purposes.
              </p>

              <h2>10. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy to reflect changes in our practices or legal requirements. 
                We will notify users of significant changes via email or app notification.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or your personal information, 
                please contact us through the app or our support channels.
              </p>

              <h2>12. Age Requirements</h2>
              <p>
                Our service is intended for users 18 and older. If you are under 18, you must have parental consent to use GatorEx.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Link 
                href="/verify" 
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
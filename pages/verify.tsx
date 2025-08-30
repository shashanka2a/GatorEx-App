import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../src/components/ui/button';
import { Card } from '../src/components/ui/card';
import { Logo } from '../src/components/ui/Logo';

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Email verified! Your listing will be published shortly.');
        setTimeout(() => router.push('/'), 3000);
      } else {
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Verify Your UF Email</h1>
          <p className="text-gray-600 mt-2">
            Enter your UF email to publish your WhatsApp listing
          </p>
        </div>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UF Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@ufl.edu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
              required
              pattern=".*@ufl\.edu$"
              title="Please enter a valid UF email address"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-uf-orange hover:bg-uf-orange/90"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
        
        {message && (
          <div className={`text-center p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
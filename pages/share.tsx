import { useState } from 'react';
import { generateShareableContent, generateQRCodeData } from '../src/lib/whatsapp/sharing';

export default function SharePage() {
  const [intent, setIntent] = useState<'sell' | 'buy' | undefined>(undefined);
  
  const shareContent = generateShareableContent(intent);
  const qrData = generateQRCodeData(intent);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🐊 Share GatorEx Bot
          </h1>
          <p className="text-gray-600">
            Help fellow Gators discover safe campus trading
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => setIntent(undefined)}
            className={`w-full p-3 rounded-lg border-2 transition-colors ${
              intent === undefined 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            🐊 General Invite
          </button>
          
          <button
            onClick={() => setIntent('sell')}
            className={`w-full p-3 rounded-lg border-2 transition-colors ${
              intent === 'sell' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            🏷️ Invite to Sell
          </button>
          
          <button
            onClick={() => setIntent('buy')}
            className={`w-full p-3 rounded-lg border-2 transition-colors ${
              intent === 'buy' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            🛒 Invite to Buy
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">{shareContent.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{shareContent.message}</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(shareContent.message)}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Copy Message
            </button>
            
            <button
              onClick={() => copyToClipboard(shareContent.link)}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-xs text-gray-500">QR Code</span>
              {/* TODO: Add actual QR code generation */}
            </div>
            <p className="text-xs text-gray-500">Scan to open bot</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href={shareContent.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            🚀 Try Bot Now
          </a>
        </div>
      </div>
    </div>
  );
}
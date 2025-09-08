import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  images?: string[];
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'sell' | 'general';
}

export default function ChatBot({ isOpen, onClose, mode }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [listingData, setListingData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    condition: '',
    images: [] as string[]
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (mode === 'sell') {
        addBotMessage("Let's start with a photo 📸. Please upload at least one image of your item.");
        setStep(2);
      } else {
        addBotMessage("Hi! I'm GatorBot 🐊 How can I help you today?");
      }
    }
  }, [isOpen, mode, messages.length]);

  const addBotMessage = (text: string, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string, images?: string[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
      images
    }]);
  };

  const handleSellFlow = async (userInput: string) => {
    switch (step) {
      case 0:
        addBotMessage('Please upload a photo to begin.');
        setStep(2);
        break;

      case 1: {
        const input = userInput.trim();
        const dashSplit = input.split(/[-–—]\s*/);
        let title = listingData.title.trim();
        let priceText = '';
        if (dashSplit.length >= 2) {
          title = dashSplit[0].trim();
          priceText = dashSplit.slice(1).join(' ').trim();
        } else {
          priceText = input;
        }

        const clean = priceText.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(clean);
        if (isNaN(parsed) || parsed <= 0) {
          addBotMessage('❌ Price looks invalid. Please reply with just the price (e.g., 25 or 50.99).');
          return;
        }

        if (!title || title.length < 3 || title.length > 100) {
          addBotMessage('❌ Title looks off. Please send: Title — $Price (e.g., "iPad Air — $280").');
          return;
        }

        setListingData(prev => ({ ...prev, title, price: `$${parsed.toFixed(2)}` }));
        addBotMessage(`✅ Saved: ${title} — $${parsed.toFixed(2)}`);
        addBotMessage('Tell me a short description (one message).');
        setStep(2);
        break;
      }

      case 2:
        setListingData(prev => ({ ...prev, description: userInput }));
        addBotMessage('Now upload at least one photo.');
        setStep(3);
        break;

      case 3:
        if (listingData.images.length === 0) {
          addBotMessage('I still need a photo. Please upload one.');
          return;
        }
        addBotMessage(`Perfect! Let me create your listing:\n\n📦 **${listingData.title}**\n💰 **${listingData.price}**\n📝 **${listingData.description}**\n\nPublish now? Type "yes" to confirm or "edit" to change.`);
        setStep(4);
        break;
      
      case 4: // Confirmation
        if (userInput.toLowerCase() === 'yes') {
          // Actually create the listing
          setIsTyping(true);
          try {
            const response = await fetch('/api/chat/bot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create_listing',
                listingData: listingData
              })
            });

            const data = await response.json();
            
            if (response.ok) {
              addBotMessage(`🎉 Awesome! Your listing for "${listingData.title}" is now live on GatorEx! \n\nUF students can now see and contact you about your item. You'll get notifications when someone is interested.\n\nWant to create another listing?`, 500);
            } else {
              addBotMessage(`Sorry, there was an error creating your listing: ${data.error}. Please try again or contact support.`, 500);
            }
          } catch (error) {
            addBotMessage(`Sorry, there was a network error. Please check your connection and try again.`, 500);
          }
          
          setStep(0);
          setListingData({
            title: '',
            price: '',
            description: '',
            category: '',
            condition: '',
            images: []
          });
        } else if (userInput.toLowerCase() === 'edit') {
          addBotMessage(`No problem! What would you like to change? You can say things like "change price", "update description", or "change title".`);
          setStep(5);
        } else {
          addBotMessage(`Please type "yes" to publish your listing or "edit" to make changes.`);
        }
        break;
      
      case 5: // Edit mode
        addBotMessage(`I understand you want to make changes. For now, let's start over with your listing. What would you like to sell?`);
        setStep(0);
        setListingData({
          title: '',
          price: '',
          description: '',
          category: '',
          condition: '',
          images: []
        });
        break;
      
      default:
        addBotMessage(`I'm here to help you create listings! What would you like to sell?`);
        setStep(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addUserMessage(inputText);
    const userInput = inputText;
    setInputText('');

    if (mode === 'sell') {
      handleSellFlow(userInput);
    } else {
      // General chat mode
      addBotMessage(`Thanks for your message! I'm currently focused on helping with listings. Would you like to create a listing?`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you'd upload these to your server/cloud storage
    const imageUrls: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        imageUrls.push(result);
        setListingData(prev => { 
          // Infer title from filename if missing
          let nextTitle = prev.title;
          if (!nextTitle && file.name) {
            const base = file.name.replace(/\.[^/.]+$/, '');
            const cleaned = base
              .replace(/[._-]+/g, ' ')
              .replace(/\b(img|image|photo|pic|whatsapp|screenshot|edited)\b/gi, '')
              .replace(/\b\d{8,}\b/g, '')
              .replace(/\s{2,}/g, ' ')
              .trim();
            if (cleaned && cleaned.length >= 3) {
              nextTitle = cleaned;
            }
          }

          return ({ 
            ...prev, 
            title: nextTitle || prev.title,
            images: [...prev.images, result] 
          });
        });
        
        if (imageUrls.length === files.length) {
          addUserMessage(`Uploaded ${files.length} image(s)`, imageUrls);
          if (step === 2) {
            // After description earlier, we now expect Title + Price
            addBotMessage('✅ Photo received. Now send: Title — $Price (e.g., "AirPods Pro — $120").');
            setStep(1);
          } else if (step === 3) {
            addBotMessage('✅ Photo received.');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold">GatorBot</h3>
              <p className="text-xs opacity-90">Your listing assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.isBot
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-orange-500 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                {message.images && message.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {message.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, ArrowLeft, Eye, CheckCircle } from 'lucide-react';
import DraftCard from './DraftCard';
import { useRouter } from 'next/router';
import { compressImage, getImageSize } from '../../lib/utils/imageCompression';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  images?: string[];
  buttons?: Array<{
    text: string;
    value: string;
  }>;
}

interface ListingDraft {
  title: string;
  price: number | null;
  images: string[];
  category: string;
  condition: string;
  meetingSpot: string;
  description: string;
}

interface UserStats {
  dailyListings: number;
  totalLiveListings: number;
  canCreateListing: boolean;
  rateLimitMessage?: string;
}

interface SellChatWizardProps {
  userStats: UserStats;
  userId?: string;
}

const CATEGORIES = [
  'Electronics', 'Textbooks', 'Furniture', 'Clothing', 'Sports & Recreation',
  'Home & Garden', 'Transportation', 'Services', 'Other'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const MEETING_SPOTS = [
  'Reitz Union', 'Library West', 'Turlington Plaza', 'Student Recreation Center',
  'Broward Dining', 'Gator Corner Dining Center', 'Plaza of the Americas',
  'Marston Science Library', 'Other (specify in description)'
];

export default function SellChatWizard({ userStats, userId }: SellChatWizardProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [draft, setDraft] = useState<ListingDraft>({
    title: '',
    price: null,
    images: [],
    category: '',
    condition: '',
    meetingSpot: '',
    description: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = useCallback((text: string, delay = 1000, buttons?: Array<{text: string, value: string}>) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date(),
        buttons
      }]);
      setIsTyping(false);
    }, delay);
  }, []);

  const loadDraft = useCallback(() => {
    if (!userId) return;
    
    try {
      const savedDraft = localStorage.getItem(`gatorex_draft_${userId}`);
      const savedStep = localStorage.getItem(`gatorex_draft_step_${userId}`);
      
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setDraft(parsedDraft);
        setStep(parseInt(savedStep || '0'));
        addBotMessage("I found your saved draft! Let's continue where we left off.");
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [userId, addBotMessage, setDraft, setStep]);

  useEffect(() => {
    // Load existing draft if any
    loadDraft();
    
    // Initialize conversation
    if (!userStats.canCreateListing) {
      addBotMessage(userStats.rateLimitMessage || "You've reached your listing limit.");
    } else {
      addBotMessage("Hi! I'm GatorBot 🐊 Let's create your listing step by step. What would you like to sell?");
    }
  }, [userStats.canCreateListing, userStats.rateLimitMessage, loadDraft, addBotMessage]);

  const saveDraft = () => {
    if (!userId) return;
    
    try {
      localStorage.setItem(`gatorex_draft_${userId}`, JSON.stringify(draft));
      localStorage.setItem(`gatorex_draft_step_${userId}`, step.toString());
    } catch (error) {
      console.error('Error saving draft:', error);
    }
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

  const validatePrice = (priceText: string): number | null => {
    // Remove $ and any non-numeric characters except decimal point
    const cleanPrice = priceText.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanPrice);
    
    if (isNaN(price) || price <= 0 || price > 10000) {
      return null;
    }
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  };

  const handleStepFlow = async (userInput: string) => {
    // Check for restart command
    if (userInput.toLowerCase().trim() === 'restart' || userInput.toLowerCase().trim() === 'start over') {
      setStep(0);
      setDraft({
        title: '',
        price: null,
        images: [],
        category: '',
        condition: '',
        meetingSpot: '',
        description: ''
      });
      addBotMessage("Let's start over! What would you like to sell?");
      return;
    }

    switch (step) {
      case 0: // Item title
        if (userInput.trim().length < 3) {
          addBotMessage("Please provide a more descriptive title (at least 3 characters).");
          return;
        }
        if (userInput.trim().length > 100) {
          addBotMessage("Title is too long. Please keep it under 100 characters.");
          return;
        }
        
        setDraft(prev => ({ ...prev, title: userInput.trim() }));
        addBotMessage(`Great! "${userInput.trim()}" sounds good. Now, what's your asking price? Please enter a number (e.g., 25, 50.99).`);
        setStep(1);
        break;
      
      case 1: // Price
        const price = validatePrice(userInput);
        if (price === null) {
          addBotMessage('Please enter a valid price between $0.01 and $10,000 (e.g., "25" or "50.99"). No "DM for price" - buyers need to see the price upfront!');
          return;
        }
        
        setDraft(prev => ({ ...prev, price }));
        addBotMessage(`Perfect! $${price.toFixed(2)} it is. Now I need at least one photo of your item. Click the upload button to add photos.`);
        setStep(2);
        break;
      
      case 2: // Photos (handled by file upload)
        if (draft.images.length === 0) {
          addBotMessage("Please upload at least one photo using the upload button before continuing.");
          return;
        }
        handleOptionalFields();
        break;
      
      case 3: // Category
        if (!CATEGORIES.includes(userInput)) {
          const categoryButtons = CATEGORIES.map(category => ({
            text: category,
            value: category
          }));
          addBotMessage(`Please choose one of these categories:`, 1000, categoryButtons);
          return;
        }
        
        setDraft(prev => ({ ...prev, category: userInput }));
        const conditionButtons = CONDITIONS.map(condition => ({
          text: condition,
          value: condition
        }));
        
        addBotMessage(`Got it! Now, what's the condition of your ${draft.title}?`, 1000, conditionButtons);
        setStep(4);
        break;
      
      case 4: // Condition
        if (!CONDITIONS.includes(userInput)) {
          const conditionButtons = CONDITIONS.map(condition => ({
            text: condition,
            value: condition
          }));
          addBotMessage(`Please choose one of these conditions:`, 1000, conditionButtons);
          return;
        }
        
        setDraft(prev => ({ ...prev, condition: userInput }));
        const meetingSpotButtons = MEETING_SPOTS.map(spot => ({
          text: spot,
          value: spot
        }));
        meetingSpotButtons.push({ text: 'Other (Custom)', value: 'Other' });
        
        addBotMessage(`Great! Where would you like to meet buyers? Choose from these popular campus locations:`, 1000, meetingSpotButtons);
        setStep(5);
        break;
      
      case 5: // Meeting spot
        // Make meeting spot validation more flexible
        const normalizedInput = userInput.toLowerCase().trim();
        let matchedSpot = null;
        
        // Check if input is a number (1-9)
        const spotNumber = parseInt(normalizedInput);
        if (!isNaN(spotNumber) && spotNumber >= 1 && spotNumber <= MEETING_SPOTS.length) {
          matchedSpot = MEETING_SPOTS[spotNumber - 1];
        } else {
          // Check for text match
          matchedSpot = MEETING_SPOTS.find(spot => 
            spot.toLowerCase().includes(normalizedInput) || 
            normalizedInput.includes(spot.toLowerCase())
          );
        }
        
        if (!matchedSpot && normalizedInput !== 'other') {
          const meetingSpotButtons = MEETING_SPOTS.map(spot => ({
            text: spot,
            value: spot
          }));
          meetingSpotButtons.push({ text: 'Other (Custom)', value: 'Other' });
          addBotMessage(`Please choose one of these meeting spots:`, 1000, meetingSpotButtons);
          return;
        }
        
        setDraft(prev => ({ ...prev, meetingSpot: matchedSpot || userInput }));
        addBotMessage(`Perfect! Finally, add a description with any additional details about your ${draft.title}. Include condition details, why you're selling, etc.`);
        setStep(6);
        break;
      
      case 6: // Description
        if (userInput.trim().length < 10) {
          addBotMessage("Please provide a more detailed description (at least 10 characters).");
          return;
        }
        if (userInput.trim().length > 1000) {
          addBotMessage("Description is too long. Please keep it under 1000 characters.");
          return;
        }
        
        setDraft(prev => ({ ...prev, description: userInput.trim() }));
        addBotMessage(`Excellent! Your listing is complete. You can preview it and publish when ready!`);
        setStep(7);
        break;
      
      default:
        addBotMessage("Your listing is ready! Use the preview and publish buttons.");
    }
    
    // Auto-save draft after each step
    setTimeout(saveDraft, 500);
  };

  const handleOptionalFields = () => {
    const categoryButtons = CATEGORIES.map(category => ({
      text: category,
      value: category
    }));
    
    addBotMessage(`Great! I have the required info. Now let's add some optional details to make your listing better. What category best describes your ${draft.title}?`, 1000, categoryButtons);
    setStep(3);
  };

  const handleButtonClick = (value: string) => {
    addUserMessage(value);
    handleStepFlow(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userStats.canCreateListing) return;

    addUserMessage(inputText);
    const userInput = inputText.trim();
    setInputText('');

    handleStepFlow(userInput);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images
    const maxImages = 5;
    const currentImages = draft.images.length;
    const availableSlots = maxImages - currentImages;
    
    if (availableSlots <= 0) {
      addBotMessage(`You can only upload up to ${maxImages} images. Please remove some images first.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const newImages: string[] = [];
    
    addBotMessage(`Processing ${filesToProcess.length} image(s)... Please wait.`);

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for original file
          addBotMessage(`Image ${i + 1} is too large (${Math.round(file.size / 1024 / 1024)}MB). Please use images under 10MB.`);
          continue;
        }

        try {
          // Compress the image
          const compressedImage = await compressImage(file, 800, 600, 0.8);
          const compressedSize = getImageSize(compressedImage);
          
          // Check if compressed image is still too large (500KB limit)
          if (compressedSize > 500 * 1024) {
            // Try with lower quality
            const moreCompressed = await compressImage(file, 600, 450, 0.6);
            const finalSize = getImageSize(moreCompressed);
            
            if (finalSize > 500 * 1024) {
              addBotMessage(`Image ${i + 1} is still too large after compression. Please use a smaller image.`);
              continue;
            }
            newImages.push(moreCompressed);
          } else {
            newImages.push(compressedImage);
          }
        } catch (compressionError) {
          console.error('Image compression error:', compressionError);
          addBotMessage(`Failed to process image ${i + 1}. Please try a different image.`);
        }
      }

      if (newImages.length > 0) {
        setDraft(prev => {
          // Filter out any duplicate images by comparing data URLs
          const existingImages = prev.images;
          const uniqueNewImages = newImages.filter(newImg => 
            !existingImages.some(existingImg => existingImg === newImg)
          );
          
          return { 
            ...prev, 
            images: [...existingImages, ...uniqueNewImages] 
          };
        });
        
        // Debug log to check for duplicates
        console.log('New images being added:', newImages.length);
        console.log('Total images after upload:', draft.images.length + newImages.length);
        
        addUserMessage(`Uploaded ${newImages.length} image(s)`, newImages);
        
        if (step === 2 && draft.images.length === 0) {
          // First images uploaded, move to next step
          setTimeout(() => {
            addBotMessage(`Perfect! ${newImages.length} photo(s) uploaded and compressed. You now have all the required information. Let's add some optional details to make your listing even better!`);
            handleOptionalFields();
          }, 1000);
        } else {
          addBotMessage(`Great! ${draft.images.length + newImages.length} total photos uploaded and compressed. ${step === 2 ? "Ready to continue!" : "Photos updated!"}`);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      addBotMessage("There was an error processing your images. Please try again.");
    }
  };

  const handlePublish = async () => {
    if (!canPublish()) return;
    
    // Deduplicate images before publishing
    const uniqueImages = draft.images.filter((image, index, self) => 
      self.indexOf(image) === index
    );
    
    // Validate draft before sending
    if (!draft.title || !draft.price || uniqueImages.length === 0) {
      addBotMessage("Missing required information. Please complete all fields before publishing.");
      return;
    }
    
    // Check total payload size
    const totalImageSize = uniqueImages.reduce((total, img) => total + getImageSize(img), 0);
    const totalSizeMB = totalImageSize / (1024 * 1024);
    
    if (totalSizeMB > 2) { // 2MB total limit
      addBotMessage(`Your images are too large (${totalSizeMB.toFixed(1)}MB total). Please remove some images or use smaller ones.`);
      return;
    }
    
    console.log('Publishing draft:', { ...draft, images: `${uniqueImages.length} unique images (${totalSizeMB.toFixed(1)}MB)` });
    
    setIsPublishing(true);
    try {
      const response = await fetch('/api/sell/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing: { ...draft, images: uniqueImages } })
      });

      if (response.status === 413) {
        addBotMessage("Your listing is too large. Please reduce the number of images or use smaller images.");
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        // Clear draft from localStorage
        if (userId) {
          localStorage.removeItem(`gatorex_draft_${userId}`);
          localStorage.removeItem(`gatorex_draft_step_${userId}`);
        }
        
        addBotMessage(`�� Congratulations! Your listing "${draft.title}" is now live on GatorEx!\n\nListing ID: ${data.listing.id}\nYour item will automatically expire in 14 days.\n\nRedirecting you to the marketplace to see your listing...`);
        
        // Reset for new listing
        setDraft({
          title: '',
          price: null,
          images: [],
          category: '',
          condition: '',
          meetingSpot: '',
          description: ''
        });
        setStep(0);
        setShowPreview(false);
        
        // Redirect to buy page after 3 seconds
        setTimeout(() => {
          router.push('/buy');
        }, 3000);
      } else {
        console.error('Publish error:', data);
        addBotMessage(`Sorry, there was an error publishing your listing: ${data.error}. Please try again.`);
      }
    } catch (error) {
      console.error('Network error:', error);
      addBotMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = () => {
    const uniqueImages = draft.images.filter((image, index, self) => 
      self.indexOf(image) === index
    );
    return draft.title && draft.price && uniqueImages.length > 0;
  };

  const isComplete = () => {
    // For the main wizard, we can still show the enhanced publish button when all fields are complete
    return canPublish() && draft.category && draft.condition && draft.meetingSpot && draft.description;
  };

  if (!userStats.canCreateListing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rate Limited</h1>
          <p className="text-gray-600 mb-6">{userStats.rateLimitMessage}</p>
          <button
            onClick={() => router.push('/buy')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Items Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto">
        {/* Header - Made Sticky */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b p-4 flex items-center justify-between backdrop-blur-sm bg-white/95">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/buy')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Listing</h1>
              <p className="text-sm text-gray-600">Chat with GatorBot to list your item</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {canPublish() && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
            )}
            
            {canPublish() && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <CheckCircle size={16} />
                <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white pt-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.isBot
                    ? 'bg-white text-gray-800 shadow-md border border-gray-100'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                {message.images && message.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {message.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.buttons.map((button, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleButtonClick(button.value)}
                        className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 text-sm rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        {button.text}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-2">
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
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-xs text-gray-500 ml-2">GatorBot is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
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
              className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-sm"
            >
              <Upload size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 p-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm focus:shadow-md"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Draft Card Sidebar */}
      {showPreview && canPublish() && (
        <div className="w-80 bg-white border-l shadow-lg">
          <DraftCard draft={draft} onPublish={handlePublish} isPublishing={isPublishing} />
        </div>
      )}
    </div>
  );
}
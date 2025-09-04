import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, ArrowLeft, Eye, CheckCircle, RotateCcw, Clock } from 'lucide-react';
import DraftCard from './DraftCard';
import { useRouter } from 'next/router';
import { compressImage, getImageSize } from '../../lib/utils/imageCompression';
import { DraftManager } from '../../lib/drafts/draftManager';
import { Message, ListingDraft, UserStats } from '../../lib/types/listing';
import { useDraftAutoSave } from '../../hooks/useDraftAutoSave';
import DraftStatusIndicator from './DraftStatusIndicator';
import SmartListingInput from './SmartListingInput';
import AISuggestions from './AISuggestions';
import ImageFirstFlow from './ImageFirstFlow';

// Types moved to separate file

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
  const [showDraftResume, setShowDraftResume] = useState(false);
  const [availableDraft, setAvailableDraft] = useState<any>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [showImageFirst, setShowImageFirst] = useState(true);
  
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
  const draftManagerRef = useRef<DraftManager | null>(null);

  // Enhanced auto-save hook
  const { save: saveDraftHook, isOnline, lastSaved } = useDraftAutoSave({
    userId: userId || '',
    draft,
    step,
    messages,
    enabled: !!userId && !showDraftResume
  });

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

  // Initialize draft manager
  useEffect(() => {
    if (userId) {
      draftManagerRef.current = new DraftManager(userId);
      
      // Cleanup on unmount
      return () => {
        if (draftManagerRef.current) {
          draftManagerRef.current.cleanup();
        }
      };
    }
  }, [userId]);

  const loadDraft = useCallback(async () => {
    if (!userId || !draftManagerRef.current) {
      setIsLoadingDraft(false);
      return;
    }
    
    try {
      const { session, messages: savedMessages, shouldResume } = await draftManagerRef.current.loadMostRecentDraft();
      
      if (shouldResume && session) {
        setAvailableDraft({
          session,
          messages: savedMessages,
          timeSince: new Date(session.lastSaved).toLocaleString()
        });
        setShowDraftResume(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    } finally {
      setIsLoadingDraft(false);
    }
  }, [userId]);

  const resumeDraft = useCallback(() => {
    if (!availableDraft || !draftManagerRef.current) return;
    
    const { session, messages: savedMessages } = availableDraft;
    
    setDraft(session.draft);
    setStep(session.currentStep);
    setMessages(savedMessages);
    setShowDraftResume(false);
    
    // Continue conversation from where they left off
    const stepMessages = {
      0: "Welcome back! Let's continue with your listing. What would you like to sell?",
      1: `Great! I see you're selling "${session.draft.title}". What's your asking price?`,
      2: `Perfect! $${session.draft.price} for "${session.draft.title}". Now let's add some photos.`,
      3: "Excellent! Now let's categorize your item. What category best describes it?",
      4: "Got it! What's the condition of your item?",
      5: "Great! Where would you like to meet buyers?",
      6: "Perfect! Finally, add a description with any additional details.",
      7: "Your listing is ready! You can preview and publish when ready."
    };
    
    const welcomeMessage = stepMessages[session.currentStep as keyof typeof stepMessages] || 
      "Welcome back! Let's continue where we left off.";
    
    addBotMessage(welcomeMessage, 500);
  }, [availableDraft, addBotMessage]);

  const startFresh = useCallback(() => {
    setShowDraftResume(false);
    setAvailableDraft(null);
    // Initialize new session
    if (draftManagerRef.current) {
      draftManagerRef.current.cleanupOldDrafts();
    }
  }, []);

  // AI parsing handlers
  const handleTextParsed = useCallback((parsed: any) => {
    setDraft(prev => ({
      ...prev,
      title: parsed.title || prev.title,
      price: parsed.price !== null ? parsed.price : prev.price,
      category: parsed.category || prev.category,
      condition: parsed.condition || prev.condition,
      description: parsed.description || prev.description
    }));

    setAiSuggestions(parsed.suggestions || []);
    setAiConfidence(parsed.confidence || 0);
    setShowImageFirst(false);

    // Add bot message about successful parsing
    addBotMessage(
      `Great! I've extracted the following from your description:\n\n` +
      `📱 Title: ${parsed.title}\n` +
      `💰 Price: ${parsed.price ? `$${parsed.price}` : 'Not specified'}\n` +
      `📂 Category: ${parsed.category}\n` +
      `⭐ Condition: ${parsed.condition}\n\n` +
      `${parsed.confidence >= 0.8 ? 'I\'m confident about this parsing!' : 'Please review and adjust if needed.'} ` +
      `Now let's add some photos to complete your listing.`
    );

    // Skip to photo step
    setStep(2);
  }, [addBotMessage]);

  const handleImageAnalyzed = useCallback((analysis: any) => {
    setDraft(prev => ({
      ...prev,
      title: analysis.title || prev.title,
      category: analysis.category || prev.category,
      condition: analysis.condition || prev.condition,
      description: analysis.description || prev.description,
      images: analysis.originalImage ? [analysis.originalImage, ...prev.images] : prev.images
    }));

    setAiSuggestions(analysis.suggestions || []);
    setAiConfidence(analysis.confidence || 0);
    setShowImageFirst(false);

    // Add bot message about successful analysis
    const detectedInfo = [];
    if (analysis.title) detectedInfo.push(`📱 Item: ${analysis.title}`);
    if (analysis.category) detectedInfo.push(`📂 Category: ${analysis.category}`);
    if (analysis.condition) detectedInfo.push(`⭐ Condition: ${analysis.condition}`);
    if (analysis.detectedText && analysis.detectedText.length > 0) {
      detectedInfo.push(`📝 Text found: ${analysis.detectedText.join(', ')}`);
    }

    addBotMessage(
      `Excellent! I've analyzed your photo and detected:\n\n` +
      detectedInfo.join('\n') + '\n\n' +
      `${analysis.confidence >= 0.7 ? 'The image analysis looks good!' : 'Please review the details and adjust if needed.'} ` +
      `What's your asking price for this item?`
    );

    // Skip to price step
    setStep(1);
  }, [addBotMessage]);

  const handleImageFirstComplete = useCallback((data: any) => {
    setDraft(prev => ({
      ...prev,
      title: data.title,
      price: data.price > 0 ? data.price : prev.price,
      category: data.category,
      condition: data.condition,
      description: data.description,
      images: data.images
    }));

    setAiSuggestions(data.suggestions || []);
    setAiConfidence(data.confidence || 0);
    setShowImageFirst(false);

    // Add bot message about successful processing
    if (data.price > 0) {
      // Complete listing from image + text parsing
      addBotMessage(
        `Perfect! I've created your listing:\n\n` +
        `📱 ${data.title}\n` +
        `💰 $${data.price}\n` +
        `📂 ${data.category}\n` +
        `⭐ ${data.condition}\n\n` +
        `Your listing is ready to publish! You can review it in the preview.`
      );
      setStep(7); // Complete
    } else {
      // Need price input
      addBotMessage(
        `Excellent! I've analyzed your photo:\n\n` +
        `📱 ${data.title}\n` +
        `📂 ${data.category}\n` +
        `⭐ ${data.condition}\n\n` +
        `What's your asking price for this item?`
      );
      setStep(1); // Price step
    }
  }, [addBotMessage]);

  const handleAIError = useCallback((error: string) => {
    addBotMessage(
      `I had trouble processing that with AI: ${error}\n\n` +
      `No worries! Let's continue with the regular flow. What would you like to sell?`
    );
    setShowImageFirst(false);
    setStep(0);
  }, [addBotMessage]);

  useEffect(() => {
    // Load existing draft if any
    loadDraft();
  }, [loadDraft]);

  useEffect(() => {
    // Initialize conversation only after draft loading is complete
    if (!isLoadingDraft && !showDraftResume && !showImageFirst) {
      if (!userStats.canCreateListing) {
        addBotMessage(userStats.rateLimitMessage || "You've reached your listing limit.");
      } else {
        addBotMessage("Hi! I'm GatorBot 🐊 Let's create your listing step by step. What would you like to sell?");
      }
    }
  }, [isLoadingDraft, showDraftResume, showImageFirst, userStats.canCreateListing, userStats.rateLimitMessage, addBotMessage]);

  const saveDraft = useCallback(async (updatedDraft?: ListingDraft, updatedStep?: number, updatedMessages?: Message[]) => {
    if (!draftManagerRef.current) return;
    
    try {
      await draftManagerRef.current.save(
        updatedDraft || draft,
        updatedStep !== undefined ? updatedStep : step,
        updatedMessages || messages
      );
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [draft, step, messages]);

  // Auto-save whenever draft, step, or messages change
  useEffect(() => {
    if (draftManagerRef.current && (draft.title || draft.price || draft.images.length > 0)) {
      draftManagerRef.current.markDirty();
    }
  }, [draft, step, messages]);

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

  // Loading state
  if (isLoadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Draft Resume Modal */}
      {showDraftResume && availableDraft && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <RotateCcw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Resume Your Listing?</h3>
                    <p className="text-sm text-gray-600">We found a draft you were working on</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last saved: {availableDraft.timeSince}</span>
                  </div>
                  
                  {availableDraft.session.draft.title && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Title: </span>
                      <span className="text-sm text-gray-900">{availableDraft.session.draft.title}</span>
                    </div>
                  )}
                  
                  {availableDraft.session.draft.price && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Price: </span>
                      <span className="text-sm text-green-600 font-semibold">${availableDraft.session.draft.price}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium text-gray-700">Progress:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${availableDraft.session.metadata.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{availableDraft.session.metadata.completionPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={resumeDraft}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Resume Draft</span>
                  </button>
                  
                  <button
                    onClick={startFresh}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
                  >
                    Start Fresh
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Your draft is automatically saved as you work
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-600">Chat with GatorBot to list your item</p>
                {userId && (
                  <DraftStatusIndicator 
                    isOnline={isOnline}
                    lastSaved={lastSaved}
                    className="hidden sm:inline-flex"
                  />
                )}
              </div>
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

        {/* Image-First Flow (shown at the beginning) */}
        {showImageFirst && !showDraftResume && (
          <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
            <ImageFirstFlow
              onComplete={handleImageFirstComplete}
              onError={handleAIError}
              disabled={!userStats.canCreateListing}
            />

            <div className="text-center mt-4">
              <button
                onClick={() => setShowImageFirst(false)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip photo and use regular chat flow
              </button>
            </div>
          </div>
        )}

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

          {/* AI Suggestions in chat */}
          {!showImageFirst && aiSuggestions.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <AISuggestions
                  suggestions={aiSuggestions}
                  confidence={aiConfidence}
                  onApplySuggestion={(suggestion) => {
                    addUserMessage(`Applied suggestion: ${suggestion}`);
                    addBotMessage("Great! That suggestion should help improve your listing.");
                  }}
                />
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
import { useState, useEffect } from 'react';

interface SuccessStory {
  name: string;
  amount: number;
  story: string;
  avatar: string;
  timeframe: string;
}

export default function SuccessStories() {
  const [currentStory, setCurrentStory] = useState(0);

  const stories: SuccessStory[] = [
    {
      name: "Sarah M.",
      amount: 85,
      story: "Got my Amazon gift cards and ChatGPT Pro! Perfect for shopping and studying with AI assistance.",
      avatar: "👩‍🎓",
      timeframe: "2 months"
    },
    {
      name: "Mike K.",
      amount: 175,
      story: "As an RA, I shared with residents and earned Best Buy gift cards for my gaming setup!",
      avatar: "👨‍💼",
      timeframe: "3 months"
    },
    {
      name: "Emma L.",
      amount: 60,
      story: "Three Instagram posts got me Amazon gift cards and ChatGPT Pro for my research projects!",
      avatar: "👩‍💻",
      timeframe: "6 weeks"
    },
    {
      name: "Alex R.",
      amount: 250,
      story: "Shared in study groups and earned enough gift cards to upgrade my entire tech setup!",
      avatar: "👨‍🎓",
      timeframe: "4 months"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % stories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [stories.length]);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-200">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-6 flex items-center justify-center">
        <span className="mr-2">💬</span>
        Success Stories
      </h2>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentStory * 100}%)` }}
        >
          {stories.map((story, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    {story.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{story.name}</h3>
                    <p className="text-sm text-green-600 font-medium">${story.amount} earned in {story.timeframe}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{story.story}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStory(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStory ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
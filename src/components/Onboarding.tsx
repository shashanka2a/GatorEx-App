import { Button } from "./ui/button";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="min-h-screen bg-uf-gradient flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center space-y-8 max-w-sm opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce p-4">
          <img 
            src="/logo.png" 
            alt="GatorEx Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="space-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
          <h1 className="text-4xl font-bold">Welcome to GatorEx</h1>
          <p className="text-xl text-white/90 leading-relaxed">
            The University of Florida&apos;s premier marketplace for students to buy, sell, and trade items safely.
          </p>
        </div>
        
        <div className="space-y-6 pt-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h3 className="font-semibold">Buy & Sell Safely</h3>
              <p className="text-white/80 text-sm">Textbooks, furniture, electronics & more</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🐊</span>
            </div>
            <div>
              <h3 className="font-semibold">Verified Gators Only</h3>
              <p className="text-white/80 text-sm">UF email verification ensures trust</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="font-semibold">Direct Communication</h3>
              <p className="text-white/80 text-sm">Chat directly via WhatsApp</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 space-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
          <Button 
            onClick={onComplete}
            variant="outline"
            className="w-full !bg-white !text-uf-orange hover:!bg-gray-100 !border-white text-lg py-4 rounded-xl shadow-lg font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            Start Exploring
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <span>🔒</span>
            <span>Safe • Secure • Student-Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
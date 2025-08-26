"use client"

import { useState } from "react";
import Head from "next/head";
import { Header } from "@/components/Header";
import { SignIn } from "@/components/SignIn";
import { EmailVerification } from "@/components/EmailVerification";
import { Onboarding } from "@/components/Onboarding";
import { Home } from "@/components/Home";
import { ListingDetail } from "@/components/ListingDetail";
import { PostListing } from "@/components/PostListing";
import { Profile } from "@/components/Profile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageCircle, Home as HomeIcon, Plus, User, LogOut } from "lucide-react";

type Screen = "signin" | "signup" | "email-verification" | "onboarding" | "home" | "listing-detail" | "post" | "profile" | "whatsapp";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSignIn = (email: string) => {
    setUserEmail(email);
    setCurrentScreen("email-verification");
  };

  const handleSignUp = () => {
    setCurrentScreen("signup");
  };

  const handleEmailVerified = () => {
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("home");
  };

  const handleListingClick = (id: string) => {
    setSelectedListingId(id);
    setCurrentScreen("listing-detail");
  };

  const handleWhatsAppChat = () => {
    setCurrentScreen("whatsapp");
  };

  const handlePostComplete = () => {
    setCurrentScreen("profile");
  };

  const handleMenuItemClick = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    setCurrentScreen("signin");
    setUserEmail("");
    setIsMenuOpen(false);
  };

  const getHeaderProps = () => {
    switch (currentScreen) {
      case "listing-detail":
        return {
          showBack: true,
          onBack: () => setCurrentScreen("home"),
          title: "Item Details"
        };
      case "post":
        return {
          showBack: true,
          onBack: () => setCurrentScreen("home"),
          title: "Post Item"
        };
      case "profile":
        return {
          showBack: true,
          onBack: () => setCurrentScreen("home"),
          title: "My Profile"
        };
      case "whatsapp":
        return {
          showBack: true,
          onBack: () => setCurrentScreen("listing-detail"),
          title: "Contact Seller"
        };
      default:
        return {};
    }
  };

  const renderWhatsAppScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-8 max-w-sm w-full">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-xl font-bold mb-4">Chat with Seller</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You&apos;ll be redirected to WhatsApp to start a conversation with the seller. 
          Make sure you have WhatsApp installed on your device.
        </p>
        
        <div className="space-y-3">
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => {
              // In a real app, this would open WhatsApp with a pre-filled message
              alert("Opening WhatsApp... (This would normally redirect to WhatsApp)");
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setCurrentScreen("listing-detail")}
          >
            Back to Listing
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mx-auto">
            <span>🔒</span>
            <span>Safe & Secure Communication</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignUpScreen = () => (
    <SignIn onSignIn={handleSignIn} onSignUp={() => setCurrentScreen("signin")} />
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case "signin":
        return <SignIn onSignIn={handleSignIn} onSignUp={handleSignUp} />;
      case "signup":
        return renderSignUpScreen();
      case "email-verification":
        return (
          <EmailVerification 
            email={userEmail}
            onVerified={handleEmailVerified}
            onBack={() => setCurrentScreen("signin")}
          />
        );
      case "onboarding":
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case "home":
        return (
          <Home 
            onListingClick={handleListingClick}
            onCategoryClick={() => {}} 
          />
        );
      case "listing-detail":
        return (
          <ListingDetail 
            listingId={selectedListingId}
            onWhatsAppChat={handleWhatsAppChat}
          />
        );
      case "post":
        return <PostListing onComplete={handlePostComplete} />;
      case "profile":
        return (
          <Profile 
            onCreateListing={() => setCurrentScreen("post")}
            onListingClick={handleListingClick}
          />
        );
      case "whatsapp":
        return renderWhatsAppScreen();
      default:
        return <SignIn onSignIn={handleSignIn} onSignUp={handleSignUp} />;
    }
  };

  // Auth screens don't need header/navigation
  if (["signin", "signup", "email-verification", "onboarding"].includes(currentScreen)) {
    return (
      <>
        <Head>
          <title>GatorEx - UF Student Marketplace</title>
        </Head>
        {renderScreen()}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>GatorEx - UF Student Marketplace</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <Header 
            {...getHeaderProps()}
            onMenuClick={() => setIsMenuOpen(true)}
            onSearch={() => {}}
          />
          
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-uf-gradient rounded-xl flex items-center justify-center shadow-md p-2">
                    <img 
                      src="/logo.svg" 
                      alt="GatorEx Logo" 
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alex Johnson</h3>
                    <p className="text-sm text-gray-500">{userEmail || "alex.johnson@ufl.edu"}</p>
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                      <span>✓</span>
                      <span>Verified Student</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-orange-50 hover:text-uf-orange"
                    onClick={() => handleMenuItemClick("home")}
                  >
                    <HomeIcon className="w-4 h-4 mr-3" />
                    Home
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-orange-50 hover:text-uf-orange"
                    onClick={() => handleMenuItemClick("post")}
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Post Item
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-orange-50 hover:text-uf-orange"
                    onClick={() => handleMenuItemClick("profile")}
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Button>
                </div>
              </nav>
              
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <main>
          {renderScreen()}
        </main>
      </div>
    </>
  );
}
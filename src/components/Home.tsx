"use client"

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, MapPin, Shield, Clock, TrendingUp, Eye, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HomeProps {
  onListingClick: (id: string) => void;
  onCategoryClick: (category: string) => void;
}

const categories = [
  { name: "All", icon: "🔥", color: "bg-gradient-to-br from-orange-500 to-blue-600", count: "500+" },
  { name: "Textbooks", icon: "📚", color: "bg-blue-500", count: "120" },
  { name: "Electronics", icon: "📱", color: "bg-purple-500", count: "85" },
  { name: "Furniture", icon: "🪑", color: "bg-green-500", count: "67" },
  { name: "Appliances", icon: "🍽️", color: "bg-orange-500", count: "43" },
  { name: "Clothing", icon: "👕", color: "bg-pink-500", count: "92" },
  { name: "Sports", icon: "⚽", color: "bg-yellow-500", count: "38" },
  { name: "Gaming", icon: "🎮", color: "bg-indigo-500", count: "29" },
  { name: "Tickets", icon: "🎫", color: "bg-red-500", count: "15" },
  { name: "Books", icon: "📖", color: "bg-teal-500", count: "54" }
];

const mockListings = [
  {
    id: "1",
    title: "Mini Fridge - Great for Dorms",
    price: "$120",
    originalPrice: "$200",
    image: "https://images.unsplash.com/photo-1542331325-bebfc9b990d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pJTIwZnJpZGdlJTIwZG9ybSUyMHJvb218ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Beaty Towers",
    likes: 23,
    views: 189,
    category: "Appliances",
    seller: { name: "Sarah G.", verified: true, trustScore: 85, responseTime: "1h" },
    timePosted: "2h ago",
    condition: "Like New",
    trending: true,
    savings: 40,
    description: "Perfect condition mini fridge, barely used!"
  },
  {
    id: "2",
    title: "Calculus Textbook - MAC 2311",
    price: "$85",
    originalPrice: "$280",
    image: "https://images.unsplash.com/photo-1750776418412-1548a2b3f4b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMGNhbGN1bHVzJTIwbWF0aGVtYXRpY3N8ZW58MXx8fHwxNzU2MjAxMDI5fDA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Library West Area",
    likes: 18,
    views: 156,
    category: "Textbooks",
    seller: { name: "Mike R.", verified: true, trustScore: 92, responseTime: "30m" },
    timePosted: "1h ago",
    condition: "Excellent",
    trending: true,
    savings: 70,
    description: "No highlights, perfect for current semester"
  },
  {
    id: "3",
    title: "iPhone 13 Pro - 128GB",
    price: "$650",
    originalPrice: "$999",
    image: "https://images.unsplash.com/photo-1690536262935-5e80893b3125?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjAxMyUyMHBybyUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=400",
    location: "On Campus",
    likes: 45,
    views: 234,
    category: "Electronics",
    seller: { name: "Jessica L.", verified: true, trustScore: 100, responseTime: "15m" },
    timePosted: "45m ago",
    condition: "Like New",
    trending: true,
    savings: 35,
    description: "Excellent condition, includes charger & case"
  },
  {
    id: "4",
    title: "Study Desk with Chair Set",
    price: "$180",
    originalPrice: "$320",
    image: "https://images.unsplash.com/photo-1603376575925-467d14313a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjBjaGFpciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NTYyMjc3ODV8MA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Gainesville Apt",
    likes: 31,
    views: 198,
    category: "Furniture",
    seller: { name: "Alex T.", verified: true, trustScore: 88, responseTime: "2h" },
    timePosted: "3h ago",
    condition: "Good",
    trending: true,
    savings: 44,
    description: "Perfect for dorm or apartment studying"
  },
  {
    id: "5",
    title: "Nike Air Force 1 - Size 10",
    price: "$75",
    originalPrice: "$110",
    image: "https://images.unsplash.com/photo-1617343586189-c552f971aa5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWtlJTIwc25lYWtlcnMlMjBzaG9lc3xlbnwxfHx8fDE3NTYyMjc3ODZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Student Housing",
    likes: 12,
    views: 87,
    category: "Clothing",
    seller: { name: "Chris M.", verified: true, trustScore: 78, responseTime: "1h" },
    timePosted: "4h ago",
    condition: "Good",
    trending: false,
    savings: 32,
    description: "Worn a few times, great condition"
  },
  {
    id: "6",
    title: "MacBook Air M1 - 256GB",
    price: "$850",
    originalPrice: "$1199",
    image: "https://images.unsplash.com/photo-1585866761940-8fdb68aa0d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBtYWNib29rJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Near Campus",
    likes: 67,
    views: 312,
    category: "Electronics",
    seller: { name: "Emma K.", verified: true, trustScore: 94, responseTime: "30m" },
    timePosted: "5h ago",
    condition: "Excellent",
    trending: true,
    savings: 29,
    description: "Barely used, perfect for classes"
  },
  {
    id: "7",
    title: "Nintendo Switch + Games",
    price: "$220",
    originalPrice: "$350",
    image: "https://images.unsplash.com/photo-1560278687-2941249fd3d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW50ZW5kbyUyMHN3aXRjaCUyMGdhbWluZ3xlbnwxfHx8fDE3NTYyMjc3ODZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    location: "Dorm Complex",
    likes: 38,
    views: 167,
    category: "Gaming",
    seller: { name: "Ryan P.", verified: true, trustScore: 84, responseTime: "45m" },
    timePosted: "6h ago",
    condition: "Like New",
    trending: false,
    savings: 37,
    description: "Includes 3 popular games!"
  },
  {
    id: "8",
    title: "UF vs FSU Football Tickets",
    price: "$180",
    originalPrice: "$250",
    image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHRpY2tldHMlMjBzdGFkaXVtfGVufDF8fHx8MTc1NjIyNzc4MHww&ixlib=rb-4.1.0&q=80&w=400",
    location: "Ben Hill Griffin",
    likes: 89,
    views: 445,
    category: "Tickets",
    seller: { name: "Jordan S.", verified: true, trustScore: 100, responseTime: "10m" },
    timePosted: "1h ago",
    condition: "New",
    trending: true,
    savings: 28,
    description: "Great seats! Section 12, Row F"
  }
];

const trendingListings = mockListings.filter(listing => listing.trending);

export function Home({ onListingClick, onCategoryClick }: HomeProps) {
  return (
    <div className="pb-6 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-uf-gradient p-6 text-white">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Find Great Deals</h1>
          <p className="text-white/90">From fellow Gators you can trust</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-xs text-white/80">Active Listings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1.2k</div>
            <div className="text-xs text-white/80">Verified Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">87🛡️</div>
            <div className="text-xs text-white/80">Avg Trust</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-6">
        <h2 className="mb-4 font-bold text-gray-900">Browse Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => onCategoryClick(category.name)}
            >
              <div className={`relative w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-2 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                <span className="text-2xl">{category.icon}</span>
                {category.count && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {category.count.length > 2 ? category.count.slice(0, -1) : category.count}
                  </div>
                )}
              </div>
              <div className="text-xs text-center font-medium text-gray-700 w-16">
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-uf-orange" />
            <h2 className="font-bold text-gray-900">Trending Now</h2>
            <Badge className="bg-red-100 text-red-800 text-xs">HOT 🔥</Badge>
          </div>
          <span className="text-sm text-uf-orange font-medium">See all</span>
        </div>
        
        <div className="space-y-4">
          {trendingListings.map((listing, index) => (
            <Card 
              key={listing.id}
              className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-0 overflow-hidden cursor-pointer"
              onClick={() => onListingClick(listing.id)}
            >
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0 relative">
                  <ImageWithFallback
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                      🔥 TRENDING
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                      {listing.condition}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      -{listing.savings}%
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2 pr-2">
                        {listing.title}
                      </h3>
                      <Button variant="ghost" size="sm" className="p-0 w-8 h-8 text-gray-400 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-uf-orange">{listing.price}</span>
                      <span className="text-sm text-gray-400 line-through">{listing.originalPrice}</span>
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        Save ${parseInt(listing.originalPrice.slice(1)) - parseInt(listing.price.slice(1))}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">{listing.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{listing.timePosted}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {listing.seller.verified && (
                          <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-600">
                          🛡️ {listing.seller.trustScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{listing.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{listing.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>



      {/* Quick Actions */}
      <div className="px-4 mt-8">
        <Card className="bg-uf-gradient p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold mb-1">Ready to sell something?</h3>
              <p className="text-sm text-white/90">Post your first listing in under 2 minutes</p>
            </div>
            <Button className="bg-white text-uf-orange hover:bg-gray-100 font-semibold">
              <MessageCircle className="w-4 h-4 mr-2" />
              Post Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
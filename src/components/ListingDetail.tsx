import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, Share2, MapPin, Clock, User, MessageCircle, Shield, Star, Award, CheckCircle, Eye, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ListingDetailProps {
  listingId: string;
  onContactSeller: () => void;
}

const mockListings = {
  "1": {
    id: "1",
    title: "Mini Fridge - Great for Dorms",
    price: "$120",
    originalPrice: "$200",
    description: "Perfect condition mini fridge that's barely been used! Ideal for dorm rooms or small apartments. Fits perfectly under most desk setups. Energy efficient and quiet operation. Includes original manual and warranty info. Great for keeping drinks cold and storing snacks. Compact design doesn't take up much space but holds plenty.",
    images: [
      "https://images.unsplash.com/photo-1542331325-bebfc9b990d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pJTIwZnJpZGdlJTIwZG9ybSUyMHJvb218ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1542331325-bebfc9b990d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pJTIwZnJpZGdlJTIwZG9ybSUyMHJvb218ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1542331325-bebfc9b990d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pJTIwZnJpZGdlJTIwZG9ybSUyMHJvb218ZW58MXx8fHwxNzU2MjI3NzgwfDA&ixlib=rb-4.1.0&q=80&w=800"
    ],
    location: "Beaty Towers",
    seller: {
      name: "Sarah G.",
      fullName: "Sarah Garcia",
      avatar: "student portrait female",
      trustScore: 85,
      reviews: 28,
      verified: true,
      responseTime: "Usually responds within 1 hour",
      memberSince: "August 2023",
      totalSales: 15,
      badges: ["Fast Responder", "Verified Student", "Dorm Expert"]
    },
    posted: "2 hours ago",
    category: "Appliances",
    condition: "Like New",
    likes: 23,
    views: 189,
    trending: true,
    specifications: {
      "Brand": "Frigidaire",
      "Capacity": "3.2 cu ft",
      "Color": "Black",
      "Energy Star": "Yes",
      "Dimensions": "19.1\" W x 20.5\" D x 33.5\" H"
    },
    features: ["Energy efficient", "Adjustable shelves", "Quiet operation", "Perfect for dorms", "Reversible door"],
    meetupOptions: ["Beaty Towers Lobby", "Library West", "Student Union"],
    paymentMethods: ["Cash", "Venmo", "PayPal"]
  },
  "2": {
    id: "2",
    title: "Calculus Textbook - MAC 2311",
    price: "$85",
    originalPrice: "$280",
    description: "Selling my Calculus textbook in excellent condition. No highlighting or writing inside. All pages intact and binding is perfect. This is the current edition being used for MAC 2311 and MAC 2312 this semester. Includes access code (unused). Perfect for students taking calculus courses.",
    images: [
      "https://images.unsplash.com/photo-1750776418412-1548a2b3f4b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMGNhbGN1bHVzJTIwbWF0aGVtYXRpY3N8ZW58MXx8fHwxNzU2MjAxMDI5fDA&ixlib=rb-4.1.0&q=80&w=800"
    ],
    location: "Library West Area",
    seller: {
      name: "Mike R.",
      fullName: "Mike Rodriguez",
      avatar: "student portrait male",
      trustScore: 92,
      reviews: 31,
      verified: true,
      responseTime: "Usually responds within 30 minutes",
      memberSince: "September 2023",
      totalSales: 22,
      badges: ["Top Seller", "Quick Responder", "Textbook Expert"]
    },
    posted: "1 hour ago",
    category: "Textbooks",
    condition: "Excellent",
    likes: 18,
    views: 156,
    trending: true,
    courseCodes: ["MAC 2311", "MAC 2312"],
    specifications: {
      "Edition": "9th Edition",
      "Author": "Stewart, Clegg, Watson",
      "ISBN": "978-1337613927",
      "Publisher": "Cengage Learning",
      "Year": "2024"
    },
    features: ["No highlighting", "All pages intact", "Current edition", "Unused access code", "Perfect binding"],
    meetupOptions: ["Library West", "Marston Science Library", "Student Union"],
    paymentMethods: ["Cash", "Venmo", "Zelle"]
  }
};

export function ListingDetail({ listingId, onContactSeller }: ListingDetailProps) {
  const listing = mockListings[listingId as keyof typeof mockListings] || mockListings["1"];
  const savingsAmount = parseInt(listing.originalPrice.slice(1)) - parseInt(listing.price.slice(1));
  const savingsPercent = Math.round((savingsAmount / parseInt(listing.originalPrice.slice(1))) * 100);

  return (
    <div className="pb-24 bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-white">
        <div className="aspect-square bg-gray-100">
          <ImageWithFallback
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2">
            {listing.images.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`} 
              />
            ))}
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0 bg-white/90 backdrop-blur-sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0 bg-white/90 backdrop-blur-sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {listing.trending && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-500 text-white px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              TRENDING
            </Badge>
          </div>
        )}
      </div>
      
      {/* Listing Info */}
      <div className="p-4 space-y-4">
        {/* Price and Title */}
        <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-uf-orange border-uf-orange">{listing.category}</Badge>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{listing.condition}</Badge>
                <div className="inline-flex items-center gap-1 bg-uf-gradient text-white text-xs font-medium px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-uf-orange">{listing.price}</span>
              <span className="text-lg text-gray-400 line-through">{listing.originalPrice}</span>
              <Badge className="bg-green-100 text-green-800">
                Save ${savingsAmount} ({savingsPercent}% off)
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{listing.posted}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{listing.views} views</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Course Codes (if applicable) */}
        {'courseCodes' in listing && listing.courseCodes && (
          <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
            <h3 className="font-semibold mb-2">Compatible Courses</h3>
            <div className="flex gap-2">
              {'courseCodes' in listing && listing.courseCodes?.map(code => (
                <Badge key={code} className="bg-uf-blue text-white">{code}</Badge>
              ))}
            </div>
          </Card>
        )}
        
        {/* Specifications */}
        {'specifications' in listing && listing.specifications && (
          <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <div className="space-y-2">
              {'specifications' in listing && listing.specifications && Object.entries(listing.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Features */}
        <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
          <h3 className="font-semibold mb-3">Key Features</h3>
          <div className="space-y-2">
            {listing.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Seller Info */}
        <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
          <h3 className="font-semibold mb-3">Seller Information</h3>
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-uf-blue rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{listing.seller.fullName}</h4>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-500 fill-current" />
                  <span>Trust: {listing.seller.trustScore}/100 ({listing.seller.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{listing.seller.totalSales} completed sales</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {listing.seller.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
              
              <p className="text-xs text-gray-500">{listing.seller.responseTime}</p>
              <p className="text-xs text-gray-500">Member since {listing.seller.memberSince}</p>
            </div>
          </div>
        </Card>
        
        {/* Meetup & Payment */}
        <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
          <h3 className="font-semibold mb-3">Meetup & Payment</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested meetup locations:</h4>
              <div className="flex flex-wrap gap-2">
                {listing.meetupOptions.map(location => (
                  <Badge key={location} variant="outline" className="text-xs">
                    📍 {location}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Accepted payments:</h4>
              <div className="flex flex-wrap gap-2">
                {listing.paymentMethods.map(method => (
                  <Badge key={method} variant="outline" className="text-xs">
                    💳 {method}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Description */}
        <Card className="bg-white rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
          <h3 className="font-semibold mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{listing.description}</p>
        </Card>
        
        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-500 pt-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
          <span>{listing.views} views</span>
          <span>{listing.likes} likes</span>
        </div>
      </div>
      
      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-2 border-gray-200 hover:border-uf-orange hover:text-uf-orange">
            <Heart className="w-4 h-4 mr-2" />
            Save ({listing.likes})
          </Button>
          <Button 
            className="flex-1 bg-uf-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            onClick={onContactSeller}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Seller
          </Button>
        </div>
      </div>
    </div>
  );
}
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Star, MapPin, Edit, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProfileProps {
  onEditProfile?: () => void;
  onCreateListing?: () => void;
  onListingClick?: (id: string) => void;
}

const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@ufl.edu",
  location: "Gainesville, FL",
  memberSince: "September 2023",
  rating: 4.9,
  reviews: 24,
  verified: true
};

const mockListings = [
  {
    id: "1",
    title: "Chemistry Textbook - CHM 2045",
    price: "$65",
    image: "chemistry textbook",
    status: "active",
    views: 32,
    likes: 8
  },
  {
    id: "2",
    title: "Study Desk with Chair",
    price: "$150",
    image: "study desk chair",
    status: "sold",
    views: 89,
    likes: 23
  },
  {
    id: "3",
    title: "MacBook Air M1",
    price: "$800",
    image: "macbook air m1",
    status: "active",
    views: 156,
    likes: 45
  }
];

const soldListings = mockListings.filter(listing => listing.status === "sold");
const activeListings = mockListings.filter(listing => listing.status === "active");

export function Profile({ onEditProfile, onCreateListing, onListingClick }: ProfileProps) {
  return (
    <div className="pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-uf-orange to-uf-blue p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-3">
            <img 
              src="/logo.png" 
              alt="User Avatar" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl">{mockUser.name}</h1>
              {mockUser.verified && (
                <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
              <Star className="w-4 h-4 fill-current" />
              <span>{mockUser.rating} ({mockUser.reviews} reviews)</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>{mockUser.location}</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full mt-4"
          onClick={onEditProfile}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-uf-orange">{activeListings.length}</div>
          <div className="text-sm text-gray-500">Active</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-uf-blue">{soldListings.length}</div>
          <div className="text-sm text-gray-500">Sold</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-gray-700">{mockUser.reviews}</div>
          <div className="text-sm text-gray-500">Reviews</div>
        </Card>
      </div>
      
      {/* Listings Tabs */}
      <div className="px-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Listings</TabsTrigger>
            <TabsTrigger value="sold">Sold Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 mt-4">
            {activeListings.length > 0 ? (
              activeListings.map((listing) => (
                <Card 
                  key={listing.id}
                  className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onListingClick?.(listing.id)}
                >
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/400x400/?${listing.image}`}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {listing.title}
                        </h3>
                        <p className="text-uf-orange font-bold">{listing.price}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{listing.views} views</span>
                        <span>{listing.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No active listings yet</p>
                <Button onClick={onCreateListing} className="bg-uf-orange hover:bg-uf-orange/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold" className="space-y-4 mt-4">
            {soldListings.map((listing) => (
              <Card 
                key={listing.id}
                className="p-0 overflow-hidden opacity-75"
              >
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/400x400/?${listing.image}`}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-xs">SOLD</Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-gray-500 font-bold">{listing.price}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{listing.views} views</span>
                      <span>{listing.likes} likes</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Action Button */}
      <Button
        onClick={onCreateListing}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-uf-orange hover:bg-uf-orange/90 shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
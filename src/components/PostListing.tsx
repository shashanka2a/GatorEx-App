"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera, Plus, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PostListingProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: "Photos", description: "Add photos of your item" },
  { id: 2, title: "Details", description: "Describe your item" },
  { id: 3, title: "Price", description: "Set your price" },
  { id: 4, title: "Review", description: "Review and post" }
];

const categories = ["Textbooks", "Electronics", "Furniture", "Clothing", "Sports", "Dorm", "Tickets"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

export function PostListing({ onComplete }: PostListingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    location: ""
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addPhoto = () => {
    // Mock adding a photo
    const mockPhotos = ["furniture desk", "electronics laptop", "textbook math", "clothing shirt"];
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    if (photos.length < 5) {
      setPhotos([...photos, randomPhoto]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2>Add Photos</h2>
              <p className="text-gray-500">Add up to 5 photos of your item</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/300x300/?${photo}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <Button
                  variant="outline"
                  className="aspect-square border-dashed border-2 flex flex-col items-center justify-center"
                  onClick={addPhoto}
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </Button>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2>Item Details</h2>
              <p className="text-gray-500">Tell us about your item</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Title *</label>
                <Input
                  placeholder="What are you selling?"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-2">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-2">Condition *</label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-2">Description *</label>
                <Textarea
                  placeholder="Describe your item..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2>Set Your Price</h2>
              <p className="text-gray-500">How much would you like to sell for?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Location *</label>
                <Input
                  placeholder="Where can buyers pick this up?"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h2>Review Your Listing</h2>
              <p className="text-gray-500">Make sure everything looks good</p>
            </div>
            
            <Card className="p-4">
              <div className="space-y-3">
                {photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((photo, index) => (
                      <div key={index} className="w-16 h-16 flex-shrink-0">
                        <ImageWithFallback
                          src={`https://images.unsplash.com/200x200/?${photo}`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div>
                  <h3>{formData.title}</h3>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{formData.category}</Badge>
                    <Badge variant="outline">{formData.condition}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-uf-orange">${formData.price}</p>
                </div>
                
                <p className="text-gray-700">{formData.description}</p>
                <p className="text-sm text-gray-500">📍 {formData.location}</p>
              </div>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="pb-24">
      {/* Progress Steps */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-uf-orange text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.id}
              </div>
              <span className="text-xs mt-1 text-center">{step.title}</span>
            </div>
          ))}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-uf-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step Content */}
      <div className="p-4">
        {renderStep()}
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className={`bg-uf-orange hover:bg-uf-orange/90 ${currentStep === 1 ? 'w-full' : 'flex-1'}`}
          >
            {currentStep === steps.length ? 'Post Listing' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
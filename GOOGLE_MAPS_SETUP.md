# 🗺️ Google Maps API Setup for Dynamic Location Suggestions

## Overview
GatorEx now uses Google Maps Places API to provide dynamic location suggestions when users type meeting spots. This creates a much better user experience with real-time, accurate location suggestions.

## 🔧 Setup Instructions

### 1. **Get Google Maps API Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"

4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. **Configure API Key Restrictions (Recommended)**

For security, restrict your API key:

1. **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `https://app.gatorex.shop/*`
     - `https://localhost:3000/*` (for development)

2. **API restrictions**:
   - Select "Restrict key"
   - Choose "Places API"

### 3. **Add to Environment Variables**

Update your `.env.local` file:

```bash
# Google Maps API
GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
```

### 4. **Enable Billing (Required)**

Google Maps API requires billing to be enabled:
1. Go to "Billing" in Google Cloud Console
2. Link a payment method
3. The Places API has generous free tier limits

## 💰 **Pricing Information**

### **Places API Pricing (as of 2024)**
- **Autocomplete**: $2.83 per 1,000 requests
- **Free tier**: $200 credit per month (≈70,000 requests)

### **Expected Usage for GatorEx**
- **Average**: ~10 requests per listing creation
- **Monthly estimate**: 1,000 listings = 10,000 requests = ~$28
- **Free tier covers**: ~7,000 listings per month

## 🎯 **Features Implemented**

### **1. Dynamic Location Autocomplete**
- Real-time suggestions as users type
- Prioritizes campus and Gainesville locations
- Fallback to popular campus spots if API fails

### **2. Smart Location Prioritization**
- **Highest priority**: UF campus locations
- **High priority**: Gainesville locations  
- **Medium priority**: Florida locations
- **Bonus points**: Relevant establishment types

### **3. User Experience Enhancements**
- **Recent locations**: Saves last 5 used locations
- **Quick select buttons**: Popular campus spots
- **Keyboard navigation**: Arrow keys and Enter
- **Mobile optimized**: Touch-friendly interface

### **4. Fallback System**
- **API failure**: Falls back to popular campus locations
- **No internet**: Uses cached recent locations
- **Invalid input**: Provides helpful suggestions

## 🏫 **Campus-Specific Features**

### **Popular UF Locations Pre-loaded**
- Reitz Union
- Library West
- Turlington Plaza
- Student Recreation Center
- Broward Dining

### **Location Filtering**
- Prioritizes locations within 5km of UF campus
- Filters for relevant establishment types
- Boosts university and campus-related results

## 🔧 **Technical Implementation**

### **API Endpoint**: `/api/places/autocomplete`
```typescript
POST /api/places/autocomplete
{
  "input": "reitz",
  "location": "29.6436,-82.3549",
  "radius": 5000,
  "types": "establishment|university|library|restaurant|store",
  "components": "country:us"
}
```

### **Response Format**
```typescript
{
  "predictions": [
    {
      "place_id": "ChIJ...",
      "description": "Reitz Union, University of Florida",
      "structured_formatting": {
        "main_text": "Reitz Union",
        "secondary_text": "University of Florida, Gainesville, FL"
      },
      "types": ["university", "establishment"]
    }
  ],
  "status": "OK"
}
```

### **Components Used**
- `LocationAutocomplete.tsx`: Main autocomplete component
- `MeetingSpotInput.tsx`: Chat-integrated location selector
- `/api/places/autocomplete.ts`: Google Places API proxy

## 🚀 **Usage in Chat Flow**

### **Before (Static Buttons)**
```
Bot: "Choose a meeting spot:"
[Reitz Union] [Library West] [Other]
```

### **After (Dynamic Search)**
```
Bot: "Where would you like to meet buyers?"
[Smart location input with real-time suggestions]
User types: "reitz" → Shows "Reitz Union" suggestion
```

## 🛡️ **Security & Performance**

### **API Key Security**
- Server-side API calls only
- Domain restrictions enabled
- Rate limiting implemented

### **Performance Optimizations**
- 300ms debounce on typing
- Caches recent locations locally
- Limits to 8 suggestions max
- Fallback to static locations

### **Error Handling**
- Graceful API failure handling
- User-friendly error messages
- Automatic fallback systems

## 📊 **Monitoring & Analytics**

### **Track These Metrics**
- API request volume
- Success/failure rates
- Most popular locations
- User completion rates

### **Cost Optimization**
- Monitor monthly usage
- Set up billing alerts
- Consider caching popular results

## 🎉 **Benefits for Users**

### **Sellers**
- ✅ **Faster listing creation** - no scrolling through long lists
- ✅ **Accurate locations** - real addresses and landmarks
- ✅ **Familiar places** - recognizes local spots they know

### **Buyers**
- ✅ **Clear meeting spots** - exact locations with addresses
- ✅ **Better navigation** - can use GPS to find spots
- ✅ **Safer meetings** - verified public locations

---

**Result**: Users can now type any location and get intelligent, real-time suggestions that make finding meeting spots effortless! 🎯
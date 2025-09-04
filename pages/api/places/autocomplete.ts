import { NextApiRequest, NextApiResponse } from 'next';

interface AutocompleteRequest {
  input: string;
  location?: string;
  radius?: number;
  types?: string;
  components?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
  distance_meters?: number;
}

interface AutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      input,
      location,
      radius = 5000,
      types = 'establishment',
      components = 'country:us'
    }: AutocompleteRequest = req.body;

    if (!input || input.trim().length < 2) {
      return res.status(400).json({ error: 'Input must be at least 2 characters' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return res.status(500).json({ error: 'Location service not available' });
    }

    // Build the Google Places Autocomplete API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      types,
      components
    });

    // Add location bias if provided
    if (location) {
      params.append('location', location);
      params.append('radius', radius.toString());
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);
    const data: AutocompleteResponse = await response.json();

    if (data.status === 'OK') {
      // Filter and enhance predictions
      const predictions = data.predictions
        .filter(prediction => {
          // Prioritize locations in Florida or near campus
          const description = prediction.description.toLowerCase();
          return (
            description.includes('fl') ||
            description.includes('florida') ||
            description.includes('gainesville') ||
            description.includes('university of florida') ||
            description.includes('uf')
          );
        })
        .slice(0, 8) // Limit to 8 suggestions
        .map(prediction => ({
          ...prediction,
          // Add custom scoring for campus locations
          campus_priority: getCampusPriority(prediction)
        }))
        .sort((a, b) => b.campus_priority - a.campus_priority);

      return res.status(200).json({
        predictions,
        status: 'OK'
      });
    } else if (data.status === 'ZERO_RESULTS') {
      return res.status(200).json({
        predictions: [],
        status: 'ZERO_RESULTS'
      });
    } else {
      console.error('Google Places API error:', data.status);
      return res.status(500).json({ error: 'Location service error' });
    }

  } catch (error) {
    console.error('Places autocomplete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to prioritize campus locations
function getCampusPriority(prediction: PlacePrediction): number {
  const description = prediction.description.toLowerCase();
  const mainText = prediction.structured_formatting.main_text.toLowerCase();
  const types = prediction.types;

  let priority = 0;

  // Highest priority for UF campus locations
  if (
    description.includes('university of florida') ||
    description.includes('uf campus') ||
    mainText.includes('reitz') ||
    mainText.includes('turlington') ||
    mainText.includes('library west') ||
    mainText.includes('student rec')
  ) {
    priority += 100;
  }

  // High priority for Gainesville locations
  if (description.includes('gainesville')) {
    priority += 50;
  }

  // Medium priority for Florida locations
  if (description.includes('florida') || description.includes(' fl')) {
    priority += 25;
  }

  // Bonus for relevant establishment types
  if (types.includes('university')) priority += 30;
  if (types.includes('library')) priority += 20;
  if (types.includes('restaurant')) priority += 15;
  if (types.includes('store')) priority += 10;
  if (types.includes('establishment')) priority += 5;

  return priority;
}
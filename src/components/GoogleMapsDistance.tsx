import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the props interface
interface GoogleMapsDistanceProps {
  onDistanceCalculated: (
    origin: string, 
    destination: string, 
    distance: number, 
    distanceText: string,
    duration: number,
    durationText: string
  ) => void;
  apiKey: string;
}

// Define the component
export function GoogleMapsDistance({ onDistanceCalculated, apiKey }: GoogleMapsDistanceProps) {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps API script
  useEffect(() => {
    if (!scriptLoaded && apiKey) {
      // First, check if the script is already loaded
      if (document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
        console.log("Google Maps script already exists, setting as loaded");
        setScriptLoaded(true);
        return;
      }

      console.log("Loading Google Maps script with key:", apiKey);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define a global callback function
      (window as any).initGoogleMaps = () => {
        console.log("Google Maps script loaded successfully");
        setScriptLoaded(true);
      };
      
      // Handle errors
      script.onerror = () => {
        console.error("Error loading Google Maps script");
        setError("Failed to load Google Maps. Please try again later.");
      };
      
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        // Clean up the global callback
        delete (window as any).initGoogleMaps;
      };
    }
  }, [apiKey, scriptLoaded]);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (scriptLoaded && originInputRef.current && destinationInputRef.current) {
      try {
        console.log("Initializing Google Maps Autocomplete");
        
        // Configure autocomplete options
        const autocompleteOptions = {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          componentRestrictions: { country: 'in' } // Restrict to India for better results
        };
        
        // Initialize autocomplete for origin and destination inputs
        originAutocompleteRef.current = new google.maps.places.Autocomplete(
          originInputRef.current,
          autocompleteOptions
        );
        
        destinationAutocompleteRef.current = new google.maps.places.Autocomplete(
          destinationInputRef.current,
          autocompleteOptions
        );
        
        // Style the autocomplete dropdown to match our UI
        // This needs to be done after the Google Maps script is loaded
        const styleAutocompleteDropdowns = () => {
          // Add custom styles to the Google autocomplete dropdown
          const style = document.createElement('style');
          style.textContent = `
            .pac-container {
              border-radius: 0.5rem;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              margin-top: 4px;
              background-color: white;
              font-family: inherit;
              z-index: 9999 !important;
            }
            .pac-item {
              padding: 8px 12px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
            }
            .pac-item:hover {
              background-color: #f7fafc;
            }
            .pac-item-selected {
              background-color: #edf2f7;
            }
            .pac-icon {
              display: none;
            }
            .pac-item-query {
              font-size: 14px;
              font-weight: 500;
              color: #1a202c;
            }
            .pac-matched {
              font-weight: 600;
              color: #3182ce;
            }
            .pac-item:before {
              content: '';
              display: inline-block;
              width: 16px;
              height: 16px;
              margin-right: 8px;
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>');
              background-size: contain;
              background-repeat: no-repeat;
              opacity: 0.5;
            }
          `;
          document.head.appendChild(style);
        };
        
        styleAutocompleteDropdowns();
        
        // Add event listeners to handle place selection
        if (originAutocompleteRef.current && destinationAutocompleteRef.current) {
          // For origin input - using a type assertion to access the event API
          ((google.maps as any).event).addListener(originAutocompleteRef.current, 'place_changed', () => {
            const place = originAutocompleteRef.current?.getPlace();
            if (place?.formatted_address) {
              setOrigin(place.formatted_address);
              console.log('Selected origin place:', place);
            }
          });
          
          // For destination input - using a type assertion to access the event API
          ((google.maps as any).event).addListener(destinationAutocompleteRef.current, 'place_changed', () => {
            const place = destinationAutocompleteRef.current?.getPlace();
            if (place?.formatted_address) {
              setDestination(place.formatted_address);
              console.log('Selected destination place:', place);
            }
          });
        }
      } catch (error) {
        console.error("Error initializing Google Maps Autocomplete:", error);
        setError("Error initializing location search. Please try again.");
      }
    }
  }, [scriptLoaded]);

  const calculateDistance = () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log("Calculating distance between:", origin, "and", destination);
    console.log("Using API key:", apiKey);

    try {
      // Using the actual Google Maps API for accurate distance calculation
      if (!google || !google.maps) {
        throw new Error("Google Maps API not loaded properly");
      }
      
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          setIsLoading(false);
          console.log("Google Maps API response:", status, response);
          
          if (status === 'OK' && response) {
            const result = response.rows[0].elements[0];
            
            if (result.status === 'OK') {
              const distanceValue = result.distance.value / 1000; // Convert meters to kilometers
              const durationValue = result.duration.value / 60; // Convert seconds to minutes
              
              console.log("Distance calculated successfully:", distanceValue, "km");
              
              onDistanceCalculated(
                origin,
                destination,
                distanceValue,
                result.distance.text,
                durationValue,
                result.duration.text
              );
            } else {
              console.error("Route calculation failed:", result.status);
              setError(`Could not calculate distance: ${result.status}`);
            }
          } else {
            console.error("Distance Matrix API error:", status);
            setError(`Error: ${status}`);
          }
        }
      );
    } catch (error) {
      console.error("Error calculating distance:", error);
      setIsLoading(false);
      setError(`Error: ${error.message || 'Unknown error occurred'}`);
      
      // Fallback to a direct API call if the Google Maps object isn't available
      if (!google || !google.maps) {
        fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`)
          .then(response => response.json())
          .then(data => {
            console.log("Direct API call response:", data);
            if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
              const element = data.rows[0].elements[0];
              const distanceValue = element.distance.value / 1000;
              const durationValue = element.duration.value / 60;
              
              onDistanceCalculated(
                origin,
                destination,
                distanceValue,
                element.distance.text,
                durationValue,
                element.duration.text
              );
            } else {
              setError(`API Error: ${data.status || 'Unknown error'}`);
            }
          })
          .catch(err => {
            console.error("Direct API call failed:", err);
            setError("Failed to calculate distance. Please try again.");
          });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculate Route Distance</CardTitle>
        <CardDescription>
          Enter origin and destination to get accurate distance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="origin" className="text-sm font-medium">Origin</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="h-4 w-4" />
              </div>
              <Input
                id="origin"
                ref={originInputRef}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Enter starting location"
                disabled={!scriptLoaded}
                className="pl-10"
              />
            </div>
            {!scriptLoaded && (
              <p className="text-xs text-muted-foreground">Loading location search...</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="destination" className="text-sm font-medium">Destination</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Navigation className="h-4 w-4" />
              </div>
              <Input
                id="destination"
                ref={destinationInputRef}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                disabled={!scriptLoaded}
                className="pl-10"
              />
            </div>
            {scriptLoaded && (
              <p className="text-xs text-muted-foreground">Start typing to see location suggestions</p>
            )}
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <Button 
            onClick={calculateDistance} 
            disabled={isLoading || !scriptLoaded || !origin || !destination}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate Distance'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

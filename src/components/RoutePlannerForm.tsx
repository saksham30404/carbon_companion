import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Navigation, ArrowRight, Car, Bike, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GoogleMapsDistance } from './GoogleMapsDistance';

interface Route {
  name: string;
  distance: number;
  time: number;
  traffic: string;
  emissions: number;
  emissions_interpretation: string;
}

interface RouteAnalysis {
  origin: string;
  destination: string;
  routes: Route[];
  eco_recommended_route: string;
  eco_savings: {
    vs_worst_route: number;
    percentage: number;
  };
}

interface AlternativeVehicle {
  vehicle: string;
  emissions: number;
  is_eco_friendly: boolean;
}

interface AlternativesAnalysis {
  alternatives: AlternativeVehicle[];
  eco_recommended: string;
}

interface RoutePlannerFormProps {
  onCalculateRoutes: (routeData: any) => void;
}

// Google Maps API key for location search and distance calculation
const GOOGLE_MAPS_API_KEY = 'AIzaSyBTCA9FrUufR3ZdZOxS1FTe_eJwkG6NDwU';

const RoutePlannerForm: React.FC<RoutePlannerFormProps> = ({ onCalculateRoutes }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [fuelType, setFuelType] = useState('Petrol');
  const [mileage, setMileage] = useState('12.5');
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [alternativesAnalysis, setAlternativesAnalysis] = useState<AlternativesAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for Google Maps distance calculation
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceText, setDistanceText] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);
  const [durationText, setDurationText] = useState<string>('');

  // Handle distance calculation from GoogleMapsDistance component
  const handleDistanceCalculated = (
    originVal: string, 
    destinationVal: string, 
    distanceVal: number, 
    distanceTextVal: string,
    durationVal: number,
    durationTextVal: string
  ) => {
    setOrigin(originVal);
    setDestination(destinationVal);
    setDistance(distanceVal);
    setDistanceText(distanceTextVal);
    setDuration(durationVal);
    setDurationText(durationTextVal);
    
    console.log(`Distance calculated: ${distanceVal} km (${distanceTextVal}), duration: ${durationVal} min (${durationTextVal})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distance) {
      alert("Please calculate the distance first using the location search");
      return;
    }
    
    setIsLoading(true);

    try {
      // In a real app, this would be an API call to the backend
      // For demo, we're simulating the response from our Python model
      const routeData = {
        origin,
        destination,
        vehicleType,
        fuelType,
        mileage: parseFloat(mileage),
        distance: distance,
        duration: duration
      };

      // Call the parent handler which would make the actual API call
      onCalculateRoutes(routeData);

      // Simulate API response for demo purposes
      // In a real app, this would come from the API response
      setTimeout(() => {
        // Use the actual distance from Google Maps API
        const actualDistance = distance;
        const actualDuration = duration || 30; // Fallback if duration is not available
        
        // Generate route data based on actual distance
        const routes = [
          {
            name: "Route A (Fastest)",
            distance: actualDistance,
            time: actualDuration,
            traffic: "Low to Moderate",
            emissions: calculateEmissions(actualDistance, parseFloat(mileage), vehicleType, fuelType),
            emissions_interpretation: getEmissionsInterpretation(calculateEmissions(actualDistance, parseFloat(mileage), vehicleType, fuelType))
          },
          {
            name: "Route B (Shortest)",
            distance: actualDistance * 0.95, // Slightly shorter
            time: actualDuration * 1.1, // Slightly longer time
            traffic: "Moderate",
            emissions: calculateEmissions(actualDistance * 0.95, parseFloat(mileage), vehicleType, fuelType),
            emissions_interpretation: getEmissionsInterpretation(calculateEmissions(actualDistance * 0.95, parseFloat(mileage), vehicleType, fuelType))
          },
          {
            name: "Route C (Alternative)",
            distance: actualDistance * 1.1, // Slightly longer
            time: actualDuration * 1.05,
            traffic: "Low",
            emissions: calculateEmissions(actualDistance * 1.1, parseFloat(mileage), vehicleType, fuelType),
            emissions_interpretation: getEmissionsInterpretation(calculateEmissions(actualDistance * 1.1, parseFloat(mileage), vehicleType, fuelType))
          }
        ];

        // Sort routes by emissions
        routes.sort((a, b) => a.emissions - b.emissions);
        
        const routeAnalysisData: RouteAnalysis = {
          origin,
          destination,
          routes,
          eco_recommended_route: routes[0].name,
          eco_savings: {
            vs_worst_route: routes[routes.length - 1].emissions - routes[0].emissions,
            percentage: ((routes[routes.length - 1].emissions - routes[0].emissions) / routes[routes.length - 1].emissions) * 100
          }
        };

        // Calculate emissions for different transportation options using the actual distance
        const alternatives: AlternativeVehicle[] = [
          { 
            vehicle: "Car (Petrol)", 
            emissions: calculateEmissions(actualDistance, 14.0, "Car", "Petrol"), 
            is_eco_friendly: false 
          },
          { 
            vehicle: "Car (Diesel)", 
            emissions: calculateEmissions(actualDistance, 18.0, "Car", "Diesel"), 
            is_eco_friendly: false 
          },
          { 
            vehicle: "Car (Electric)", 
            emissions: calculateEmissions(actualDistance, 25.0, "Car", "Electric"), 
            is_eco_friendly: true 
          },
          { 
            vehicle: "Bus", 
            emissions: calculateEmissions(actualDistance, 5.0, "Bus", "Diesel"), 
            is_eco_friendly: true 
          },
          { 
            vehicle: "Motorcycle", 
            emissions: calculateEmissions(actualDistance, 35.0, "Motorcycle", "Petrol"), 
            is_eco_friendly: true 
          },
          { 
            vehicle: "Bicycle", 
            emissions: 0, 
            is_eco_friendly: true 
          },
          { 
            vehicle: "Walking", 
            emissions: 0, 
            is_eco_friendly: true 
          }
        ];
        
        // Sort alternatives by emissions
        alternatives.sort((a, b) => a.emissions - b.emissions);
        
        const alternativesData: AlternativesAnalysis = {
          alternatives,
          eco_recommended: alternatives[0].vehicle
        };

        setRouteAnalysis(routeAnalysisData);
        setAlternativesAnalysis(alternativesData);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error calculating routes:", error);
      setIsLoading(false);
    }
  };

  // Calculate emissions based on distance, mileage, vehicle type, and fuel type
  const calculateEmissions = (distance: number, mileage: number, vehicleType: string, fuelType: string): number => {
    // Base emission factors (kg CO2 per liter of fuel)
    const emissionFactors = {
      'Petrol': 2.31,
      'Diesel': 2.68,
      'CNG': 1.81,
      'Electric': 0.5 // Much lower for electric
    };
    
    // Vehicle type multipliers
    const vehicleMultipliers = {
      'Car': 1.0,
      'Bus': 0.5, // Per passenger
      'Motorcycle': 0.7
    };
    
    // Calculate fuel consumption (L)
    const fuelConsumption = distance / mileage;
    
    // Calculate emissions
    const factor = emissionFactors[fuelType as keyof typeof emissionFactors] || emissionFactors['Petrol'];
    const multiplier = vehicleMultipliers[vehicleType as keyof typeof vehicleMultipliers] || vehicleMultipliers['Car'];
    
    // For zero-emission options
    if (vehicleType === 'Bicycle' || vehicleType === 'Walking' || 
        (vehicleType === 'Car' && fuelType === 'Electric' && distance < 5)) {
      return 0;
    }
    
    // Round to 2 decimal places for consistency
    return Math.round((fuelConsumption * factor * multiplier) * 100) / 100;
  };
  
  // Get interpretation text based on emissions amount and distance
  const getEmissionsInterpretation = (emissions: number): string => {
    // For zero emissions
    if (emissions === 0) return "This journey has zero carbon emissions.";
    
    // For very short distances
    if (distance && distance < 5) {
      if (emissions < 1) return "This short journey has minimal carbon emissions.";
      if (emissions < 2) return "Consider walking or cycling for this short journey to reduce emissions.";
      return "This short journey could be done with lower emissions using alternative transport.";
    }
    
    // For medium distances
    if (distance && distance >= 5 && distance < 20) {
      if (emissions < 2) return "This journey has very low carbon emissions.";
      if (emissions < 4) return "This journey has relatively low carbon emissions.";
      if (emissions < 8) return "This journey has moderate carbon emissions.";
      return "Consider public transport to reduce emissions for this journey.";
    }
    
    // For longer distances
    if (emissions < 5) return "This journey has very low carbon emissions for the distance.";
    if (emissions < 10) return "This journey has relatively low carbon emissions for the distance.";
    if (emissions < 20) return "This journey has moderate carbon emissions.";
    if (emissions < 30) return "This journey has high carbon emissions.";
    return "This journey has very high carbon emissions. Consider alternatives if possible.";
  };
  
  const getEmissionColor = (emissions: number) => {
    if (emissions === 0) return "text-green-600";
    if (emissions < 2) return "text-green-500";
    if (emissions < 4) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Route Planner
          </CardTitle>
          <CardDescription>
            Find the most eco-friendly route for your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Integrate the GoogleMapsDistance component for location search and distance calculation */}
            <GoogleMapsDistance 
              onDistanceCalculated={handleDistanceCalculated}
              apiKey={GOOGLE_MAPS_API_KEY}
            />
            
            {distance && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Distance:</span>
                    <span>{distanceText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="font-medium">Duration:</span>
                    <span>{durationText}</span>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="vehicleType" className="text-sm font-medium">
                  Vehicle Type
                </label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="fuelType" className="text-sm font-medium">
                  Fuel Type
                </label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="mileage" className="text-sm font-medium">
                  Mileage (km/L)
                </label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="Mileage in km/L"
                  min="0.1"
                  step="0.1"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !distance}
              title={!distance ? "Please calculate distance first" : ""}
            >
              {isLoading ? "Calculating Routes..." : "Calculate Carbon Emissions"}
            </Button>
            {!distance && (
              <p className="text-xs text-muted-foreground text-center">
                Please use the location search above to calculate distance first
              </p>
            )}
          </form>
          </div>
        </CardContent>
      </Card>

      {routeAnalysis && (
        <>
          <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Route Options</CardTitle>
              <CardDescription>
                From {routeAnalysis.origin} to {routeAnalysis.destination}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeAnalysis.routes.map((route, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${route.name === routeAnalysis.eco_recommended_route 
                      ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                      : 'border-border/50 bg-card'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="font-medium">{route.name}</h3>
                        {route.name === routeAnalysis.eco_recommended_route && (
                          <Badge className="ml-2 bg-green-500" variant="secondary">
                            <Leaf className="h-3 w-3 mr-1" /> Eco-Friendly
                          </Badge>
                        )}
                      </div>
                      <div className={`font-bold ${getEmissionColor(route.emissions)}`}>
                        {route.emissions.toFixed(2)} kg CO₂
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Distance:</span> {route.distance.toFixed(1)} km
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span> {route.time.toFixed(0)} min
                      </div>
                      <div>
                        <span className="text-muted-foreground">Traffic:</span> {route.traffic}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {route.emissions_interpretation}
                    </p>
                  </div>
                ))}
                
                <div className="mt-4 p-4 rounded-lg bg-primary/10">
                  <h3 className="font-medium mb-2">Eco-Friendly Choice</h3>
                  <p className="text-sm mb-2">
                    By choosing {routeAnalysis.eco_recommended_route}, you can save approximately{' '}
                    <span className="font-bold text-primary">
                      {routeAnalysis.eco_savings.vs_worst_route.toFixed(2)} kg
                    </span>{' '}
                    of CO₂ emissions ({routeAnalysis.eco_savings.percentage.toFixed(1)}% reduction).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {alternativesAnalysis && (
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Alternative Transportation</CardTitle>
                <CardDescription>
                  Consider these eco-friendly alternatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alternativesAnalysis.alternatives.map((alt, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card"
                    >
                      <div className="flex items-center">
                        {alt.vehicle.includes("Car") ? (
                          <Car className="h-5 w-5 mr-2 text-primary" />
                        ) : alt.vehicle.includes("Bicycle") || alt.vehicle.includes("Walking") ? (
                          <Bike className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <Navigation className="h-5 w-5 mr-2 text-primary" />
                        )}
                        <span>{alt.vehicle}</span>
                        {alt.is_eco_friendly && (
                          <Badge className="ml-2 bg-green-500" variant="secondary">
                            <Leaf className="h-3 w-3 mr-1" /> Eco-Friendly
                          </Badge>
                        )}
                      </div>
                      <div className={`font-bold ${getEmissionColor(alt.emissions)}`}>
                        {alt.emissions.toFixed(2)} kg CO₂
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-primary/10">
                  <h3 className="font-medium mb-2">Most Eco-Friendly Option</h3>
                  <p className="text-sm">
                    <span className="font-bold text-primary">{alternativesAnalysis.eco_recommended}</span>{' '}
                    is the most environmentally friendly mode of transportation for this route.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RoutePlannerForm;

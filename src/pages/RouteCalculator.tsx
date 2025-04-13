import { useState } from 'react';
import { GoogleMapsDistance } from '../components/GoogleMapsDistance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { ArrowRight, Car, MapPin, Leaf } from 'lucide-react';

// Ensure API key is correctly defined and visible in console for debugging
const GOOGLE_MAPS_API_KEY = 'AIzaSyBTCA9FrUufR3ZdZOxS1FTe_eJwkG6NDwU';
console.log('Google Maps API Key in RouteCalculator:', GOOGLE_MAPS_API_KEY);

interface RouteOption {
  name: string;
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
  emissions: number;
  traffic: string;
  emissions_interpretation: string;
}

export default function RouteCalculator() {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceText, setDistanceText] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);
  const [durationText, setDurationText] = useState<string>('');
  
  const [vehicleType, setVehicleType] = useState<string>('Car');
  const [fuelType, setFuelType] = useState<string>('Petrol');
  const [mileage, setMileage] = useState<string>('15');
  
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);
  const [alternatives, setAlternatives] = useState<any[] | null>(null);
  const [ecoRecommended, setEcoRecommended] = useState<string | null>(null);
  const [ecoSavings, setEcoSavings] = useState<{vs_worst_route: number; percentage: number} | null>(null);
  
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
  };
  
  const calculateEmissions = async () => {
    if (!distance || !mileage) return;
    
    setIsCalculating(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate the response
      
      // Simulating a call to the backend route planner
      const response = await fetch('/api/calculate-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          vehicle_type: vehicleType,
          fuel_type: fuelType,
          mileage: parseFloat(mileage),
        }),
      });
      
      // Since we don't have a real backend connected, simulate a response
      // In a real implementation, you would use the actual response data
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate base emissions using a simple formula (for demonstration)
      // In reality, this would come from your ML model
      const baseEmissions = (distance * 2.3) / parseFloat(mileage);
      
      // Create simulated route options
      const simulatedRoutes: RouteOption[] = [
        {
          name: "Fastest Route",
          distance: { value: distance, text: distanceText },
          duration: { value: duration, text: durationText },
          emissions: baseEmissions,
          traffic: "Moderate",
          emissions_interpretation: getEmissionsInterpretation(baseEmissions)
        },
        {
          name: "Eco-friendly Route",
          distance: { value: distance * 0.95, text: `${Math.round(distance * 0.95)} km` },
          duration: { value: duration * 1.1, text: `${Math.round(duration * 1.1)} mins` },
          emissions: baseEmissions * 0.85,
          traffic: "Low",
          emissions_interpretation: getEmissionsInterpretation(baseEmissions * 0.85)
        },
        {
          name: "Alternative Route",
          distance: { value: distance * 1.1, text: `${Math.round(distance * 1.1)} km` },
          duration: { value: duration * 1.05, text: `${Math.round(duration * 1.05)} mins` },
          emissions: baseEmissions * 1.1,
          traffic: "Heavy",
          emissions_interpretation: getEmissionsInterpretation(baseEmissions * 1.1)
        }
      ];
      
      // Sort routes by emissions
      simulatedRoutes.sort((a, b) => a.emissions - b.emissions);
      
      // Calculate alternative transportation options
      const alternativeOptions = [
        {
          vehicle: "Car (Petrol)",
          emissions: baseEmissions,
          is_eco_friendly: false
        },
        {
          vehicle: "Car (Diesel)",
          emissions: baseEmissions * 0.9,
          is_eco_friendly: false
        },
        {
          vehicle: "Car (Electric)",
          emissions: baseEmissions * 0.4,
          is_eco_friendly: true
        },
        {
          vehicle: "Bus",
          emissions: baseEmissions * 0.6,
          is_eco_friendly: true
        },
        {
          vehicle: "Motorcycle",
          emissions: baseEmissions * 0.7,
          is_eco_friendly: false
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
      alternativeOptions.sort((a, b) => a.emissions - b.emissions);
      
      setRoutes(simulatedRoutes);
      setAlternatives(alternativeOptions);
      setEcoRecommended(simulatedRoutes[0].name);
      setEcoSavings({
        vs_worst_route: simulatedRoutes[simulatedRoutes.length - 1].emissions - simulatedRoutes[0].emissions,
        percentage: ((simulatedRoutes[simulatedRoutes.length - 1].emissions - simulatedRoutes[0].emissions) / simulatedRoutes[simulatedRoutes.length - 1].emissions) * 100
      });
      
    } catch (error) {
      console.error('Error calculating emissions:', error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  const getEmissionsInterpretation = (emissions: number) => {
    if (emissions < 5) return 'This journey has very low carbon emissions.';
    if (emissions < 10) return 'This journey has low carbon emissions.';
    if (emissions < 20) return 'This journey has moderate carbon emissions.';
    if (emissions < 30) return 'This journey has high carbon emissions.';
    return 'This journey has very high carbon emissions.';
  };
  
  const getEmissionColor = (emissions: number) => {
    if (emissions === 0) return 'bg-green-500';
    if (emissions < 5) return 'bg-green-400';
    if (emissions < 10) return 'bg-green-300';
    if (emissions < 20) return 'bg-yellow-300';
    if (emissions < 30) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  const getProgressValue = (emissions: number) => {
    if (emissions === 0) return 0;
    // Cap at 100 for the progress bar
    return Math.min(emissions * 3, 100);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Carbon-Smart Route Planner</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <GoogleMapsDistance 
            onDistanceCalculated={handleDistanceCalculated}
            apiKey={GOOGLE_MAPS_API_KEY}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>
              Enter your vehicle information to calculate emissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type</label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
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
                <label htmlFor="mileage" className="text-sm font-medium">Mileage (km/L)</label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="Enter vehicle mileage"
                  min="1"
                />
              </div>
              
              <Button 
                onClick={calculateEmissions}
                disabled={isCalculating || !distance || !mileage}
                className="w-full"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Emissions'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {routes && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Route Analysis Results</CardTitle>
              <CardDescription>
                From {origin} to {destination}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="routes">
                <TabsList className="mb-4">
                  <TabsTrigger value="routes">Route Options</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternative Transportation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="routes" className="space-y-6">
                  {routes.map((route, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold flex items-center">
                          {route.name}
                          {route.name === ecoRecommended && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                              <Leaf className="h-3 w-3 mr-1" />
                              Eco-Recommended
                            </span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">{route.traffic} Traffic</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="font-medium">{route.distance.text}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{route.duration.text}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Carbon Emissions</p>
                          <p className="font-bold">{route.emissions.toFixed(2)} kg CO₂</p>
                        </div>
                        <Progress 
                          value={getProgressValue(route.emissions)} 
                          className={getEmissionColor(route.emissions)}
                        />
                        <p className="text-sm text-gray-600">{route.emissions_interpretation}</p>
                      </div>
                    </div>
                  ))}
                  
                  {ecoSavings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h3 className="font-medium text-green-800 flex items-center">
                        <Leaf className="h-4 w-4 mr-2" />
                        Environmental Impact
                      </h3>
                      <p className="text-sm text-green-700 mt-2">
                        By choosing the eco-recommended route, you could save approximately{' '}
                        <strong>{ecoSavings.vs_worst_route.toFixed(2)} kg of CO₂</strong> ({ecoSavings.percentage.toFixed(1)}% reduction)
                        compared to the highest-emission route.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="alternatives" className="space-y-4">
                  {alternatives && alternatives.map((alt, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          {alt.vehicle}
                          {index === 0 && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                              <Leaf className="h-3 w-3 mr-1" />
                              Best Option
                            </span>
                          )}
                        </h3>
                        <span className="font-bold">{alt.emissions.toFixed(2)} kg CO₂</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress 
                          value={getProgressValue(alt.emissions)} 
                          className={getEmissionColor(alt.emissions)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h3 className="font-medium text-blue-800">Did you know?</h3>
                    <p className="text-sm text-blue-700 mt-2">
                      Walking and cycling produce zero direct carbon emissions and also provide health benefits.
                      Public transportation typically produces fewer emissions per passenger than individual vehicles.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

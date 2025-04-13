import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
from emission_calculator import EmissionsCalculator
from google_maps_service import GoogleMapsService

class RoutePlanner:
    def __init__(self, api_key="AIzaSyBTCA9FrUufR3ZdZOxS1FTe_eJwkG6NDwU"):
        """Initialize the route planner with the emissions calculator and Google Maps service"""
        self.emissions_calculator = EmissionsCalculator()
        self.maps_service = GoogleMapsService(api_key)
        print("Route Planner initialized successfully")
    
    def analyze_routes(self, origin, destination, vehicle_type, fuel_type, mileage, mode="driving"):
        """
        Analyze potential routes between origin and destination using Google Maps API
        
        Parameters:
        - origin (str): Starting location
        - destination (str): Ending location
        - vehicle_type (str): Type of vehicle (Car, Bus, Motorcycle, etc.)
        - fuel_type (str): Type of fuel (Petrol, Diesel, CNG, etc.)
        - mileage (float): Vehicle's mileage in km/L
        - mode (str): Travel mode (driving, walking, bicycling, transit)
        
        Returns:
        - dict: Dictionary containing route options with emissions data
        """
        # Get routes from Google Maps API
        routes_response = self.maps_service.get_routes(
            origin=origin,
            destination=destination,
            alternatives=True,
            mode=mode
        )
        
        if routes_response["status"] != "success" or not routes_response["data"]:
            # Fallback to simulated routes if API fails
            print(f"Warning: Could not get routes from API: {routes_response['message']}")
            routes = [
                {
                    "name": "Route A (Fastest)",
                    "distance": {"value": np.random.uniform(10, 30), "text": "10-30 km"},
                    "duration": {"value": np.random.uniform(15, 45), "text": "15-45 mins"},
                    "traffic": "Low to Moderate"
                },
                {
                    "name": "Route B (Shortest)",
                    "distance": {"value": np.random.uniform(8, 25), "text": "8-25 km"},
                    "duration": {"value": np.random.uniform(20, 60), "text": "20-60 mins"},
                    "traffic": "Moderate"
                },
                {
                    "name": "Route C (Alternative)",
                    "distance": {"value": np.random.uniform(12, 35), "text": "12-35 km"},
                    "duration": {"value": np.random.uniform(25, 70), "text": "25-70 mins"},
                    "traffic": "Low"
                }
            ]
        else:
            routes = routes_response["data"]
        
        # Calculate emissions for each route
        for route in routes:
            emissions_data = self.emissions_calculator.predict_emissions(
                vehicle_type,
                fuel_type,
                route["distance"]["value"],  # Use the value in km
                mileage
            )
            
            route["emissions"] = emissions_data["emissions"]
            route["emissions_interpretation"] = emissions_data["interpretation"]
        
        # Sort routes by emissions (lowest first)
        routes.sort(key=lambda x: x["emissions"])
        
        # Add eco-recommendation
        recommended_route = routes[0]
        
        return {
            "origin": origin,
            "destination": destination,
            "routes": routes,
            "eco_recommended_route": recommended_route["name"],
            "eco_savings": {
                "vs_worst_route": routes[-1]["emissions"] - routes[0]["emissions"],
                "percentage": ((routes[-1]["emissions"] - routes[0]["emissions"]) / routes[-1]["emissions"]) * 100
            }
        }
    
    def get_alternative_vehicles(self, distance):
        """
        Calculate emissions for alternative transportation methods
        
        Parameters:
        - distance (float or dict): Route distance in km or distance object from Google Maps API
        
        Returns:
        - dict: Dictionary containing emissions data for different vehicle types
        """
        # Handle both float and dict distance formats
        if isinstance(distance, dict) and "value" in distance:
            distance_km = distance["value"]
        else:
            distance_km = float(distance)
        alternatives = [
            {"vehicle": "Car (Petrol)", "fuel": "Petrol", "mileage": 14.0},
            {"vehicle": "Car (Diesel)", "fuel": "Diesel", "mileage": 18.0},
            {"vehicle": "Car (Electric)", "fuel": "Electric", "mileage": 25.0},
            {"vehicle": "Bus", "fuel": "Diesel", "mileage": 5.0},
            {"vehicle": "Motorcycle", "fuel": "Petrol", "mileage": 35.0},
            {"vehicle": "Bicycle", "fuel": "Human", "mileage": 0.0},
            {"vehicle": "Walking", "fuel": "Human", "mileage": 0.0}
        ]
        
        results = []
        
        for alt in alternatives:
            if alt["vehicle"] in ["Bicycle", "Walking"]:
                # Zero emissions for human-powered transport
                results.append({
                    "vehicle": alt["vehicle"],
                    "emissions": 0.0,
                    "is_eco_friendly": True
                })
            else:
                try:
                    # Get emissions prediction
                    emissions_data = self.emissions_calculator.predict_emissions(
                        alt["vehicle"].split(" ")[0],  # Extract vehicle type
                        alt["fuel"],
                        distance_km,
                        alt["mileage"]
                    )
                    
                    results.append({
                        "vehicle": alt["vehicle"],
                        "emissions": emissions_data["emissions"],
                        "is_eco_friendly": emissions_data["emissions"] < 10.0
                    })
                except Exception as e:
                    # Skip if vehicle/fuel combination not in training data
                    print(f"Skipped {alt['vehicle']}: {str(e)}")
                    continue
        
        # Sort by emissions (lowest first)
        results.sort(key=lambda x: x["emissions"])
        
        return {
            "alternatives": results,
            "eco_recommended": results[0]["vehicle"]
        }

# Usage example (when run directly)
if __name__ == "__main__":
    planner = RoutePlanner()
    
    # Example route analysis
    origin = "Downtown"
    destination = "Suburb"
    vehicle_type = "Car"
    fuel_type = "Petrol"
    mileage = 12.5
    
    route_analysis = planner.analyze_routes(origin, destination, vehicle_type, fuel_type, mileage)
    
    print("\n===== ROUTE ANALYSIS =====")
    print(f"From {origin} to {destination}")
    print(f"Vehicle: {vehicle_type}, Fuel: {fuel_type}, Mileage: {mileage} km/L")
    print("\nROUTE OPTIONS:")
    
    for i, route in enumerate(route_analysis["routes"]):
        print(f"\nROUTE {i+1}: {route['name']}")
        print(f"Distance: {route['distance']['value']:.1f} km ({route['distance']['text']})")
        print(f"Time: {route['duration']['value']:.1f} minutes ({route['duration']['text']})")
        print(f"Traffic: {route['traffic']}")
        print(f"Emissions: {route['emissions']:.2f} kg CO2")
        print(f"Impact: {route['emissions_interpretation']}")
    
    print(f"\nECO-RECOMMENDED ROUTE: {route_analysis['eco_recommended_route']}")
    print(f"Potential CO2 savings: {route_analysis['eco_savings']['vs_worst_route']:.2f} kg")
    print(f"Percentage reduction: {route_analysis['eco_savings']['percentage']:.1f}%")
    
    # Example alternative vehicles analysis
    alt_analysis = planner.get_alternative_vehicles(route_analysis["routes"][0]["distance"]["value"])
    
    print("\n===== ALTERNATIVE TRANSPORTATION =====")
    print("\nOPTIONS (sorted by emissions):")
    
    for i, alt in enumerate(alt_analysis["alternatives"]):
        eco_label = "✓ ECO-FRIENDLY" if alt["is_eco_friendly"] else ""
        print(f"{i+1}. {alt['vehicle']} - {alt['emissions']:.2f} kg CO2 {eco_label}")
    
    print(f"\nMOST ECO-FRIENDLY OPTION: {alt_analysis['eco_recommended']}")

import requests
import json
import os

class GoogleMapsService:
    def __init__(self, api_key):
        """Initialize the Google Maps service with API key"""
        self.api_key = api_key
        self.base_url_distance = "https://maps.googleapis.com/maps/api/distancematrix/json"
        self.base_url_directions = "https://maps.googleapis.com/maps/api/directions/json"
    
    def get_distance(self, origin, destination, mode="driving"):
        """
        Get distance and duration between origin and destination
        
        Parameters:
        - origin (str): Starting location (address or coordinates)
        - destination (str): Ending location (address or coordinates)
        - mode (str): Travel mode (driving, walking, bicycling, transit)
        
        Returns:
        - dict: Distance and duration information
        """
        params = {
            "origins": origin,
            "destinations": destination,
            "mode": mode,
            "key": self.api_key
        }
        
        response = requests.get(self.base_url_distance, params=params)
        data = response.json()
        
        if data["status"] != "OK":
            return {
                "status": "error",
                "message": f"API Error: {data['status']}",
                "data": None
            }
        
        try:
            result = data["rows"][0]["elements"][0]
            
            if result["status"] != "OK":
                return {
                    "status": "error",
                    "message": f"Route Error: {result['status']}",
                    "data": None
                }
            
            return {
                "status": "success",
                "message": "Route found",
                "data": {
                    "distance": {
                        "value": result["distance"]["value"],  # meters
                        "text": result["distance"]["text"]
                    },
                    "duration": {
                        "value": result["duration"]["value"],  # seconds
                        "text": result["duration"]["text"]
                    }
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing response: {str(e)}",
                "data": None
            }
    
    def get_routes(self, origin, destination, alternatives=True, mode="driving"):
        """
        Get multiple route options between origin and destination
        
        Parameters:
        - origin (str): Starting location (address or coordinates)
        - destination (str): Ending location (address or coordinates)
        - alternatives (bool): Whether to return alternative routes
        - mode (str): Travel mode (driving, walking, bicycling, transit)
        
        Returns:
        - dict: List of route options with distance and duration
        """
        params = {
            "origin": origin,
            "destination": destination,
            "alternatives": "true" if alternatives else "false",
            "mode": mode,
            "key": self.api_key
        }
        
        response = requests.get(self.base_url_directions, params=params)
        data = response.json()
        
        if data["status"] != "OK":
            return {
                "status": "error",
                "message": f"API Error: {data['status']}",
                "data": None
            }
        
        try:
            routes = []
            
            for i, route in enumerate(data["routes"]):
                # Extract summary, distance, and duration
                summary = route["summary"]
                leg = route["legs"][0]  # First leg contains the full route info
                
                route_data = {
                    "name": f"Route {chr(65+i)} ({summary})",
                    "distance": {
                        "value": leg["distance"]["value"] / 1000,  # Convert to km
                        "text": leg["distance"]["text"]
                    },
                    "duration": {
                        "value": leg["duration"]["value"] / 60,  # Convert to minutes
                        "text": leg["duration"]["text"]
                    },
                    "traffic": self._estimate_traffic_level(leg)
                }
                
                routes.append(route_data)
            
            return {
                "status": "success",
                "message": f"Found {len(routes)} routes",
                "data": routes
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing response: {str(e)}",
                "data": None
            }
    
    def _estimate_traffic_level(self, leg):
        """Estimate traffic level based on duration with and without traffic"""
        if "duration_in_traffic" in leg:
            ratio = leg["duration_in_traffic"]["value"] / leg["duration"]["value"]
            
            if ratio < 1.1:
                return "Low"
            elif ratio < 1.3:
                return "Moderate"
            elif ratio < 1.5:
                return "High"
            else:
                return "Very High"
        else:
            return "Unknown"  # Traffic data not available

# Example usage
if __name__ == "__main__":
    # Replace with your actual API key
    api_key = "YOUR_API_KEY"
    maps_service = GoogleMapsService(api_key)
    
    # Example: Get distance between two locations
    result = maps_service.get_distance(
        origin="New York, NY",
        destination="Boston, MA"
    )
    
    print(json.dumps(result, indent=2))
    
    # Example: Get route options
    routes = maps_service.get_routes(
        origin="New York, NY",
        destination="Boston, MA"
    )
    
    print(json.dumps(routes, indent=2))

declare namespace google {
  namespace maps {
    class DistanceMatrixService {
      getDistanceMatrix(
        request: DistanceMatrixRequest,
        callback: (
          response: DistanceMatrixResponse | null,
          status: DistanceMatrixStatus
        ) => void
      ): void;
    }

    type DistanceMatrixStatus =
      | 'OK'
      | 'INVALID_REQUEST'
      | 'MAX_ELEMENTS_EXCEEDED'
      | 'MAX_DIMENSIONS_EXCEEDED'
      | 'OVER_QUERY_LIMIT'
      | 'REQUEST_DENIED'
      | 'UNKNOWN_ERROR';

    interface DistanceMatrixRequest {
      origins: string[] | google.maps.LatLng[] | google.maps.Place[];
      destinations: string[] | google.maps.LatLng[] | google.maps.Place[];
      travelMode: google.maps.TravelMode;
      unitSystem?: google.maps.UnitSystem;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      region?: string;
      transitOptions?: google.maps.TransitOptions;
      drivingOptions?: google.maps.DrivingOptions;
    }

    interface DistanceMatrixResponse {
      originAddresses: string[];
      destinationAddresses: string[];
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: string;
      duration?: Duration;
      duration_in_traffic?: Duration;
      distance?: Distance;
      fare?: TransitFare;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface TransitFare {
      currency: string;
      value: number;
      text: string;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT',
      WALKING = 'WALKING'
    }

    enum UnitSystem {
      IMPERIAL = 0,
      METRIC = 1
    }

    interface TransitOptions {
      arrivalTime?: Date;
      departureTime?: Date;
      modes?: TransitMode[];
      routingPreference?: TransitRoutePreference;
    }

    enum TransitMode {
      BUS = 'BUS',
      RAIL = 'RAIL',
      SUBWAY = 'SUBWAY',
      TRAIN = 'TRAIN',
      TRAM = 'TRAM'
    }

    enum TransitRoutePreference {
      FEWER_TRANSFERS = 'FEWER_TRANSFERS',
      LESS_WALKING = 'LESS_WALKING'
    }

    interface DrivingOptions {
      departureTime: Date;
      trafficModel?: TrafficModel;
    }

    enum TrafficModel {
      BEST_GUESS = 'BEST_GUESS',
      OPTIMISTIC = 'OPTIMISTIC',
      PESSIMISTIC = 'PESSIMISTIC'
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    class Place {}

    namespace places {
      class Autocomplete {
        constructor(inputElement: HTMLInputElement, options?: AutocompleteOptions);
        getPlace(): PlaceResult;
        setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
        setComponentRestrictions(restrictions: ComponentRestrictions): void;
        setFields(fields: string[] | undefined): void;
        setOptions(options: AutocompleteOptions): void;
        setTypes(types: string[]): void;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
        componentRestrictions?: ComponentRestrictions;
        fields?: string[];
        placeIdOnly?: boolean;
        strictBounds?: boolean;
        types?: string[];
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: PlaceGeometry;
        place_id?: string;
        name?: string;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      interface PlaceGeometry {
        location: LatLng;
        viewport: LatLngBounds;
      }
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  preferences?: any;
}

export interface Trip {
  id: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'UPCOMING' | 'COMPLETED';
  budget: number;
  itineraryId?: string;
}

export interface ItineraryDay {
  day: number;
  activities: string[];
  theme: string;
  morning: any;
  afternoon: any;
  evening: any;
  accommodation: any;
  dailyCost: number;
  tips: string[];
}

export interface Itinerary {
  id: string;
  tripId: string;
  days: ItineraryDay[];
  totalEstimatedCost: number;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

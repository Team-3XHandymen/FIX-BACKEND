// Service Types
export interface IService {
  _id?: string;
  serviceId?: string;
  name: string;
  description: string;
  baseFee: number;
  imageUrl?: string;
}

// Service Provider Types
export interface IServiceProvider {
  _id?: string;
  userId: string; // Clerk user ID
  serviceIds: string[];
  experience: string;
  rating: number;
  location: {
    city: string;
    area: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  skills?: string[];
  bio: string;
  doneJobsCount: number;
  availability: {
    [key: string]: string[]; // e.g., { mon: ["9am-5pm"], tue: ["10am-6pm"] }
  };
}

// Provider Private Data Types
export interface IProviderPrivateData {
  _id?: string;
  userId: string; // Clerk user ID
  totalEarnings: number;
  upcomingBookings: string[];
  schedule: {
    [key: string]: any; // Daily job timings
  };
  notifications: Array<{
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }>;
  oldBookings: string[];
}

// Client Types
export interface IClient {
  _id?: string;
  userId: string; // Clerk user ID
  name: string;
  mobileNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  location: string; // General region
  rating?: number;
  preferences?: {
    preferredServices?: string[];
    preferredTimes?: string[];
    [key: string]: any;
  };
}

// Booking Types
export interface IBooking {
  _id?: string;
  bookingId?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
  description: string;
  fee: number | null;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  clientId: string; // Clerk User ID
  providerId: string; // Clerk User ID
  serviceId: string;
  scheduledTime: Date;
  createdAt: Date;
}

// Review Types
export interface IReview {
  _id?: string;
  bookingId: string;
  from: string; // Client ID
  to: string; // Service Provider ID
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
}

// Notification Types
export interface INotification {
  _id?: string;
  userId: string; // Clerk user ID
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth Types (for Clerk integration)
export interface AuthResponse {
  userId: string;
  userType: 'client' | 'provider';
  token?: string; // If using custom JWT alongside Clerk
}

// Booking Request Types
export interface CreateBookingRequest {
  description: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  providerId: string;
  serviceId: string;
  scheduledTime: Date;
}

export interface UpdateBookingRequest {
  status?: 'confirmed' | 'cancelled' | 'done';
  fee?: number;
  description?: string;
}

// Service Provider Registration
export interface ServiceProviderRegistration {
  userId: string;
  serviceIds: string[];
  experience: string;
  location: {
    city: string;
    area: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  skills?: string[];
  bio: string;
  availability: {
    [key: string]: string[];
  };
}

// Client Registration
export interface ClientRegistration {
  userId: string;
  name: string;
  mobileNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  location: string;
  preferences?: {
    preferredServices?: string[];
    preferredTimes?: string[];
  };
} 
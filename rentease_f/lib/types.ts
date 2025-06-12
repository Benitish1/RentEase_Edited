export interface Property {
  id: number;
  title: string;
  description: string;
  type: 'house' | 'apartment' | 'condo' | 'studio' | 'villa';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RENTED';
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string | null;
  neighborhood: string | null;
  city: string;
  district: string | null;
  furnished: 'fully' | 'partially' | 'unfurnished';
  availableFrom: string;
  mainPhoto: string;
  additionalPhotos: string[];
  videoUrl: string | null;
  deposit: number;
  minLeaseMonths: number;
  utilitiesIncluded: string[];
  pets: string | null;
  smoking: string | null;
  events: string | null;
  maxOccupants: number;
  yearBuilt: number;
  parkingSpaces: number;
  amenities: string[];
  landlordId: number;
  landlordName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PropertyFormData = {
  title: string;
  description: string;
  type: "house" | "apartment" | "condo" | "studio" | "villa";
  status: "PENDING" | "APPROVED" | "REJECTED" | "RENTED";
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  neighborhood: string;
  city: string;
  district: string;
  furnished: "fully" | "partially" | "unfurnished";
  availableFrom: string;
  mainPhoto?: File;
  additionalPhotos?: File[];
};

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 
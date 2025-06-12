// lib/api.ts
import axios from "axios";
import { Property, PropertyFormData, ApiResponse, PaginatedResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

// Basic Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
      throw new Error(
        "No response from server. Please check if the server is running."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
      throw error;
    }
  }
);

// === AUTH ENDPOINTS ===

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'LANDLORD' | 'TENANT' | 'ADMIN';
}

export const signup = async (userData: UserData): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerLandlord = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string
): Promise<ApiResponse<any>> => {
  return signup({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: "LANDLORD",
  });
};

export const registerTenant = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string
): Promise<ApiResponse<any>> => {
  return signup({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: "TENANT",
  });
};

export const registerAdmin = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string
): Promise<ApiResponse<any>> => {
  return signup({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: "ADMIN",
  });
};

export const registerSampleLandlord = async () => {
  return registerLandlord(
    "John",
    "Doe",
    "john.doe@example.com",
    "+1234567890",
    "Landlord123!"
  );
};

export const registerSampleTenant = async () => {
  return registerTenant(
    "Jane",
    "Smith",
    "jane.smith@example.com",
    "+1987654321",
    "Tenant123!"
  );
};

export const registerSampleAdmin = async () => {
  return registerAdmin(
    "Admin",
    "User",
    "admin@rentease.com",
    "+1122334455",
    "Admin123!"
  );
};

// === LOGIN FUNCTIONS ===

interface LoginData {
  email: string;
  password: string;
  role: 'LANDLORD' | 'TENANT' | 'ADMIN';
}

export const login = async (email: string, password: string, role: 'LANDLORD' | 'TENANT' | 'ADMIN'): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginLandlord = async (email: string, password: string): Promise<ApiResponse<any>> => {
  return login(email, password, "LANDLORD");
};

export const loginTenant = async (email: string, password: string): Promise<ApiResponse<any>> => {
  return login(email, password, "TENANT");
};

export const loginAdmin = async (email: string, password: string): Promise<ApiResponse<any>> => {
  return login(email, password, "ADMIN");
};

// === LOGOUT FUNCTION ===

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  return { success: true, message: "Logged out successfully" };
};

// === USER PROFILE (REMOVE IF NOT USED) ===

export const fetchProfile = async () => {
  try {
    const response = await apiClient.get("/user/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// === PROPERTY ENDPOINTS ===

export const getProperties = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  furnished?: boolean;
}): Promise<PaginatedResponse<Property>> => {
  try {
    const response = await apiClient.get('/properties', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPropertyById = async (id: number): Promise<Property> => {
  try {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPropertiesByLandlord = async (landlordId: number): Promise<Property[]> => {
  try {
    const response = await apiClient.get(`/properties/landlord/${landlordId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProperty = async (
  propertyData: PropertyFormData,
  images: File[],
  landlordId: number
): Promise<Property> => {
  try {
    const formData = new FormData();
    formData.append(
      "property",
      new Blob([JSON.stringify(propertyData)], {
        type: "application/json",
      })
    );

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await apiClient.post("/properties", formData, {
      params: { landlordId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProperty = async (id: number, landlordId: number, formData: FormData): Promise<Property> => {
  try {
    // Create a new FormData object to ensure proper structure
    const requestData = new FormData();
    
    // Extract all form data into a flat object
    const propertyData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== 'images' && key !== 'mainPhoto' && key !== 'additionalPhotos') {
        propertyData[key] = value;
      }
    });

    // Add existing images to the property data
    const mainPhoto = formData.get('mainPhoto');
    if (mainPhoto) {
      propertyData.mainPhoto = mainPhoto;
    }

    const additionalPhotos = formData.getAll('additionalPhotos');
    if (additionalPhotos.length > 0) {
      propertyData.additionalPhotos = additionalPhotos;
    }
    
    // Add the property data as a JSON string with the correct part name
    requestData.append('property', new Blob([JSON.stringify(propertyData)], { type: 'application/json' }));
    
    // Add any new images
    const images = formData.getAll('images');
    images.forEach((image) => {
      if (image instanceof File) {
        requestData.append('images', image);
      }
    });

    const response = await apiClient.put<Property>(`/properties/${id}`, requestData, {
      params: { landlordId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId: number, landlordId: number): Promise<void> => {
  try {
    await apiClient.delete(`/properties/${propertyId}`, {
      params: { landlordId },
    });
  } catch (error) {
    throw error;
  }
};

// === FORGOT PASSWORD ===
export const forgotPassword = async (email: string): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export the API client for direct use if needed
export default apiClient;

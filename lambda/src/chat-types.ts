/**
 * @fileoverview Search filter types and constants
 * @semantic types, search, filters
 */

export interface SearchFilters {
  city: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  residentialType: string | null;
}

export interface ChatRequest {
  message: string;
  chatHistory?: Array<{ role: string; content: string }>;
  currentFilters?: Partial<SearchFilters>;
  searchResults?: any[];
}

export interface ChatResponse {
  filters: SearchFilters | null;
  response: string;
  model: string;
}

export interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
}

export const CT_CITIES = [
  'West Hartford', 'Hartford', 'New Haven', 'Stamford', 'Bridgeport',
  'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'Bristol',
  'Meriden', 'Milford', 'West Haven', 'Middletown', 'Shelton',
  'Norwich', 'Torrington', 'Groton', 'Stratford', 'Manchester',
  'South Windsor', 'Glastonbury', 'Farmington', 'Simsbury', 'Avon',
];

export const VALID_PROPERTY_TYPES = ['Residential', 'Commercial', 'Land'];
export const VALID_RESIDENTIAL_TYPES = ['Single Family', 'Condo', 'Multi-Family', 'Townhouse'];

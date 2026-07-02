/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MalaysianState = 'Kuala Lumpur' | 'Selangor' | 'Johor' | 'Penang';

export type PropertyType = 'Serviced Apartment' | 'Condo' | 'Landed' | 'Penthouse';

export interface Project {
  id: string;
  name: string;
  developer: string;
  state: MalaysianState;
  area: string;
  priceMin: number; // in MYR
  priceMax: number; // in MYR
  completionYear: number;
  propertyType: PropertyType;
  tenure: 'Freehold' | 'Leasehold';
  furnishing: 'Fully Furnished' | 'Partly Furnished' | 'Unfurnished';
  bedrooms: number;
  bathrooms: number;
  carPark: number; // number of car park bays
  totalUnits: number; // total units in development
  totalFloors: number; // number of floors/stories
  builtUpMin: number; // sqft
  builtUpMax: number; // sqft
  maintenanceFee: number; // RM per sqft
  airbnbFriendly: boolean;
  investmentScore: number; // 1-10
  ownStayScore: number; // 1-10
  rentalYield: number; // e.g. 6.2 (represents 6.2%)
  keyHighlights: string[];
  nearbyAmenities: string[];
  image: string;
  gallery: string[];
  locationImage?: string;
  layoutPlans?: { name: string; imageUrl: string; description: string; sizeSqft?: number }[];
  featured: boolean;
  vrTourLink: string;
  droneViewLink: string;
  description: string;
  lat?: number;
  lng?: number;
  allDriveFiles?: { name: string; url: string }[];
  // Additional enriched attributes from Full Details tab
  location?: string;
  landTitle?: string;
  noOfBlocks?: number;
  pricePsf?: string;
  carparkMin?: number;
  carparkMax?: number;
  estCompletionDate?: string;
  launchDate?: string;
  readyToMove?: boolean;
  underConstruction?: boolean;
  newLaunch?: boolean;
  dataUpdated?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectInterested?: string;
  budgetRange?: string;
  purpose?: string;
  timestamp: string;
  status: 'New' | 'In Contact' | 'Qualified' | 'Archived';
}

export interface Article {
  id: string;
  title: string;
  titleZh?: string;
  category: 'Investment' | 'Own Stay' | 'Loan Tips' | 'Foreign Buyer' | 'Market Trends';
  image: string;
  readTime: string;
  readTimeZh?: string;
  date: string;
  dateZh?: string;
  summary: string;
  summaryZh?: string;
  content: string;
  contentZh?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionZh?: string;
  answer: string;
  answerZh?: string;
  category: string;
  categoryZh?: string;
}

export type CurrencyCode = 'MYR' | 'SGD' | 'USD' | 'CNY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Conversion rate from 1 MYR to target currency (e.g., USD is ~0.21, SGD ~0.29)
}

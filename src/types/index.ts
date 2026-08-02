export type DemographicType = 'child' | 'teen_adult' | 'elderly';
export type NeedCategory = 'food' | 'housing' | 'healthcare' | 'clothing_supplies';

export interface UserProfile {
  id: string;
  name: string;
  demographic: DemographicType;
  needs: NeedCategory[];
  code: string;
}

export interface ShelterItem {
  id: string;
  name: string;
  category: NeedCategory;
  quantity: number;
  hardCapPerUser: number;
  allowedDemographics: Record<DemographicType, boolean>;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  inventory: ShelterItem[];
}

export interface ClaimRecord {
  id: string;
  timestamp: string;
  userId: string;
  shelterId: string;
  itemId: string;
  quantity: number;
  itemName: string;
}

export interface AllocationCheckResult {
  allowed: boolean;
  maxAllowedQuantity: number;
  reason?: string;
}

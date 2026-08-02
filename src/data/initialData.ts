import type { UserProfile, Shelter, ClaimRecord } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  { id: 'USR-101', name: 'Family with Infant', demographic: 'child', needs: ['food', 'clothing_supplies'], code: '101-CHD' },
  { id: 'USR-202', name: 'Alex Rivera', demographic: 'teen_adult', needs: ['food', 'housing'], code: '202-ADL' },
  { id: 'USR-303', name: 'Margaret Chen', demographic: 'elderly', needs: ['food', 'healthcare'], code: '303-ELD' }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'SHELTER-01',
    name: 'Downtown Hope Hub',
    address: '124 Main Street',
    lat: 40.7128,
    lng: -74.0060,
    inventory: [
      {
        id: 'ITEM-1',
        name: 'Infant Formula & Diapers',
        category: 'clothing_supplies',
        quantity: 15,
        hardCapPerUser: 2,
        allowedDemographics: { child: true, teen_adult: false, elderly: false }
      },
      {
        id: 'ITEM-2',
        name: 'High-Protein Meal Box',
        category: 'food',
        quantity: 40,
        hardCapPerUser: 4,
        allowedDemographics: { child: true, teen_adult: true, elderly: true }
      }
    ]
  },
  {
    id: 'SHELTER-02',
    name: 'St. Jude Health Station',
    address: '458 Park Avenue',
    lat: 40.7250,
    lng: -73.9910,
    inventory: [
      {
        id: 'ITEM-3',
        name: 'Senior Mobility Care Pack',
        category: 'healthcare',
        quantity: 10,
        hardCapPerUser: 1,
        allowedDemographics: { child: false, teen_adult: false, elderly: true }
      }
    ]
  }
];
export const INITIAL_CLAIMS: ClaimRecord[] = [];
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Shelter, UserProfile, ClaimRecord, AllocationCheckResult, ShelterItem, NeedCategory, DemographicType } from '../types';
import { INITIAL_SHELTERS, INITIAL_USERS } from '../data/initialData';

interface ResourceContextType {
  shelters: Shelter[];
  users: UserProfile[];
  claims: ClaimRecord[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  checkAllocation: (userId: string, shelterId: string, itemId: string, requestedQty: number) => AllocationCheckResult;
  processClaim: (userId: string, shelterId: string, itemId: string, quantity: number) => boolean;
  addUser: (name: string, demographic: UserProfile['demographic']) => void;
  addShelter: (name: string, address: string, lat: number, lng: number) => void;
  // NEW: Function to add items to a shelter
  addShelterItem: (shelterId: string, name: string, category: NeedCategory, quantity: number, hardCapPerUser: number, allowedDemographics: Record<DemographicType, boolean>) => void;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const addUser = (name: string, demographic: UserProfile['demographic']) => {
    const newUser: UserProfile = {
      id: `USR-${Date.now()}`, name, demographic, needs: ['food', 'clothing_supplies'],
      code: `${Math.floor(Math.random() * 900) + 100}-${demographic.substring(0, 3).toUpperCase()}`
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const addShelter = (name: string, address: string, lat: number, lng: number) => {
    const defaultInventory: ShelterItem[] = [
      { id: `ITEM-${Date.now()}-1`, name: 'Emergency Blankets', category: 'clothing_supplies', quantity: 50, hardCapPerUser: 2, allowedDemographics: { child: true, teen_adult: true, elderly: true } },
    ];
    const newShelter: Shelter = { id: `SHELTER-${Date.now()}`, name, address, lat, lng, inventory: defaultInventory };
    setShelters(prev => [...prev, newShelter]);
  };

  // NEW: Logic to append an item to a specific shelter's inventory array
  const addShelterItem = (shelterId: string, name: string, category: NeedCategory, quantity: number, hardCapPerUser: number, allowedDemographics: Record<DemographicType, boolean>) => {
    setShelters(prevShelters => prevShelters.map(shelter => {
      if (shelter.id !== shelterId) return shelter;
      const newItem: ShelterItem = {
        id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name, category, quantity, hardCapPerUser, allowedDemographics
      };
      return { ...shelter, inventory: [...shelter.inventory, newItem] };
    }));
  };

  const checkAllocation = (userId: string, shelterId: string, itemId: string, requestedQty: number): AllocationCheckResult => {
    const user = users.find(u => u.id === userId);
    const shelter = shelters.find(s => s.id === shelterId);
    const item = shelter?.inventory.find(i => i.id === itemId);

    if (!user || !shelter || !item) return { allowed: false, maxAllowedQuantity: 0, reason: "Invalid data." };
    if (!item.allowedDemographics[user.demographic]) return { allowed: false, maxAllowedQuantity: 0, reason: `Item restricted. Not available for ${user.demographic.replace('_', ' ')} demographic.` };

    const previouslyClaimed = claims.filter(c => c.userId === userId && c.itemId === itemId).reduce((sum, record) => sum + record.quantity, 0);
    const remainingCap = item.hardCapPerUser - previouslyClaimed;

    if (remainingCap <= 0) return { allowed: false, maxAllowedQuantity: 0, reason: `You have reached the maximum limit (${item.hardCapPerUser}) for this item.` };

    const actualAvailable = Math.min(item.quantity, remainingCap);
    if (requestedQty > actualAvailable) return { allowed: false, maxAllowedQuantity: actualAvailable, reason: `Cannot claim ${requestedQty}. You are only eligible for ${actualAvailable} more.` };

    return { allowed: true, maxAllowedQuantity: actualAvailable };
  };

  const processClaim = (userId: string, shelterId: string, itemId: string, quantity: number) => {
    const check = checkAllocation(userId, shelterId, itemId, quantity);
    if (!check.allowed) return false;

    setShelters(prevShelters => prevShelters.map(shelter => {
      if (shelter.id !== shelterId) return shelter;
      return { ...shelter, inventory: shelter.inventory.map(item => item.id !== itemId ? item : { ...item, quantity: item.quantity - quantity }) };
    }));

    const shelter = shelters.find(s => s.id === shelterId);
    const item = shelter?.inventory.find(i => i.id === itemId);

    setClaims(prev => [{ id: `CLM-${Date.now()}`, timestamp: new Date().toISOString(), userId, shelterId, itemId, itemName: item?.name || 'Unknown', quantity }, ...prev]);
    return true;
  };

  return (
    <ResourceContext.Provider value={{ shelters, users, claims, currentUser, setCurrentUser, checkAllocation, processClaim, addUser, addShelter, addShelterItem }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResource = () => {
  const context = useContext(ResourceContext);
  if (!context) throw new Error("useResource must be used within a ResourceProvider");
  return context;
};
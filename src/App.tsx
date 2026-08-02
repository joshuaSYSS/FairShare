import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Package, MapPin, User, AlertCircle, CheckCircle2, Plus, X, Box } from 'lucide-react';
import { useResource } from './context/ResourceContext';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const MapUpdater = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15); }, [lat, lng, map]);
  return null;
};

const MapClickListener = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

export default function App() {
  const { shelters, users, currentUser, setCurrentUser, checkAllocation, processClaim, addUser, addShelter, addShelterItem } = useResource();
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [claimQuantities, setClaimQuantities] = useState<Record<string, number>>({});

  // UI States
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserDemo, setNewUserDemo] = useState<'child' | 'teen_adult' | 'elderly'>('teen_adult');

  const [addingShelterMode, setAddingShelterMode] = useState(false);
  const [newShelterCoord, setNewShelterCoord] = useState<{lat: number, lng: number} | null>(null);
  const [newShelterName, setNewShelterName] = useState('');
  const [newShelterAddress, setNewShelterAddress] = useState('');

  // NEW: Add Item Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'food' | 'housing' | 'healthcare' | 'clothing_supplies'>('food');
  const [newItemQty, setNewItemQty] = useState(50);
  const [newItemCap, setNewItemCap] = useState(2);
  const [demoChild, setDemoChild] = useState(true);
  const [demoTeen, setDemoTeen] = useState(true);
  const [demoElderly, setDemoElderly] = useState(true);

  const selectedShelter = shelters.find(s => s.id === selectedShelterId);

  const handleClaim = (itemId: string) => {
    if (!selectedShelter) return;
    const qty = claimQuantities[itemId] || 1;
    const success = processClaim(currentUser.id, selectedShelter.id, itemId, qty);
    if (success) {
      alert('Claim successful!');
      setClaimQuantities(prev => ({ ...prev, [itemId]: 1 }));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName, newUserDemo);
      setShowUserModal(false);
      setNewUserName('');
    }
  };

  const handleAddShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShelterName.trim() && newShelterAddress.trim() && newShelterCoord) {
      addShelter(newShelterName, newShelterAddress, newShelterCoord.lat, newShelterCoord.lng);
      setAddingShelterMode(false);
      setNewShelterCoord(null);
      setNewShelterName('');
      setNewShelterAddress('');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShelter && newItemName.trim()) {
      addShelterItem(selectedShelter.id, newItemName, newItemCategory, newItemQty, newItemCap, {
        child: demoChild,
        teen_adult: demoTeen,
        elderly: demoElderly
      });
      setShowItemModal(false);
      setNewItemName('');
      setNewItemQty(50);
      setNewItemCap(2);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans">

      {/* LEFT SIDEBAR: Dashboard */}
      <div className="w-1/3 bg-white h-full shadow-xl flex flex-col overflow-y-auto relative z-10">
        <div className="p-6 bg-blue-600 text-white shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package /> FairShare</h1>
            <p className="text-blue-100 text-sm mt-1">Fairness & Allocation Engine</p>
          </div>
          <button 
            onClick={() => { setAddingShelterMode(true); setSelectedShelterId(null); }}
            className="bg-blue-500 hover:bg-blue-400 p-2 rounded-full transition-colors"
            title="Add a new shelter"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* User Simulator */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Simulate User View</label>
            <button onClick={() => setShowUserModal(true)} className="text-blue-600 text-sm font-bold hover:underline flex items-center">
              <Plus size={14} /> New User
            </button>
          </div>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            value={currentUser.id}
            onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value)!)}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.demographic.replace('_', ' ')})</option>
            ))}
          </select>
          <div className="mt-3 flex gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <User size={16} className="text-blue-500" />
            <span>Active ID: <strong>{currentUser.code}</strong></span>
          </div>
        </div>

        {/* Shelter Details */}
        <div className="p-6 flex-1">
          {addingShelterMode ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl animate-in fade-in">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-yellow-800">Add New Shelter</h2>
                <button onClick={() => setAddingShelterMode(false)} className="text-yellow-600 hover:text-yellow-900"><X size={20}/></button>
              </div>
              {!newShelterCoord ? (
                <div className="text-center p-6 border-2 border-dashed border-yellow-400 rounded-lg bg-white">
                  <MapPin className="mx-auto text-yellow-500 mb-2 animate-bounce" size={32} />
                  <p className="font-semibold text-gray-700">Click anywhere on the map to place the new shelter.</p>
                </div>
              ) : (
                <form onSubmit={handleAddShelter} className="space-y-3">
                  <p className="text-sm text-green-600 font-semibold mb-2 flex items-center gap-1"><CheckCircle2 size={16}/> Location Selected</p>
                  <input required placeholder="Shelter Name" className="w-full p-2 border rounded" value={newShelterName} onChange={e => setNewShelterName(e.target.value)} />
                  <input required placeholder="Street Address" className="w-full p-2 border rounded" value={newShelterAddress} onChange={e => setNewShelterAddress(e.target.value)} />
                  <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded">Create Shelter</button>
                </form>
              )}
            </div>
          ) : !selectedShelter ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin size={48} className="mb-4 opacity-50" />
              <p>Select a shelter on the map to view inventory</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedShelter.name}</h2>
                  <p className="text-gray-500 flex items-center gap-1 text-sm mt-1"><MapPin size={14} /> {selectedShelter.address}</p>
                </div>
                {/* NEW: Add Inventory Button */}
                <button 
                  onClick={() => setShowItemModal(true)}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {selectedShelter.inventory.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                    <Box className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No inventory at this location.</p>
                  </div>
                )}

                {selectedShelter.inventory.map(item => {
                  const requestedQty = claimQuantities[item.id] || 1;
                  const allocation = checkAllocation(currentUser.id, selectedShelter.id, item.id, requestedQty);

                  return (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{item.name}</h3>
                          <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold">{item.category.replace('_', ' ')}</span>
                        </div>
                        <div className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-full text-sm">{item.quantity} left</div>
                      </div>

                      <div className={`mt-3 p-3 rounded-lg text-sm flex gap-2 items-start ${allocation.allowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {allocation.allowed ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5 min-w-[16px]" />}
                        <p>{allocation.allowed ? `Eligible to claim up to ${allocation.maxAllowedQuantity}` : allocation.reason}</p>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <input 
                          type="number" min="1" max={item.quantity} value={requestedQty}
                          onChange={(e) => setClaimQuantities(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))}
                          className="w-20 p-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100"
                          disabled={!allocation.allowed && allocation.maxAllowedQuantity === 0}
                        />
                        <button 
                          onClick={() => handleClaim(item.id)} disabled={!allocation.allowed}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          Claim Items
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Map */}
      <div className="w-2/3 h-full relative z-0">
        <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {addingShelterMode && <MapClickListener onMapClick={(lat, lng) => setNewShelterCoord({lat, lng})} />}
          {selectedShelter && !addingShelterMode && <MapUpdater lat={selectedShelter.lat} lng={selectedShelter.lng} />}
          {newShelterCoord && <Marker position={[newShelterCoord.lat, newShelterCoord.lng]} opacity={0.6} />}

          {shelters.map(shelter => (
            <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} eventHandlers={{ click: () => { setSelectedShelterId(shelter.id); setAddingShelterMode(false); }}}>
              <Popup><strong>{shelter.name}</strong><br/>{shelter.inventory.reduce((acc, curr) => acc + curr.quantity, 0)} items available</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Person</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Full Name</label><input required autoFocus className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={newUserName} onChange={e => setNewUserName(e.target.value)} /></div>
              <div>
                <label className="block text-sm font-semibold mb-1">Demographic Group</label>
                <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={newUserDemo} onChange={e => setNewUserDemo(e.target.value as any)}>
                  <option value="child">Child / Family with Infant</option>
                  <option value="teen_adult">Teen / Adult</option>
                  <option value="elderly">Elderly / Senior</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">Create User ID</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Add Item Modal */}
      {showItemModal && selectedShelter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Inventory Item</h2>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Item Name (e.g. Baby Formula)</label>
                <input required autoFocus className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Total Qty</label>
                  <input type="number" required min="1" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Max Per User</label>
                  <input type="number" required min="1" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={newItemCap} onChange={e => setNewItemCap(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-blue-700">Fairness Rules: Who can claim this?</label>
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={demoChild} onChange={e => setDemoChild(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /> 
                    Children & Families with Infants
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={demoTeen} onChange={e => setDemoTeen(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /> 
                    Teens & Adults
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={demoElderly} onChange={e => setDemoElderly(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /> 
                    Elderly / Seniors
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4">Add to Inventory</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchCustomerDashboard } from '@/lib/redux/slices/orderSlice';
import api from '@/lib/axios';
import { useState } from 'react';

export default function CustomerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { purchases, customerOrders, loading } = useSelector((state: RootState) => state.orders);
  
  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
  const loadProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfile(data);
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      if (profileImageFile) {
        formData.append('image', profileImageFile);
      }
      await api.put('/users/profile', formData);
      alert('Profile updated!');
      setEditingProfile(false);
      setProfileImageFile(null);
      loadProfile();
    } catch (err) {
      alert('Error updating profile');
    }
  };

  useEffect(() => {
    if (user?.role === 'customer') {
      dispatch(fetchCustomerDashboard());
      loadProfile();
    } else if (user) {
      window.location.href = '/';
    }
  }, [dispatch, user]);

  if (!user || user.role !== 'customer') return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-12 bg-brand-charcoal p-8 rounded-lg border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-gold to-brand-champagne"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 z-10 w-full">
            <div className="relative group">
              {profileImageFile ? (
                <img src={URL.createObjectURL(profileImageFile)} alt="preview" className="w-32 h-32 rounded-full object-cover border-2 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
              ) : profile?.profile_image_url ? (
                <img src={profile.profile_image_url} alt={user.name} className="w-32 h-32 rounded-full object-cover border-2 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-900 border-2 border-brand-gold flex items-center justify-center text-brand-gold text-4xl font-serif">
                  {user.name[0]}
                </div>
              )}
              {editingProfile && (
                <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white uppercase tracking-widest text-center px-2">Select Image below</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-serif text-white mb-2">{user.name}</h1>
              <p className="text-brand-gold uppercase tracking-widest text-sm mb-6">Collector</p>
              
              {/* Gamification Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                {profile?.badges && profile.badges.map((badge: string, i: number) => (
                  <span key={i} className="bg-brand-dark/50 border border-brand-gold/50 text-brand-gold px-3 py-1 text-xs uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                    🏆 {badge}
                  </span>
                ))}
              </div>

              {editingProfile ? (
                <div className="space-y-3 max-w-md mx-auto md:mx-0">
                  <input type="file" accept="image/*" className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-champagne cursor-pointer" onChange={e => setProfileImageFile(e.target.files ? e.target.files[0] : null)} />
                  <div className="flex space-x-2">
                    <button onClick={saveProfile} className="flex-1 bg-brand-gold text-brand-dark py-2 text-xs font-bold uppercase tracking-widest rounded hover:bg-brand-champagne transition">Save</button>
                    <button onClick={() => setEditingProfile(false)} className="flex-1 bg-gray-800 text-gray-300 py-2 text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-700 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditingProfile(true)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-brand-gold border border-gray-700 px-4 py-2 rounded transition">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-brand-gold animate-pulse text-lg">Syncing your collection...</div>
        ) : (
          <div className="space-y-16">
            {/* Private Collection (Purchases) */}
            <section>
              <h2 className="text-2xl font-serif text-white border-b border-gray-800 pb-4 mb-6">Your Private Collection</h2>
              {purchases.length === 0 ? (
                <p className="text-gray-500 italic">You haven't acquired any 1-of-1 pieces yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {purchases.map((p) => (
                    <div key={p.id} className="bg-brand-charcoal border border-brand-gold/30 rounded p-4">
                      <div className="h-40 bg-gray-900 mb-4 overflow-hidden rounded relative">
                         <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                         <div className="absolute bottom-2 right-2 bg-brand-dark/80 text-brand-gold text-[10px] px-2 py-1 uppercase tracking-widest border border-brand-gold/50">Owned</div>
                      </div>
                      <h3 className="font-serif text-white text-lg truncate">{p.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">By {p.artist_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Custom Orders Status */}
            <section className="mt-16">
              <div className="bg-gradient-to-r from-gray-900 to-brand-charcoal p-8 rounded-lg border-l-4 border-l-brand-gold shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <span className="text-9xl font-serif">🛠️</span>
                </div>
                <h2 className="text-3xl font-serif text-white mb-2 relative z-10">Commissioned Masterpieces</h2>
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-8 relative z-10">Track your exclusive custom orders</p>
              {customerOrders.length === 0 ? (
                <p className="text-gray-500 italic">No active custom orders.</p>
              ) : (
                <div className="bg-brand-charcoal rounded border border-gray-800 overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase tracking-widest text-xs">
                      <tr>
                        <th className="px-6 py-4">Artist</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {customerOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-800/50 transition">
                          <td className="px-6 py-4 font-semibold text-white">{order.artist_name}</td>
                          <td className="px-6 py-4 truncate max-w-[200px]">{order.description}</td>
                          <td className="px-6 py-4 text-brand-gold">${Number(order.agreed_price).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded ${order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

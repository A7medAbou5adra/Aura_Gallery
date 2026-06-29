'use client';
import Header from '@/components/layout/Header';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { fetchArtworks } from '@/lib/redux/slices/artworkSlice';

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { artworks } = useSelector((state: RootState) => state.artworks);
  const dispatch = useDispatch<AppDispatch>();

  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [newArtist, setNewArtist] = useState({ name: '', email: '', password: '', bio: '', custom_order_price: '', profile_image_url: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    } else if (user?.role === 'admin') {
      dispatch(fetchArtworks());
      loadPendingPurchases();
      loadArtists();
    }
  }, [user, dispatch]);

  const loadArtists = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setArtists(data.filter((u: any) => u.role === 'artist'));
    } catch (err) {
      console.error(err);
    }
  };

  const loadPendingPurchases = async () => {
    try {
      const { data } = await api.get('/admin/purchases/pending');
      setPendingPurchases(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/artists', newArtist);
      alert('Artist created successfully!');
      setNewArtist({ name: '', email: '', password: '', bio: '', custom_order_price: '', profile_image_url: '' });
      loadArtists();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating artist');
    }
  };

  const handleDeleteArtist = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this artist?')) return;
    try {
      await api.delete(`/admin/artists/${id}`);
      alert('Artist deleted!');
      loadArtists();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting artist');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/admin/purchases/${id}/approve`);
      alert('Purchase approved!');
      loadPendingPurchases();
      dispatch(fetchArtworks());
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/admin/purchases/${id}/reject`);
      alert('Purchase rejected!');
      loadPendingPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error rejecting');
    }
  };

  const handleUpdateArtworkStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/artworks/${id}/status`, { status });
      alert('Artwork status updated!');
      dispatch(fetchArtworks());
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-gradient mb-8">Admin Command Center</h1>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Registered Artists</h3>
            <p className="text-3xl font-serif text-brand-gold">{artists.length}</p>
          </div>
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Pending Purchases</h3>
            <p className="text-3xl font-serif text-white">{pendingPurchases.length}</p>
          </div>
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Gallery Size</h3>
            <p className="text-3xl font-serif text-white">{artworks.length}</p>
          </div>
        </div>
        
        {/* Pending Purchases */}
        <div className="bg-brand-charcoal rounded border border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-700 pb-4">Pending Purchase Approvals</h2>
          {pendingPurchases.length === 0 ? (
            <p className="text-gray-400">No pending requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingPurchases.map(p => (
                <div key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 p-4 rounded border border-gray-800 gap-4 md:gap-0">
                  <div>
                    <p className="text-white font-bold">{p.title}</p>
                    <p className="text-sm text-gray-400">Buyer: {p.customer_name} | Amount: ${Number(p.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2 w-full md:w-auto">
                    <button onClick={() => handleApprove(p.id)} className="flex-1 md:flex-none bg-green-600/20 text-green-500 border border-green-500 px-4 py-2 text-sm uppercase tracking-wider hover:bg-green-600 hover:text-white transition text-center">Approve</button>
                    <button onClick={() => handleReject(p.id)} className="flex-1 md:flex-none bg-red-600/20 text-red-500 border border-red-500 px-4 py-2 text-sm uppercase tracking-wider hover:bg-red-600 hover:text-white transition text-center">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Artist Form */}
          <div className="bg-brand-charcoal rounded border border-gray-800 p-6">
            <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-700 pb-4">Create Artist Account</h2>
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <input type="text" placeholder="Name" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold" value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold" value={newArtist.email} onChange={e => setNewArtist({...newArtist, email: e.target.value})} />
              <input type="password" placeholder="Password" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold" value={newArtist.password} onChange={e => setNewArtist({...newArtist, password: e.target.value})} />
              <input type="text" placeholder="Profile Image URL" className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold" value={newArtist.profile_image_url} onChange={e => setNewArtist({...newArtist, profile_image_url: e.target.value})} />
              <input type="number" placeholder="Base Custom Order Price ($)" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold" value={newArtist.custom_order_price} onChange={e => setNewArtist({...newArtist, custom_order_price: e.target.value})} />
              <textarea placeholder="Biography" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-gold h-24" value={newArtist.bio} onChange={e => setNewArtist({...newArtist, bio: e.target.value})}></textarea>
              <button type="submit" className="w-full py-3 bg-brand-gold text-brand-dark font-bold rounded hover:bg-brand-champagne transition uppercase tracking-widest text-sm">Create Artist</button>
            </form>
          </div>

          {/* Artwork Management */}
          <div className="bg-brand-charcoal rounded border border-gray-800 p-6">
            <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-700 pb-4">Gallery Management</h2>
            <div className="h-96 overflow-y-auto space-y-3 pr-2">
              {artworks.map(art => (
                <div key={art.id} className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800">
                  <div className="flex items-center space-x-3">
                    <img src={art.image_url} alt="thumb" className="w-10 h-10 object-cover" />
                    <div>
                      <p className="text-white text-sm font-bold truncate w-32">{art.title}</p>
                    </div>
                  </div>
                  <select 
                    value={art.status}
                    onChange={(e) => handleUpdateArtworkStatus(art.id, e.target.value)}
                    className="bg-brand-dark border border-gray-700 text-brand-gold text-xs px-2 py-1 rounded focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Artist Management Grid */}
        <div className="mt-8 bg-brand-charcoal rounded border border-gray-800 p-6">
          <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-700 pb-4">Artist Roster Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map(artist => (
              <div key={artist.id} className="bg-gray-900 p-4 rounded border border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">{artist.name}</h3>
                  <p className="text-gray-500 text-xs">{artist.email}</p>
                </div>
                <button onClick={() => handleDeleteArtist(artist.id)} className="text-red-500 hover:text-red-400 text-sm border border-red-500/30 px-3 py-1 rounded transition bg-red-500/10 hover:bg-red-500/20 uppercase tracking-widest text-[10px]">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

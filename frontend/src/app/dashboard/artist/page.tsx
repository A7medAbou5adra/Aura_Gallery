'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchArtistDashboard } from '@/lib/redux/slices/orderSlice';
import { createArtwork } from '@/lib/redux/slices/artworkSlice';
import { useState } from 'react';

export default function ArtistDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [showMintForm, setShowMintForm] = useState(false);
  const [newArt, setNewArt] = useState({ title: '', description: '', price: '', image_url: '' });

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createArtwork({ ...newArt, price: Number(newArt.price) }))
      .unwrap()
      .then(() => {
        alert('Artwork minted successfully!');
        setShowMintForm(false);
        setNewArt({ title: '', description: '', price: '', image_url: '' });
      })
      .catch(err => alert(err));
  };
  const { user } = useSelector((state: RootState) => state.auth);
  const { artistOrders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (user?.role === 'artist') {
      dispatch(fetchArtistDashboard());
    } else if (user) {
      window.location.href = '/';
    }
  }, [dispatch, user]);

  if (!user || user.role !== 'artist') return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif text-white mb-2">{user.name}'s Studio</h1>
            <p className="text-brand-gold uppercase tracking-widest text-sm">Creator Dashboard</p>
          </div>
          <button onClick={() => setShowMintForm(!showMintForm)} className="px-6 py-3 bg-brand-gold text-brand-dark font-bold uppercase tracking-widest text-sm rounded hover:bg-brand-champagne transition shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            {showMintForm ? 'Cancel' : 'Mint New Artwork'}
          </button>
        </div>

        {showMintForm && (
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800 shadow-lg mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">Mint Masterpiece</h2>
            <form onSubmit={handleMint} className="space-y-4 max-w-2xl">
              <input type="text" placeholder="Title" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold" value={newArt.title} onChange={e => setNewArt({...newArt, title: e.target.value})} />
              <input type="number" placeholder="Price ($)" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold" value={newArt.price} onChange={e => setNewArt({...newArt, price: e.target.value})} />
              <input type="text" placeholder="High-Res Image URL" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold" value={newArt.image_url} onChange={e => setNewArt({...newArt, image_url: e.target.value})} />
              <textarea placeholder="Description" required className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold h-32" value={newArt.description} onChange={e => setNewArt({...newArt, description: e.target.value})}></textarea>
              <button type="submit" className="px-8 py-3 bg-brand-gold text-brand-dark font-bold uppercase tracking-widest text-sm hover:bg-brand-champagne transition shadow-[0_0_15px_rgba(212,175,55,0.4)]">Publish to Gallery</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-brand-gold animate-pulse text-lg">Loading studio data...</div>
        ) : (
          <div className="space-y-16">
            {/* Custom Orders Requests */}
            <section>
              <h2 className="text-2xl font-serif text-white border-b border-gray-800 pb-4 mb-6">Incoming Commissions</h2>
              {artistOrders.length === 0 ? (
                <p className="text-gray-500 italic">No incoming commission requests.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artistOrders.map((order) => (
                    <div key={order.id} className="bg-brand-charcoal p-6 rounded border border-gray-800 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-white text-xl">From: {order.customer_name}</h3>
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded ${order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-800 text-gray-300'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-6 bg-gray-900 p-4 rounded italic">"{order.description}"</p>
                      <div className="flex items-center justify-between">
                        <p className="text-brand-gold text-xl">${Number(order.agreed_price).toLocaleString()}</p>
                        {order.status === 'pending' && (
                          <div className="space-x-3">
                            <button className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition">Decline</button>
                            <button className="px-4 py-2 bg-brand-dark border border-brand-gold text-brand-gold rounded text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-dark transition">Accept</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

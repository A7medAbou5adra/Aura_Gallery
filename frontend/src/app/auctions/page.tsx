'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchAuctions, placeBid } from '@/lib/redux/slices/auctionSlice';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Auctions() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { auctions, loading, error } = useSelector((state: RootState) => state.auctions);
  const { user } = useSelector((state: RootState) => state.auth);
  const [bids, setBids] = useState<{[key: number]: string}>({});

  const handleBid = (id: number, currentBid: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      alert('Only Collectors can place bids.');
      return;
    }
    const amount = Number(bids[id]);
    if (!amount || amount <= Number(currentBid)) {
      alert('Your bid must be higher than the current bid.');
      return;
    }
    
    dispatch(placeBid({ artwork_id: id, bid_amount: amount }))
      .unwrap()
      .then(() => alert('Bid placed successfully!'))
      .catch(err => alert(err));
  };

  useEffect(() => {
    dispatch(fetchAuctions());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-white mb-4 tracking-wider">The <span className="text-brand-gold">Auctions</span> Vault</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Extremely rare, high-demand 1-of-1 pieces hand-selected by our curators for live bidding.</p>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-8 shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-gold text-xl animate-pulse font-serif tracking-widest">Unlocking the Vault...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-xl">{error}</div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xl font-serif">The vault is currently empty. No active auctions.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {auctions.map((artwork) => (
              <div key={artwork.id} className="group bg-brand-charcoal rounded-lg overflow-hidden border-2 border-brand-gold/30 hover:border-brand-gold transition duration-700 shadow-2xl relative">
                <div className="absolute top-0 right-0 bg-red-600 text-white font-bold px-4 py-1 z-20 shadow-lg tracking-widest uppercase text-xs">
                  Live Auction
                </div>
                <div className="h-80 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                  <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition duration-1000" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                </div>
                <div className="p-6 relative z-20 bg-brand-charcoal border-t border-gray-800">
                  <h3 className="text-2xl font-serif text-white mb-1 drop-shadow-md">{artwork.title}</h3>
                  <p className="text-sm text-brand-gold mb-6 uppercase tracking-wider font-semibold">By {artwork.artist_name}</p>
                  
                  <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-6">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Current Bid</p>
                    <p className="text-3xl font-serif text-white">${Number(artwork.current_bid || artwork.price).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      className="w-1/3 bg-brand-dark border border-gray-700 text-white px-3 rounded focus:outline-none focus:border-brand-gold"
                      value={bids[artwork.id] || ''}
                      onChange={(e) => setBids({...bids, [artwork.id]: e.target.value})}
                    />
                    <button 
                      onClick={() => handleBid(artwork.id, artwork.current_bid || artwork.price)}
                      className="flex-1 py-4 bg-brand-gold text-brand-dark font-bold uppercase tracking-widest text-sm hover:bg-brand-champagne transition shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

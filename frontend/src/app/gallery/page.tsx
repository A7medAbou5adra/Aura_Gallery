'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchArtworks, purchaseArtwork, Artwork } from '@/lib/redux/slices/artworkSlice';
import { getImageUrl } from '@/utils/getImageUrl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Gallery() {
  const router = useRouter();
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { artworks, loading, error } = useSelector((state: RootState) => state.artworks);
  const { user } = useSelector((state: RootState) => state.auth);

  const handlePurchase = (id: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      alert('Only Collectors can acquire artwork.');
      return;
    }
    dispatch(purchaseArtwork(id)).unwrap().then(() => {
      alert('Masterpiece acquired successfully!');
    }).catch(err => alert(err));
  };

  useEffect(() => {
    dispatch(fetchArtworks());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-serif text-gradient mb-4">The Gallery</h1>
          <p className="text-gray-400 text-lg max-w-2xl">Browse our exclusive collection of 1-of-1 artworks. Once a piece is acquired, it instantly vanishes from the public gallery, solidifying its unique rarity.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-gold text-xl animate-pulse">Loading gallery masterpieces...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-xl">{error}</div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">The gallery is currently empty.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="group bg-brand-charcoal rounded-sm overflow-hidden border border-gray-800 hover:border-brand-gold transition duration-500 flex flex-col">
                <div className="h-64 bg-gray-900 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSelectedArtwork(artwork)}>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-serif text-2xl group-hover:scale-105 transition duration-700">
                    <img src={getImageUrl(artwork.image_url)} alt={artwork.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="absolute">{artwork.title}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark text-xs px-2 py-1 uppercase tracking-widest font-bold z-10">
                    {artwork.status}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between relative z-20 bg-brand-charcoal">
                  <div>
                    <h3 className="text-xl font-serif text-white mb-1 group-hover:text-brand-gold transition">{artwork.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">By {artwork.artist_name}</p>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <p className="text-brand-gold text-xl">${Number(artwork.price).toLocaleString()}</p>
                    <button onClick={() => handlePurchase(artwork.id)} className="text-xs border border-brand-gold text-brand-gold px-4 py-2 hover:bg-brand-gold hover:text-brand-dark transition uppercase tracking-wider">
                      Acquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-brand-charcoal border border-brand-gold w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-900">
                <img src={getImageUrl(selectedArtwork.image_url)} alt={selectedArtwork.title} className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-serif text-white">{selectedArtwork.title}</h2>
                    <button onClick={() => setSelectedArtwork(null)} className="text-gray-500 hover:text-brand-gold transition text-2xl">&times;</button>
                  </div>
                  <p className="text-brand-gold uppercase tracking-widest text-sm mb-6">By {selectedArtwork.artist_name}</p>
                  <p className="text-gray-300 leading-relaxed text-lg mb-8">{selectedArtwork.description || "An elusive masterpiece."}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 uppercase tracking-widest text-xs">Status</span>
                    <span className="text-brand-gold font-bold uppercase tracking-widest">{selectedArtwork.status}</span>
                  </div>
                  <button onClick={() => { handlePurchase(selectedArtwork.id); setSelectedArtwork(null); }} className="w-full py-4 bg-brand-gold text-brand-dark font-bold uppercase tracking-widest hover:bg-brand-champagne transition">
                    Acquire for ${Number(selectedArtwork.price).toLocaleString()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

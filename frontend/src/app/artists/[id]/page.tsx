'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchArtistProfile, clearCurrentProfile } from '@/lib/redux/slices/artistSlice';

export default function ArtistProfile() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProfile, loading, error } = useSelector((state: RootState) => state.artists);

  useEffect(() => {
    if (id) {
      dispatch(fetchArtistProfile(id as string));
    }
    return () => {
      dispatch(clearCurrentProfile());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-brand-gold text-2xl animate-pulse font-serif">Loading Artist Profile...</div>
      </div>
    );
  }

  if (error || !currentProfile) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-500 text-xl">{error || "Artist not found"}</div>
      </div>
    );
  }

  const { profile, availableArtworks, soldArtworks } = currentProfile;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-brand-charcoal p-10 rounded-lg border border-gray-800 mb-12 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-gold to-brand-champagne"></div>
          <div className="max-w-2xl text-center md:text-left mb-6 md:mb-0 ml-4">
            <h1 className="text-5xl font-serif text-white mb-4">{profile.name}</h1>
            <p className="text-gray-400 text-lg leading-relaxed">{profile.bio || "An elusive creator crafting unique masterpieces."}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 min-w-[250px] text-center shadow-lg">
            <h3 className="text-brand-gold uppercase tracking-widest text-sm mb-4">Commission Availability</h3>
            {profile.custom_order_price ? (
              <>
                <p className="text-3xl font-serif text-white mb-4">${Number(profile.custom_order_price).toLocaleString()}</p>
                <button className="w-full py-3 bg-brand-gold text-brand-dark font-bold hover:bg-brand-champagne transition rounded shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  Request Custom Order
                </button>
              </>
            ) : (
              <p className="text-gray-500 py-4 uppercase tracking-widest text-xs">Commissions Closed</p>
            )}
          </div>
        </div>

        {/* Portfolio: Available */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif text-white mb-6 border-b border-gray-800 pb-4">Available Artworks ({availableArtworks.length})</h2>
          {availableArtworks.length === 0 ? (
            <p className="text-gray-500 italic">This artist has no available pieces at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {availableArtworks.map((artwork) => (
                <div key={artwork.id} className="group bg-brand-charcoal rounded-sm overflow-hidden border border-gray-800 hover:border-brand-gold transition duration-500">
                  <div className="h-64 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                    <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="absolute text-gray-700 font-serif text-2xl opacity-50 group-hover:opacity-0 transition">{artwork.title}</span>
                  </div>
                  <div className="p-6 relative z-20 bg-brand-charcoal">
                    <h3 className="text-xl font-serif text-white mb-1">{artwork.title}</h3>
                    <div className="flex items-end justify-between mt-4">
                      <p className="text-brand-gold text-xl">${Number(artwork.price).toLocaleString()}</p>
                      <button className="text-xs border border-brand-gold text-brand-gold px-4 py-2 hover:bg-brand-gold hover:text-brand-dark transition uppercase tracking-wider">Acquire</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio: Sold */}
        <div>
          <h2 className="text-3xl font-serif text-gray-500 mb-6 border-b border-gray-800 pb-4">Sold Archives ({soldArtworks.length})</h2>
          {soldArtworks.length === 0 ? (
            <p className="text-gray-600 italic">No sold pieces to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {soldArtworks.map((artwork) => (
                <div key={artwork.id} className="bg-gray-900 rounded-sm overflow-hidden border border-gray-800 opacity-60 hover:opacity-100 transition">
                  <div className="h-40 bg-black relative flex items-center justify-center">
                    <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover opacity-40 grayscale" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-red-900/80 text-white text-[10px] px-2 py-1 uppercase tracking-widest font-bold">Sold</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-serif text-gray-300 truncate">{artwork.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">Acquired</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

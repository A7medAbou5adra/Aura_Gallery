'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { getImageUrl } from '@/utils/getImageUrl';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchArtworks } from '@/lib/redux/slices/artworkSlice';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { artworks, loading } = useSelector((state: RootState) => state.artworks);

  useEffect(() => {
    dispatch(fetchArtworks());
  }, [dispatch]);

  // Just grab a few available ones to mock the "Top Selling" for now
  const displayArtworks = artworks.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal to-brand-dark opacity-90 z-0" />
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight text-gradient drop-shadow-lg">
              Discover 1-of-1 <br/> Masterpieces
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-10 font-light">
              An exclusive sanctuary connecting visionary artists with elite collectors. Every piece is unique. Once it's sold, it's gone forever.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="/gallery" className="px-8 py-4 bg-brand-gold text-brand-dark font-bold text-lg rounded shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 transition transform duration-300">
                Explore Gallery
              </a>
              <a href="/artists" className="px-8 py-4 border border-brand-gold text-brand-gold font-bold text-lg rounded hover:bg-brand-gold hover:text-brand-dark transition duration-300">
                View Artists League
              </a>
            </div>
          </div>
        </section>

        {/* Top Featured Section */}
        <section className="py-20 bg-brand-dark">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif text-gradient mb-4">Featured Available Artworks</h2>
              <div className="w-24 h-1 bg-brand-gold mx-auto"></div>
            </div>
            
            {loading ? (
               <div className="text-center text-brand-gold animate-pulse">Loading featured artworks...</div>
            ) : displayArtworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {displayArtworks.map((artwork) => (
                  <div key={artwork.id} className="group bg-brand-charcoal rounded-lg overflow-hidden border border-gray-800 hover:border-brand-gold transition duration-500">
                    <div className="h-80 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                       <img src={getImageUrl(artwork.image_url)} alt={artwork.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="bg-brand-gold text-brand-dark text-xs px-2 py-1 uppercase tracking-widest font-bold">Available</span>
                      </div>
                    </div>
                    <div className="p-6 relative z-20 bg-brand-charcoal">
                      <h3 className="text-xl font-serif text-white mb-2">{artwork.title}</h3>
                      <p className="text-brand-gold text-lg mb-4">${Number(artwork.price).toLocaleString()}</p>
                      <a href={`/gallery`} className="block text-center w-full py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition rounded uppercase tracking-widest text-sm">
                        View in Gallery
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">Check back later for newly featured pieces.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

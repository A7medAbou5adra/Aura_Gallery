'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchArtists } from '@/lib/redux/slices/artistSlice';
import Link from 'next/link';

export default function ArtistsDirectory() {
  const dispatch = useDispatch<AppDispatch>();
  const { artists, loading, error } = useSelector((state: RootState) => state.artists);

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-gradient mb-4">The Artist League</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover the world's most exclusive creators, ranked by our elite collector community.</p>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-8"></div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-brand-gold text-xl animate-pulse">Loading artist rankings...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-xl">{error}</div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">No artists found on the platform yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist, index) => (
              <div key={artist.id} className="bg-brand-charcoal rounded-lg p-8 border border-gray-800 hover:border-brand-gold transition duration-500 relative flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold to-brand-champagne"></div>
                <div className="w-12 h-12 bg-brand-gold text-brand-dark font-bold font-serif text-xl rounded-full flex items-center justify-center absolute -top-6 border-4 border-brand-dark">
                  #{index + 1}
                </div>
                
                <h3 className="text-2xl font-serif text-white mt-4 mb-2">{artist.name}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-brand-gold text-lg">★ {Number(artist.average_rating).toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({artist.review_count} reviews)</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                  {artist.bio || "An elusive creator crafting unique masterpieces."}
                </p>
                
                <Link href={`/artists/${artist.id}`} className="w-full py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition uppercase tracking-widest text-sm font-semibold rounded">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

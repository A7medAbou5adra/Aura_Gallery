'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { logout } from '@/lib/redux/slices/authSlice';

export default function Header() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return (
    <header className="border-b border-gray-800 bg-brand-charcoal/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif text-gradient font-bold tracking-wider">
          AURA GALLERY
        </Link>
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/gallery" className="text-gray-300 hover:text-brand-gold transition">Gallery</Link>
          <Link href="/artists" className="text-gray-300 hover:text-brand-gold transition">Artists</Link>
          <Link href="/auctions" className="text-gray-300 hover:text-brand-gold transition">Auctions</Link>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 ml-6">
              <Link href={`/dashboard/${user?.role}`} className="px-4 py-2 bg-brand-dark border border-brand-gold text-brand-gold rounded hover:bg-brand-gold hover:text-brand-dark transition">
                Dashboard
              </Link>
              <button onClick={() => dispatch(logout())} className="text-gray-400 hover:text-white transition">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-6 py-2 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-brand-champagne transition shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

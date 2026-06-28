'use client';
import Header from '@/components/layout/Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Basic protection logic
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif text-gradient mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform Control Center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Users</h3>
            <p className="text-3xl font-serif text-white">1,248</p>
          </div>
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Sales</h3>
            <p className="text-3xl font-serif text-brand-gold">$482,500</p>
          </div>
          <div className="bg-brand-charcoal p-6 rounded border border-gray-800">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Active Artworks</h3>
            <p className="text-3xl font-serif text-white">342</p>
          </div>
        </div>

        <div className="bg-brand-charcoal rounded border border-gray-800 p-6">
          <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-700 pb-4">Recent Moderation Actions</h2>
          <div className="text-gray-400 text-sm">
            <p className="py-3 border-b border-gray-800 flex justify-between">
              <span>Moved "Celestial Bodies" to Auctions</span>
              <span className="text-brand-gold">10 mins ago</span>
            </p>
            <p className="py-3 border-b border-gray-800 flex justify-between">
              <span>Banned User ID #4092</span>
              <span className="text-brand-gold">2 hours ago</span>
            </p>
            <p className="py-3 flex justify-between">
              <span>Approved Custom Order Request</span>
              <span className="text-brand-gold">5 hours ago</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

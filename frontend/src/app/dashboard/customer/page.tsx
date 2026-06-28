'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchCustomerDashboard } from '@/lib/redux/slices/orderSlice';

export default function CustomerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { purchases, customerOrders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (user?.role === 'customer') {
      dispatch(fetchCustomerDashboard());
    } else if (user) {
      window.location.href = '/';
    }
  }, [dispatch, user]);

  if (!user || user.role !== 'customer') return null;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-brand-gold uppercase tracking-widest text-sm">Collector Dashboard</p>
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
            <section>
              <h2 className="text-2xl font-serif text-white border-b border-gray-800 pb-4 mb-6">Custom Commissions</h2>
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
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

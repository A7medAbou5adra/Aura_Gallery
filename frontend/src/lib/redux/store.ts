import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import artworkReducer from './slices/artworkSlice';
import artistReducer from './slices/artistSlice';
import auctionReducer from './slices/auctionSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artworks: artworkReducer,
    artists: artistReducer,
    auctions: auctionReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

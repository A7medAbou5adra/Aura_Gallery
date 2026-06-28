import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { Artwork } from './artworkSlice';

interface AuctionState {
  auctions: Artwork[];
  loading: boolean;
  error: string | null;
}

const initialState: AuctionState = {
  auctions: [],
  loading: false,
  error: null,
};

export const fetchAuctions = createAsyncThunk('auctions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/artworks/auctions');
    return data as Artwork[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch auctions');
  }
});

const auctionSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default auctionSlice.reducer;

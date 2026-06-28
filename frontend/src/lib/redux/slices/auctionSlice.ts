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

export const placeBid = createAsyncThunk('auctions/placeBid', async ({ artwork_id, bid_amount }: { artwork_id: number; bid_amount: number }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auctions/bid', { artwork_id, bid_amount });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place bid');
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
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        const index = state.auctions.findIndex(a => a.id === action.meta.arg.artwork_id);
        if (index !== -1) {
          state.auctions[index].current_bid = String(action.meta.arg.bid_amount);
        }
      });
  },
});

export default auctionSlice.reducer;

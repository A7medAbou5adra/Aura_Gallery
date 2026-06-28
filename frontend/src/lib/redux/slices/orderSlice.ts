import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

interface CustomOrder {
  id: number;
  customer_id: number;
  artist_id: number;
  description: string;
  agreed_price: string;
  status: string;
  created_at: string;
  artist_name?: string;
  customer_name?: string;
}

interface Purchase {
  id: number;
  amount: string;
  purchased_at: string;
  title: string;
  image_url: string;
  artist_name: string;
}

interface OrderState {
  customerOrders: CustomOrder[];
  purchases: Purchase[];
  artistOrders: CustomOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  customerOrders: [],
  purchases: [],
  artistOrders: [],
  loading: false,
  error: null,
};

export const fetchCustomerDashboard = createAsyncThunk('orders/fetchCustomer', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/customer');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer orders');
  }
});

export const fetchArtistDashboard = createAsyncThunk('orders/fetchArtist', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/artist');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch artist orders');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrders = action.payload.custom_orders;
        state.purchases = action.payload.purchases;
      })
      .addCase(fetchArtistDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArtistDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.artistOrders = action.payload;
      });
  },
});

export default orderSlice.reducer;

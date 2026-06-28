import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export interface Artwork {
  id: number;
  artist_id: number;
  artist_name: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  status: string;
  created_at: string;
}

interface ArtworkState {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
}

const initialState: ArtworkState = {
  artworks: [],
  loading: false,
  error: null,
};

export const fetchArtworks = createAsyncThunk('artworks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/artworks');
    return data as Artwork[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch artworks');
  }
});

const artworkSlice = createSlice({
  name: 'artworks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.loading = false;
        state.artworks = action.payload;
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default artworkSlice.reducer;

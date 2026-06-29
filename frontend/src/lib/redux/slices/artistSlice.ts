import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { Artwork } from './artworkSlice';

export interface Artist {
  id: number;
  name: string;
  bio: string | null;
  custom_order_price: string | null;
  profile_image_url?: string;
  average_rating: string;
  review_count: string;
}

export interface ArtistProfileData {
  profile: Artist;
  availableArtworks: Artwork[];
  soldArtworks: Artwork[];
}

interface ArtistState {
  artists: Artist[];
  currentProfile: ArtistProfileData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ArtistState = {
  artists: [],
  currentProfile: null,
  loading: false,
  error: null,
};

export const fetchArtists = createAsyncThunk('artists/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/artists');
    return data as Artist[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch artists');
  }
});

export const fetchArtistProfile = createAsyncThunk('artists/fetchProfile', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/artists/${id}`);
    return data as ArtistProfileData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch artist profile');
  }
});

const artistSlice = createSlice({
  name: 'artists',
  initialState,
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.artists = action.payload;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchArtistProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProfile = null;
      })
      .addCase(fetchArtistProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchArtistProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProfile } = artistSlice.actions;
export default artistSlice.reducer;

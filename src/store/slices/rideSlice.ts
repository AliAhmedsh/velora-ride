import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Ride, RideLocation } from '../types/ride';
import {
  loadActiveRide,
  loadRideHistory,
  persistActiveRide,
  persistRideHistory,
} from '../../services/rideSync';
import { estimateFare } from '../../utils/locations';

export const RIDER_NAME = 'Ali Ahmed';

type RideState = {
  isOnline: boolean;
  activeRide: Ride | null;
  history: Ride[];
  isLoading: boolean;
};

const initialState: RideState = {
  isOnline: false,
  activeRide: null,
  history: [],
  isLoading: false,
};

function createRideId(): string {
  return `ride_${Date.now()}`;
}

export const hydrateRideState = createAsyncThunk('ride/hydrate', async () => {
  const [activeRide, history] = await Promise.all([loadActiveRide(), loadRideHistory()]);
  return { activeRide, history };
});

export const clearCompletedRide = createAsyncThunk('ride/clear', async () => {
  await persistActiveRide(null);
  return null;
});

export const syncRideState = createAsyncThunk('ride/sync', async () => {
  const [activeRide, history] = await Promise.all([loadActiveRide(), loadRideHistory()]);
  return { activeRide, history };
});

export const requestRide = createAsyncThunk(
  'ride/request',
  async ({ pickup, dropoff }: { pickup: RideLocation; dropoff: RideLocation }) => {
    const ride: Ride = {
      id: createRideId(),
      riderName: RIDER_NAME,
      pickup,
      dropoff,
      fare: estimateFare(pickup, dropoff),
      status: 'searching',
      createdAt: new Date().toISOString(),
    };
    await persistActiveRide(ride);
    return ride;
  },
);

export const cancelRide = createAsyncThunk('ride/cancel', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride) {
    await persistActiveRide(null);
    return { ride: null, history: state.ride.history };
  }
  if (ride.status === 'searching') {
    await persistActiveRide(null);
    return { ride: null, history: state.ride.history };
  }
  const cancelled: Ride = { ...ride, status: 'cancelled' };
  await persistActiveRide(null);
  const history = [...state.ride.history, cancelled];
  await persistRideHistory(history);
  return { ride: null, history };
});

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setActiveRide(state, action: PayloadAction<Ride | null>) {
      state.activeRide = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateRideState.pending, state => {
        state.isLoading = true;
      })
      .addCase(hydrateRideState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload.activeRide;
        state.history = action.payload.history;
      })
      .addCase(hydrateRideState.rejected, state => {
        state.isLoading = false;
      })
      .addCase(syncRideState.fulfilled, (state, action) => {
        state.activeRide = action.payload.activeRide;
        state.history = action.payload.history;
      })
      .addCase(clearCompletedRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.history = action.payload.history;
      });
  },
});

export const { setOnline, setActiveRide } = rideSlice.actions;
export const rideReducer = rideSlice.reducer;

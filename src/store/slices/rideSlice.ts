import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Ride } from '../types/ride';
import {
  cancelRideRequest,
  createBooking,
  fetchActiveRide,
  fetchRideHistory,
} from '../../services/rideService';
import type { BookingRequest } from '../../types/booking';

type RideState = {
  isOnline: boolean;
  activeRide: Ride | null;
  history: Ride[];
  isLoading: boolean;
  error: string | null;
  dismissedRideIds: string[];
};

const initialState: RideState = {
  isOnline: false,
  activeRide: null,
  history: [],
  isLoading: false,
  error: null,
  dismissedRideIds: [],
};

export const hydrateRideState = createAsyncThunk('ride/hydrate', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const [activeRide, history] = await Promise.all([
    fetchActiveRide(state.ride.isOnline),
    fetchRideHistory(),
  ]);
  return { activeRide, history };
});

export const syncRideState = createAsyncThunk('ride/sync', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const [activeRide, history] = await Promise.all([
    fetchActiveRide(state.ride.isOnline),
    fetchRideHistory(),
  ]);
  return { activeRide, history };
});

export const requestRide = createAsyncThunk(
  'ride/request',
  async (request: BookingRequest) => {
    return await createBooking(request);
  },
);

export const cancelRide = createAsyncThunk('ride/cancel', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride) return { ride: null, history: state.ride.history };

  if (ride.status === 'searching') {
    await cancelRideRequest(ride.id);
    return { ride: null, history: state.ride.history };
  }

  await cancelRideRequest(ride.id);
  const history = await fetchRideHistory();
  return { ride: null, history };
});

export const dismissCompletedRide = createAsyncThunk('ride/dismiss', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  return state.ride.activeRide?.id ?? null;
});

function applyActiveRide(state: RideState, activeRide: Ride | null) {
  if (
    activeRide?.status === 'completed' &&
    state.dismissedRideIds.includes(activeRide.id)
  ) {
    state.activeRide = null;
    return;
  }
  state.activeRide = activeRide;
}

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
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateRideState.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hydrateRideState.fulfilled, (state, action) => {
        state.isLoading = false;
        applyActiveRide(state, action.payload.activeRide);
        state.history = action.payload.history;
      })
      .addCase(hydrateRideState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load rides';
      })
      .addCase(syncRideState.fulfilled, (state, action) => {
        applyActiveRide(state, action.payload.activeRide);
        state.history = action.payload.history;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to request ride';
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.history = action.payload.history;
      })
      .addCase(dismissCompletedRide.fulfilled, (state, action) => {
        if (action.payload) {
          state.dismissedRideIds.push(action.payload);
        }
        state.activeRide = null;
      });
  },
});

export const { setOnline, setActiveRide, clearError } = rideSlice.actions;
export const rideReducer = rideSlice.reducer;

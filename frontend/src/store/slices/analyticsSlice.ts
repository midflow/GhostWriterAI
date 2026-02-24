import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsState, UsageStats } from '../../types/index';

const initialState: AnalyticsState = {
  stats: null,
  toneData: [],
  costEstimation: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStats: (state, action: PayloadAction<UsageStats>) => {
      state.stats = action.payload;
      state.error = null;
      state.loading = false;
    },
    setToneData: (state, action: PayloadAction<Array<{ tone: string; count: number }>>) => {
      state.toneData = action.payload;
    },
    setCostEstimation: (state, action: PayloadAction<any>) => {
      state.costEstimation = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.stats = null;
      state.toneData = [];
      state.costEstimation = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setStats, setToneData, setCostEstimation, setError, clearError, reset } =
  analyticsSlice.actions;

export default analyticsSlice.reducer;

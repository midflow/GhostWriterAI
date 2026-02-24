import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageState, Message } from '../../types/index';

const initialState: MessageState = {
  messages: [],
  currentMessage: null,
  loading: false,
  error: null,
  recentMessages: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
      state.error = null;
      state.loading = false;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
      state.recentMessages.unshift(action.payload.originalMessage);
      if (state.recentMessages.length > 10) {
        state.recentMessages.pop();
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    setCurrentMessage: (state, action: PayloadAction<Message | null>) => {
      state.currentMessage = action.payload;
    },
    setRecentMessages: (state, action: PayloadAction<string[]>) => {
      state.recentMessages = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentMessage = null;
      state.recentMessages = [];
    },
  },
});

export const {
  setLoading,
  setMessages,
  addMessage,
  deleteMessage,
  setCurrentMessage,
  setRecentMessages,
  setError,
  clearError,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;

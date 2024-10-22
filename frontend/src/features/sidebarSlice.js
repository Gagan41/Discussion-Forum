// src/features/sidebarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false, // Initialize the sidebar as closed
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.open = !state.open; // Toggle sidebar open state
    },
    openSidebar: (state) => {
      state.open = true; // Set sidebar to open
    },
    closeSidebar: (state) => {
      state.open = false; // Set sidebar to closed
    },
  },
});

// Export actions to use in components
export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions;

// Export the reducer to be used in the store
export default sidebarSlice.reducer;

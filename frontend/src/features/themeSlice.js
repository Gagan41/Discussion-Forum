import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for theme (light mode by default)
const initialState = {
  darkMode: false, // Ensure the property name matches what you're toggling
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggle: (state) => {
      state.darkMode = !state.darkMode; // Toggles the darkMode state
    },
  },
});

// Export the action to toggle the theme
export const { toggle } = themeSlice.actions; // Export the correct action name

// Export the reducer to use in the store
export default themeSlice.reducer;

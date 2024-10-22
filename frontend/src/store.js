import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./features/themeSlice";
import sidebarReducer from './features/sidebarSlice';


const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    theme: themeReducer,
  },  
});

export default store;

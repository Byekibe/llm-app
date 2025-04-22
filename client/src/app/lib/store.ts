import { configureStore } from '@reduxjs/toolkit'
import { geminiApiSlice } from './features/geminiApiSlice'
import { setupListeners } from '@reduxjs/toolkit/query';

export const makeStore = () => {
  return configureStore({
    reducer: {
        [geminiApiSlice.reducerPath]: geminiApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(geminiApiSlice.middleware),
  })
}

export const store = makeStore();
setupListeners(store.dispatch);

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import إعداداتSlice from './slices/إعداداتSlice';
import رحلاتSlice from './slices/رحلاتSlice';
import مستخدمينSlice from './slices/مستخدمينSlice';
import مشترياتSlice from './slices/مشترياتSlice';
import مصاريفSlice from './slices/مصاريفSlice';

const persistConfig = {
  key: 'rehlah-root',
  storage: AsyncStorage,
  whitelist: ['مستخدمين', 'رحلات', 'مصاريف', 'مشتريات', 'إعدادات'], // البيانات المراد حفظها
};

const rootReducer = combineReducers({
  مستخدمين: مستخدمينSlice,
  رحلات: رحلاتSlice,
  مصاريف: مصاريفSlice,
  مشتريات: مشترياتSlice,
  إعدادات: إعداداتSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

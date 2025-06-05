import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { إعدادات_التطبيق } from '../../types';

interface حالة_الإعدادات {
  الإعدادات: إعدادات_التطبيق;
}

const الإعدادات_الافتراضية: إعدادات_التطبيق = {
  اللغة: 'ar',
  الوضع_المظلم: false,
  العملة_الافتراضية: 'جنيه',
  الإشعارات_مفعلة: true,
};

const الحالة_الأولية: حالة_الإعدادات = {
  الإعدادات: الإعدادات_الافتراضية,
};

const إعداداتSlice = createSlice({
  name: 'إعدادات',
  initialState: الحالة_الأولية,
  reducers: {
    تحديث_الإعدادات: (state, action: PayloadAction<Partial<إعدادات_التطبيق>>) => {
      state.الإعدادات = { ...state.الإعدادات, ...action.payload };
    },

    تغيير_اللغة: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.الإعدادات.اللغة = action.payload;
    },

    تبديل_الوضع_المظلم: (state) => {
      state.الإعدادات.الوضع_المظلم = !state.الإعدادات.الوضع_المظلم;
    },

    تعيين_العملة_الافتراضية: (state, action: PayloadAction<string>) => {
      state.الإعدادات.العملة_الافتراضية = action.payload;
    },

    تبديل_الإشعارات: (state) => {
      state.الإعدادات.الإشعارات_مفعلة = !state.الإعدادات.الإشعارات_مفعلة;
    },

    إعادة_تعيين_الإعدادات: (state) => {
      state.الإعدادات = الإعدادات_الافتراضية;
    },
  },
});

export const {
  تحديث_الإعدادات,
  تغيير_اللغة,
  تبديل_الوضع_المظلم,
  تعيين_العملة_الافتراضية,
  تبديل_الإشعارات,
  إعادة_تعيين_الإعدادات,
} = إعداداتSlice.actions;

export default إعداداتSlice.reducer;

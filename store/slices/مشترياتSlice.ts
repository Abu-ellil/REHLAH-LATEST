import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { مشترى_فردي } from '../../types';

interface حالة_المشتريات {
  المشتريات: مشترى_فردي[];
  جاري_التحميل: boolean;
  خطأ: string | null;
}

const الحالة_الأولية: حالة_المشتريات = {
  المشتريات: [],
  جاري_التحميل: false,
  خطأ: null,
};

const مشترياتSlice = createSlice({
  name: 'مشتريات',
  initialState: الحالة_الأولية,
  reducers: {
    إضافة_مشترى: (state, action: PayloadAction<مشترى_فردي>) => {
      state.المشتريات.push(action.payload);
    },
    
    تحديث_مشترى: (state, action: PayloadAction<مشترى_فردي>) => {
      const فهرس = state.المشتريات.findIndex(م => م.id === action.payload.id);
      if (فهرس !== -1) {
        state.المشتريات[فهرس] = action.payload;
      }
    },
    
    حذف_مشترى: (state, action: PayloadAction<string>) => {
      state.المشتريات = state.المشتريات.filter(م => م.id !== action.payload);
    },
    
    حذف_مشتريات_الرحلة: (state, action: PayloadAction<string>) => {
      state.المشتريات = state.المشتريات.filter(م => م.معرف_الرحلة !== action.payload);
    },
    
    حذف_مشتريات_المستخدم: (state, action: PayloadAction<{ معرف_الرحلة: string; معرف_المستخدم: string }>) => {
      state.المشتريات = state.المشتريات.filter(
        م => !(م.معرف_الرحلة === action.payload.معرف_الرحلة && م.معرف_المستخدم === action.payload.معرف_المستخدم)
      );
    },
    
    مسح_جميع_المشتريات: (state) => {
      state.المشتريات = [];
    },
    
    تعيين_جاري_التحميل: (state, action: PayloadAction<boolean>) => {
      state.جاري_التحميل = action.payload;
    },
    
    تعيين_خطأ: (state, action: PayloadAction<string | null>) => {
      state.خطأ = action.payload;
    },
  },
});

export const {
  إضافة_مشترى,
  تحديث_مشترى,
  حذف_مشترى,
  حذف_مشتريات_الرحلة,
  حذف_مشتريات_المستخدم,
  مسح_جميع_المشتريات,
  تعيين_جاري_التحميل,
  تعيين_خطأ,
} = مشترياتSlice.actions;

export default مشترياتSlice.reducer;

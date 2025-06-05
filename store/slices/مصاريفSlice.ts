import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { مصروف } from '../../types';

interface حالة_المصاريف {
  المصاريف: مصروف[];
  جاري_التحميل: boolean;
  خطأ?: string;
}

const الحالة_الأولية: حالة_المصاريف = {
  المصاريف: [],
  جاري_التحميل: false,
};

const مصاريفSlice = createSlice({
  name: 'مصاريف',
  initialState: الحالة_الأولية,
  reducers: {
    إضافة_مصروف: (state, action: PayloadAction<مصروف>) => {
      state.المصاريف.push(action.payload);
    },
    
    تحديث_مصروف: (state, action: PayloadAction<مصروف>) => {
      const فهرس = state.المصاريف.findIndex(e => e.id === action.payload.id);
      if (فهرس !== -1) {
        state.المصاريف[فهرس] = action.payload;
      }
    },
    
    حذف_مصروف: (state, action: PayloadAction<string>) => {
      state.المصاريف = state.المصاريف.filter(e => e.id !== action.payload);
    },
    
    حذف_مصاريف_الرحلة: (state, action: PayloadAction<string>) => {
      state.المصاريف = state.المصاريف.filter(e => e.معرف_الرحلة !== action.payload);
    },
    
    تعيين_حالة_التحميل: (state, action: PayloadAction<boolean>) => {
      state.جاري_التحميل = action.payload;
    },
    
    تعيين_خطأ: (state, action: PayloadAction<string | undefined>) => {
      state.خطأ = action.payload;
    },
    
    مسح_جميع_المصاريف: (state) => {
      state.المصاريف = [];
    },
  },
});

export const {
  إضافة_مصروف,
  تحديث_مصروف,
  حذف_مصروف,
  حذف_مصاريف_الرحلة,
  تعيين_حالة_التحميل,
  تعيين_خطأ,
  مسح_جميع_المصاريف,
} = مصاريفSlice.actions;

export default مصاريفSlice.reducer;

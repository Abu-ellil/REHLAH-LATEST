import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { مستخدم } from '../../types';

interface حالة_المستخدمين {
  المستخدمين: مستخدم[];
  المستخدم_الحالي?: string; // معرف المستخدم الحالي
  جاري_التحميل: boolean;
  خطأ?: string;
}

const الحالة_الأولية: حالة_المستخدمين = {
  المستخدمين: [],
  جاري_التحميل: false,
};

const مستخدمينSlice = createSlice({
  name: 'مستخدمين',
  initialState: الحالة_الأولية,
  reducers: {
    إضافة_مستخدم: (state, action: PayloadAction<مستخدم>) => {
      state.المستخدمين.push(action.payload);
    },
    
    تحديث_مستخدم: (state, action: PayloadAction<مستخدم>) => {
      const فهرس = state.المستخدمين.findIndex(u => u.id === action.payload.id);
      if (فهرس !== -1) {
        state.المستخدمين[فهرس] = action.payload;
      }
    },
    
    حذف_مستخدم: (state, action: PayloadAction<string>) => {
      state.المستخدمين = state.المستخدمين.filter(u => u.id !== action.payload);
    },
    
    تعيين_المستخدم_الحالي: (state, action: PayloadAction<string>) => {
      state.المستخدم_الحالي = action.payload;
    },
    
    تعيين_حالة_التحميل: (state, action: PayloadAction<boolean>) => {
      state.جاري_التحميل = action.payload;
    },
    
    تعيين_خطأ: (state, action: PayloadAction<string | undefined>) => {
      state.خطأ = action.payload;
    },
    
    مسح_جميع_المستخدمين: (state) => {
      state.المستخدمين = [];
      state.المستخدم_الحالي = undefined;
    },
  },
});

export const {
  إضافة_مستخدم,
  تحديث_مستخدم,
  حذف_مستخدم,
  تعيين_المستخدم_الحالي,
  تعيين_حالة_التحميل,
  تعيين_خطأ,
  مسح_جميع_المستخدمين,
} = مستخدمينSlice.actions;

export default مستخدمينSlice.reducer;

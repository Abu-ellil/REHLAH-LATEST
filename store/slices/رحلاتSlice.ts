import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { رحلة } from '../../types';

interface حالة_الرحلات {
  الرحلات: رحلة[];
  الرحلة_المحددة?: رحلة;
  جاري_التحميل: boolean;
  خطأ?: string;
}

const الحالة_الأولية: حالة_الرحلات = {
  الرحلات: [],
  جاري_التحميل: false,
};

const رحلاتSlice = createSlice({
  name: 'رحلات',
  initialState: الحالة_الأولية,
  reducers: {
    إضافة_رحلة: (state, action: PayloadAction<رحلة>) => {
      state.الرحلات.push(action.payload);
    },
    
    تحديث_رحلة: (state, action: PayloadAction<رحلة>) => {
      const فهرس = state.الرحلات.findIndex(r => r.id === action.payload.id);
      if (فهرس !== -1) {
        state.الرحلات[فهرس] = action.payload;
      }
      
      // تحديث الرحلة المحددة إذا كانت نفسها
      if (state.الرحلة_المحددة?.id === action.payload.id) {
        state.الرحلة_المحددة = action.payload;
      }
    },
    
    حذف_رحلة: (state, action: PayloadAction<string>) => {
      state.الرحلات = state.الرحلات.filter(r => r.id !== action.payload);
      
      // مسح الرحلة المحددة إذا تم حذفها
      if (state.الرحلة_المحددة?.id === action.payload) {
        state.الرحلة_المحددة = undefined;
      }
    },
    
    تحديد_رحلة: (state, action: PayloadAction<string>) => {
      state.الرحلة_المحددة = state.الرحلات.find(r => r.id === action.payload);
    },
    
    إضافة_مشارك_للرحلة: (state, action: PayloadAction<{ معرف_الرحلة: string; معرف_المستخدم: string }>) => {
      const { معرف_الرحلة, معرف_المستخدم } = action.payload;
      const رحلة = state.الرحلات.find(r => r.id === معرف_الرحلة);
      
      if (رحلة && !رحلة.المشاركون.includes(معرف_المستخدم)) {
        رحلة.المشاركون.push(معرف_المستخدم);
        رحلة.تاريخ_التحديث = new Date().toISOString();
      }
    },
    
    إزالة_مشارك_من_الرحلة: (state, action: PayloadAction<{ معرف_الرحلة: string; معرف_المستخدم: string }>) => {
      const { معرف_الرحلة, معرف_المستخدم } = action.payload;
      const رحلة = state.الرحلات.find(r => r.id === معرف_الرحلة);
      
      if (رحلة) {
        رحلة.المشاركون = رحلة.المشاركون.filter(id => id !== معرف_المستخدم);
        رحلة.تاريخ_التحديث = new Date().toISOString();
      }
    },
    
    تعيين_حالة_التحميل: (state, action: PayloadAction<boolean>) => {
      state.جاري_التحميل = action.payload;
    },
    
    تعيين_خطأ: (state, action: PayloadAction<string | undefined>) => {
      state.خطأ = action.payload;
    },
    
    مسح_جميع_الرحلات: (state) => {
      state.الرحلات = [];
      state.الرحلة_المحددة = undefined;
    },
  },
});

export const {
  إضافة_رحلة,
  تحديث_رحلة,
  حذف_رحلة,
  تحديد_رحلة,
  إضافة_مشارك_للرحلة,
  إزالة_مشارك_من_الرحلة,
  تعيين_حالة_التحميل,
  تعيين_خطأ,
  مسح_جميع_الرحلات,
} = رحلاتSlice.actions;

export default رحلاتSlice.reducer;

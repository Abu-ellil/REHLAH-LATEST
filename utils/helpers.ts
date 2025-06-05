import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * توليد معرف فريد
 */
export function توليد_معرف(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function تنسيق_التاريخ(تاريخ: string, تنسيق: string = 'dd MMMM yyyy'): string {
  try {
    return format(parseISO(تاريخ), تنسيق, { locale: ar });
  } catch {
    return تاريخ;
  }
}

/**
 * تنسيق التاريخ والوقت
 */
export function تنسيق_التاريخ_والوقت(تاريخ: string): string {
  try {
    return format(parseISO(تاريخ), 'dd MMMM yyyy - HH:mm', { locale: ar });
  } catch {
    return تاريخ;
  }
}

/**
 * حساب الفرق بين تاريخين بالأيام
 */
export function حساب_الفرق_بالأيام(تاريخ_البداية: string, تاريخ_النهاية: string): number {
  try {
    const بداية = parseISO(تاريخ_البداية);
    const نهاية = parseISO(تاريخ_النهاية);
    const فرق = نهاية.getTime() - بداية.getTime();
    return Math.ceil(فرق / (1000 * 3600 * 24));
  } catch {
    return 0;
  }
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function التحقق_من_البريد_الإلكتروني(بريد: string): boolean {
  const نمط = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return نمط.test(بريد);
}

/**
 * تقصير النص
 */
export function تقصير_النص(نص: string, الحد_الأقصى: number = 50): string {
  if (نص.length <= الحد_الأقصى) return نص;
  return نص.substring(0, الحد_الأقصى) + '...';
}

/**
 * تنسيق المبلغ مع العملة
 */
export function formatAmount(مبلغ: number, عملة: string = 'ريال'): string {
  const مبلغ_منسق = Math.abs(مبلغ).toFixed(2);
  return `${مبلغ_منسق} ${عملة}`;
}

// اسم مستعار للتوافق مع العربية
export const تنسيق_المبلغ = formatAmount;

/**
 * تحويل الرقم إلى كلمات (للمبالغ الصغيرة)
 */
export function رقم_إلى_كلمات(رقم: number): string {
  const أرقام = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];

  if (رقم >= 0 && رقم < 10) {
    return أرقام[رقم];
  }

  return رقم.toString();
}

/**
 * ألوان الفئات
 */
export const ألوان_الفئات = {
  'طعام': '#FF6B6B',
  'مواصلات': '#4ECDC4',
  'إقامة': '#45B7D1',
  'ترفيه': '#96CEB4',
  'تسوق': '#FFEAA7',
  'صحة': '#DDA0DD',
  'أخرى': '#95A5A6',
};

/**
 * أيقونات الفئات
 */
export const أيقونات_الفئات = {
  'طعام': '🍽️',
  'مواصلات': '🚗',
  'إقامة': '🏨',
  'ترفيه': '🎉',
  'تسوق': '🛍️',
  'صحة': '💊',
  'أخرى': '📝',
};

/**
 * قائمة العملات المدعومة
 */
export const العملات_المدعومة = [
  { الرمز: 'جنيه', الاسم: 'جنيه مصري' },
  { الرمز: 'ريال', الاسم: 'ريال سعودي' },
  { الرمز: 'درهم', الاسم: 'درهم إماراتي' },
  { الرمز: 'دينار', الاسم: 'دينار كويتي' },
  { الرمز: 'دولار', الاسم: 'دولار أمريكي' },
  { الرمز: 'يورو', الاسم: 'يورو' },
];

/**
 * التحقق من وجود اتصال بالإنترنت
 */
export async function التحقق_من_الاتصال(): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
}

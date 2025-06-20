import { مصروف, مستخدم, رصيد_المستخدم, تسوية, ملخص_الرحلة } from '../types';

/**
 * حساب أرصدة المستخدمين في رحلة معينة
 */
export function حساب_أرصدة_المستخدمين(
  مصاريف: مصروف[],
  مستخدمين: مستخدم[]
): رصيد_المستخدم[] {
  const أرصدة: { [معرف: string]: رصيد_المستخدم } = {};

  // تهيئة الأرصدة
  مستخدمين.forEach(مستخدم => {
    أرصدة[مستخدم.id] = {
      معرف_المستخدم: مستخدم.id,
      إجمالي_المدفوع: 0,
      إجمالي_النصيب: 0,
      الرصيد_الصافي: 0,
    };
  });

  // حساب المدفوعات والأنصبة
  مصاريف.forEach(مصروف => {
    // حساب إجمالي المدفوع لكل مستخدم
    Object.entries(مصروف.مبالغ_الدفع).forEach(([معرف_المستخدم, المبلغ]) => {
      if (أرصدة[معرف_المستخدم]) {
        أرصدة[معرف_المستخدم].إجمالي_المدفوع += المبلغ;
      }
    });

    // حساب النصيب العادل لكل مشارك
    const النصيب_للفرد = مصروف.المبلغ / مصروف.مشارك_مع.length;
    مصروف.مشارك_مع.forEach(معرف_المستخدم => {
      if (أرصدة[معرف_المستخدم]) {
        أرصدة[معرف_المستخدم].إجمالي_النصيب += النصيب_للفرد;
      }
    });
  });

  // حساب الرصيد الصافي
  Object.values(أرصدة).forEach(رصيد => {
    رصيد.الرصيد_الصافي = رصيد.إجمالي_المدفوع - رصيد.إجمالي_النصيب;
  });

  return Object.values(أرصدة);
}

/**
 * حساب التسويات المطلوبة
 */
export function حساب_التسويات(أرصدة: رصيد_المستخدم[]): تسوية[] {
  const التسويات: تسوية[] = [];
  
  // فصل المدينين والدائنين
  const مدينون = أرصدة.filter(رصيد => رصيد.الرصيد_الصافي < 0)
    .map(رصيد => ({ ...رصيد, الرصيد_الصافي: Math.abs(رصيد.الرصيد_الصافي) }))
    .sort((a, b) => b.الرصيد_الصافي - a.الرصيد_الصافي);
    
  const دائنون = أرصدة.filter(رصيد => رصيد.الرصيد_الصافي > 0)
    .sort((a, b) => b.الرصيد_الصافي - a.الرصيد_الصافي);

  let فهرس_المدين = 0;
  let فهرس_الدائن = 0;

  while (فهرس_المدين < مدينون.length && فهرس_الدائن < دائنون.length) {
    const المدين = مدينون[فهرس_المدين];
    const الدائن = دائنون[فهرس_الدائن];

    const مبلغ_التسوية = Math.min(المدين.الرصيد_الصافي, الدائن.الرصيد_الصافي);

    if (مبلغ_التسوية > 0.01) { // تجنب المبالغ الصغيرة جداً
      التسويات.push({
        من: المدين.معرف_المستخدم,
        إلى: الدائن.معرف_المستخدم,
        المبلغ: Math.round(مبلغ_التسوية * 100) / 100, // تقريب لأقرب قرش
      });
    }

    المدين.الرصيد_الصافي -= مبلغ_التسوية;
    الدائن.الرصيد_الصافي -= مبلغ_التسوية;

    if (المدين.الرصيد_الصافي <= 0.01) {
      فهرس_المدين++;
    }
    if (الدائن.الرصيد_الصافي <= 0.01) {
      فهرس_الدائن++;
    }
  }

  return التسويات;
}

/**
 * حساب ملخص شامل للرحلة
 */
export function حساب_ملخص_الرحلة(
  معرف_الرحلة: string,
  مصاريف: مصروف[],
  مستخدمين: مستخدم[]
): ملخص_الرحلة {
  const مصاريف_الرحلة = مصاريف.filter(م => م.معرف_الرحلة === معرف_الرحلة);
  const أرصدة = حساب_أرصدة_المستخدمين(مصاريف_الرحلة, مستخدمين);
  const التسويات = حساب_التسويات(أرصدة);

  // حساب إجمالي المصاريف
  const إجمالي_المصاريف = مصاريف_الرحلة.reduce((مجموع, مصروف) => مجموع + مصروف.المبلغ, 0);

  // حساب توزيع الفئات
  const توزيع_الفئات: { [فئة: string]: number } = {};
  مصاريف_الرحلة.forEach(مصروف => {
    توزيع_الفئات[مصروف.الفئة] = (توزيع_الفئات[مصروف.الفئة] || 0) + مصروف.المبلغ;
  });

  return {
    معرف_الرحلة,
    إجمالي_المصاريف,
    عدد_المصاريف: مصاريف_الرحلة.length,
    أرصدة_المستخدمين: أرصدة,
    التسويات_المطلوبة: التسويات,
    توزيع_الفئات,
  };
}

/**
 * تنسيق المبلغ مع العملة
 */
export function تنسيق_المبلغ(مبلغ: number, عملة: string = 'ريال'): string {
  const مبلغ_منسق = Math.abs(مبلغ).toFixed(2);
  return `${مبلغ_منسق} ${عملة}`;
}

/**
 * حساب النسبة المئوية
 */
export function حساب_النسبة_المئوية(الجزء: number, الكل: number): number {
  if (الكل === 0) return 0;
  return Math.round((الجزء / الكل) * 100);
}

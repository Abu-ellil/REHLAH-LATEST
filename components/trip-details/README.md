# Trip Details Components

هذا المجلد يحتوي على جميع الكمبوننتات الفرعية لشاشة تفاصيل الرحلة.

## هيكل الكمبوننتات

### 1. TripHeader
- عرض رأس الشاشة مع أزرار العودة والحذف
- Props: `isDark`, `onBack`, `onDelete`

### 2. TripInfoCard
- عرض معلومات الرحلة الأساسية (الاسم، الوصف، التواريخ، إجمالي المصاريف)
- Props: `trip`, `summary`, `participantsCount`, `isDark`

### 3. TotalAmountDueCard
- عرض إجمالي المبلغ المستحق من جميع المشاركين
- Props: `totalAmountDue`, `currency`, `isDark`

### 4. ParticipantsSection
- قسم المشاركين مع زر إضافة مشارك جديد
- Props: `trip`, `participants`, `summary`, `isDark`, `onAddParticipant`, `onRemoveParticipant`, `onUpdateAmount`

### 5. ParticipantCard
- بطاقة عرض تفاصيل مشارك واحد مع إمكانية التحرير والحذف
- Props: `participant`, `trip`, `summary`, `isDark`, `onRemove`, `onUpdateAmount`

### 6. ExpensesSection
- قسم المصاريف مع زر إضافة مصروف جديد
- Props: `trip`, `expenses`, `isDark`, `onAddExpense`

### 7. SettlementsSection
- قسم التسويات المطلوبة بين المشاركين
- Props: `settlements`, `users`, `currency`, `isDark`

### 8. ActionsSection
- أزرار الإجراءات (تعديل الرحلة، التحليلات)
- Props: `tripId`, `isDark`

### 9. AddParticipantModal
- نافذة منبثقة لإضافة مشارك جديد
- Props: `visible`, `onClose`, `onAddParticipant`, `existingParticipants`, `users`, `currency`, `isDark`

## الميزات المضافة

### ✅ إجمالي المبلغ المستحق
- عرض المبلغ الإجمالي المستحق من جميع المشاركين في بطاقة منفصلة
- حساب تلقائي للمبلغ من المبالغ الفردية

### ✅ إضافة المشاركين
- زر "إضافة مشارك" في قسم المشاركين
- نافذة منبثقة لاختيار المستخدم وتحديد المبلغ المستحق
- فلترة المستخدمين المتاحين (غير المشاركين بالفعل)

### ✅ حذف المشاركين
- زر حذف في بطاقة كل مشارك
- تأكيد قبل الحذف مع تحذير من حذف المشتريات الفردية
- تنظيف البيانات المرتبطة (المبالغ المستحقة، المشتريات الفردية)

### ✅ تحرير المبلغ المستحق
- زر تحرير في بطاقة كل مشارك
- تحرير مباشر للمبلغ المستحق مع أزرار حفظ وإلغاء
- التحقق من صحة البيانات (منع القيم السالبة)

### ✅ عرض تفصيلي للمشاركين
- المبلغ المستحق الفردي
- إجمالي المدفوع
- النصيب من المصاريف
- المشتريات الفردية
- المبلغ المتبقي مع تلوين حسب الحالة

## الاستخدام

```tsx
import { TripHeader, TripInfoCard, /* ... */ } from '@/components/trip-details';

// في الكمبوننت الرئيسي
<TripHeader 
  isDark={isDark}
  onBack={() => router.back()}
  onDelete={حذف_الرحلة_مع_التأكيد}
/>
```

## التحسينات المستقبلية

- إضافة إمكانية تحرير معلومات الرحلة مباشرة
- إضافة فلاتر وترتيب للمصاريف
- إضافة إحصائيات أكثر تفصيلاً
- إضافة إمكانية تصدير البيانات

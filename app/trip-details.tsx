import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { إزالة_مشارك_من_الرحلة, إضافة_مشارك_للرحلة, تحديث_رحلة, حذف_رحلة } from '@/store/slices/رحلاتSlice';
import { حذف_مشتريات_المستخدم } from '@/store/slices/مشترياتSlice';
import { حذف_مصاريف_الرحلة } from '@/store/slices/مصاريفSlice';
import { حساب_ملخص_الرحلة } from '@/utils/calculations';

// استيراد الكمبوننتات الفرعية
import {
    ActionsSection,
    AddParticipantModal,
    ExpensesSection,
    ParticipantsSection,
    SettlementsSection,
    TotalAmountDueCard,
    TripHeader,
    TripInfoCard
} from '@/components/trip-details';

export default function شاشة_تفاصيل_الرحلة() {
  const { tripId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { المصاريف } = useAppSelector(state => state.مصاريف);

  const [جاري_التحديث, تعيين_جاري_التحديث] = useState(false);
  const [عرض_modal_إضافة_مشارك, تعيين_عرض_modal_إضافة_مشارك] = useState(false);

  const isDark = colorScheme === 'dark';
  const الرحلة = الرحلات.find(r => r.id === tripId);

  if (!الرحلة) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <ThemedText type="subtitle" style={styles.errorTitle}>
            الرحلة غير موجودة
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#007AFF' }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.buttonText, { color: 'white' }]}>
              العودة
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // حساب ملخص الرحلة
  const ملخص_الرحلة = حساب_ملخص_الرحلة(الرحلة.id, المصاريف, المستخدمين);
  const مشاركو_الرحلة = المستخدمين.filter(م => الرحلة.المشاركون.includes(م.id));
  const مصاريف_الرحلة = المصاريف.filter(م => م.معرف_الرحلة === الرحلة.id);

  // حساب إجمالي المبلغ المستحق من جميع المشاركين
  const إجمالي_المبلغ_المستحق = Object.values(الرحلة.المبالغ_المستحقة_الفردية || {})
    .reduce((مجموع, مبلغ) => مجموع + مبلغ, 0);

  const حذف_الرحلة_مع_التأكيد = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من رغبتك في حذف هذه الرحلة؟ سيتم حذف جميع المصاريف المرتبطة بها.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            dispatch(حذف_مصاريف_الرحلة(الرحلة.id));
            dispatch(حذف_رحلة(الرحلة.id));
            router.back();
          },
        },
      ]
    );
  };

  const إضافة_مصروف = () => {
    router.push(`/add-expense?tripId=${الرحلة.id}`);
  };

  const إضافة_مشارك = (معرف_المستخدم: string, المبلغ_المستحق: number) => {
    // إضافة المشارك للرحلة
    dispatch(إضافة_مشارك_للرحلة({
      معرف_الرحلة: الرحلة.id,
      معرف_المستخدم
    }));

    // تحديث المبلغ المستحق
    const رحلة_محدثة = {
      ...الرحلة,
      المبالغ_المستحقة_الفردية: {
        ...الرحلة.المبالغ_المستحقة_الفردية,
        [معرف_المستخدم]: المبلغ_المستحق
      },
      تاريخ_التحديث: new Date().toISOString(),
    };

    dispatch(تحديث_رحلة(رحلة_محدثة));
    تعيين_عرض_modal_إضافة_مشارك(false);
  };

  const حذف_مشارك = (معرف_المستخدم: string) => {
    const مستخدم = المستخدمين.find(م => م.id === معرف_المستخدم);

    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من رغبتك في حذف ${مستخدم?.الاسم} من الرحلة؟ سيتم حذف جميع مشترياته الفردية.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            // حذف المشارك من الرحلة
            dispatch(إزالة_مشارك_من_الرحلة({
              معرف_الرحلة: الرحلة.id,
              معرف_المستخدم
            }));

            // حذف مشترياته الفردية
            dispatch(حذف_مشتريات_المستخدم({
              معرف_الرحلة: الرحلة.id,
              معرف_المستخدم
            }));

            // إزالة المبلغ المستحق
            const مبالغ_جديدة = { ...الرحلة.المبالغ_المستحقة_الفردية };
            delete مبالغ_جديدة[معرف_المستخدم];

            const رحلة_محدثة = {
              ...الرحلة,
              المبالغ_المستحقة_الفردية: مبالغ_جديدة,
              تاريخ_التحديث: new Date().toISOString(),
            };

            dispatch(تحديث_رحلة(رحلة_محدثة));
          },
        },
      ]
    );
  };

  const تحديث_المبلغ_المستحق = (معرف_المستخدم: string, مبلغ_جديد: number) => {
    const رحلة_محدثة = {
      ...الرحلة,
      المبالغ_المستحقة_الفردية: {
        ...الرحلة.المبالغ_المستحقة_الفردية,
        [معرف_المستخدم]: مبلغ_جديد
      },
      تاريخ_التحديث: new Date().toISOString(),
    };

    dispatch(تحديث_رحلة(رحلة_محدثة));
  };

  return (
    <ThemedView style={styles.container}>
      <TripHeader
        isDark={isDark}
        onBack={() => router.back()}
        onDelete={حذف_الرحلة_مع_التأكيد}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={جاري_التحديث}
            onRefresh={() => {
              تعيين_جاري_التحديث(true);
              setTimeout(() => تعيين_جاري_التحديث(false), 1000);
            }}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <TripInfoCard
          trip={الرحلة}
          summary={ملخص_الرحلة}
          participantsCount={مشاركو_الرحلة.length}
          isDark={isDark}
        />

        <TotalAmountDueCard
          totalAmountDue={إجمالي_المبلغ_المستحق}
          currency={الرحلة.العملة}
          isDark={isDark}
        />

        <ParticipantsSection
          trip={الرحلة}
          participants={مشاركو_الرحلة}
          summary={ملخص_الرحلة}
          isDark={isDark}
          onAddParticipant={() => تعيين_عرض_modal_إضافة_مشارك(true)}
          onRemoveParticipant={حذف_مشارك}
          onUpdateAmount={تحديث_المبلغ_المستحق}
        />

        <ExpensesSection
          trip={الرحلة}
          expenses={مصاريف_الرحلة}
          isDark={isDark}
          onAddExpense={إضافة_مصروف}
        />

        <SettlementsSection
          settlements={ملخص_الرحلة.التسويات_المطلوبة}
          users={المستخدمين}
          currency={الرحلة.العملة}
          isDark={isDark}
        />

        <ActionsSection
          tripId={الرحلة.id}
          isDark={isDark}
        />
      </ScrollView>

      <AddParticipantModal
        visible={عرض_modal_إضافة_مشارك}
        onClose={() => تعيين_عرض_modal_إضافة_مشارك(false)}
        onAddParticipant={إضافة_مشارك}
        existingParticipants={الرحلة.المشاركون}
        users={المستخدمين}
        currency={الرحلة.العملة}
        isDark={isDark}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
});

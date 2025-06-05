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
import { حذف_رحلة } from '@/store/slices/رحلاتSlice';
import { حذف_مصاريف_الرحلة } from '@/store/slices/مصاريفSlice';
import { حساب_ملخص_الرحلة } from '@/utils/calculations';
import { formatAmount, تنسيق_التاريخ } from '@/utils/helpers';

export default function شاشة_تفاصيل_الرحلة() {
  const { tripId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { المصاريف } = useAppSelector(state => state.مصاريف);

  const [جاري_التحديث, تعيين_جاري_التحديث] = useState(false);

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

  const عرض_بطاقة_مشارك = (مستخدم: any) => {
    const رصيد_المستخدم = ملخص_الرحلة.أرصدة_المستخدمين.find(ر => ر.معرف_المستخدم === مستخدم.id);
    const المبلغ_المستحق_الفردي = الرحلة.المبالغ_المستحقة_الفردية?.[مستخدم.id] || 0;
    const المدفوع = رصيد_المستخدم?.إجمالي_المدفوع || 0;
    const النصيب = رصيد_المستخدم?.إجمالي_النصيب || 0;
    const الرصيد_الصافي = رصيد_المستخدم?.الرصيد_الصافي || 0;

    // حساب المشتريات الفردية
    const { المشتريات } = useAppSelector(state => state.مشتريات);
    const مشتريات_المستخدم = المشتريات.filter(
      م => م.معرف_الرحلة === الرحلة.id && م.معرف_المستخدم === مستخدم.id
    );
    const إجمالي_المشتريات = مشتريات_المستخدم.reduce((مجموع, م) => مجموع + م.المبلغ, 0);
    const المبلغ_المتبقي = المبلغ_المستحق_الفردي - إجمالي_المشتريات;

    return (
      <View
        key={مستخدم.id}
        style={[styles.participantCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
      >
        <View style={styles.participantHeader}>
          <View style={styles.participantInfo}>
            <View style={styles.participantAvatar}>
              <ThemedText style={styles.avatarText}>
                {مستخدم.الصورة_الرمزية || '👤'}
              </ThemedText>
            </View>
            <View style={styles.participantDetails}>
              <ThemedText type="defaultSemiBold" style={styles.participantName}>
                {مستخدم.الاسم}
              </ThemedText>
              <View style={styles.balanceInfo}>
                <ThemedText 
                  type="caption" 
                  style={[
                    styles.balanceText,
                    { color: الرصيد_الصافي >= 0 ? '#34C759' : '#FF3B30' }
                  ]}
                >
                  {الرصيد_الصافي >= 0 ? 'له' : 'عليه'}: {formatAmount(Math.abs(الرصيد_الصافي), الرحلة.العملة)}
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.participantActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={() => router.push(`/individual-purchases?tripId=${الرحلة.id}&userId=${مستخدم.id}`)}
            >
              <Ionicons name="bag" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.participantDetails}>
          <View style={styles.detailRow}>
            <ThemedText type="caption" style={styles.detailLabel}>
              المبلغ المستحق:
            </ThemedText>
            <ThemedText type="caption" style={styles.detailValue}>
              {formatAmount(المبلغ_المستحق_الفردي, الرحلة.العملة)}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="caption" style={styles.detailLabel}>
              إجمالي المدفوع:
            </ThemedText>
            <ThemedText type="caption" style={styles.detailValue}>
              {formatAmount(المدفوع, الرحلة.العملة)}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="caption" style={styles.detailLabel}>
              نصيبه من المصاريف:
            </ThemedText>
            <ThemedText type="caption" style={styles.detailValue}>
              {formatAmount(النصيب, الرحلة.العملة)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const عرض_مصروف = (مصروف: any) => (
    <TouchableOpacity
      key={مصروف.id}
      style={[styles.expenseCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
      onPress={() => router.push(`/expense-details?expenseId=${مصروف.id}`)}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <ThemedText type="defaultSemiBold" style={styles.expenseTitle}>
            {مصروف.العنوان}
          </ThemedText>
          <ThemedText type="caption" style={styles.expenseCategory}>
            {مصروف.الفئة} • {تنسيق_التاريخ(مصروف.تاريخ_المصروف)}
          </ThemedText>
        </View>
        <View style={styles.expenseAmount}>
          <ThemedText type="defaultSemiBold" style={styles.amountText}>
            {formatAmount(مصروف.المبلغ, الرحلة.العملة)}
          </ThemedText>
        </View>
      </View>
      {مصروف.الوصف && (
        <ThemedText type="caption" style={styles.expenseDescription}>
          {مصروف.الوصف}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  const مصاريف_الرحلة = المصاريف.filter(م => م.معرف_الرحلة === الرحلة.id);

  return (
    <ThemedView style={styles.container}>
      {/* الرأس */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-forward" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          تفاصيل الرحلة
        </ThemedText>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={حذف_الرحلة_مع_التأكيد}
        >
          <Ionicons name="trash" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

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
        {/* معلومات الرحلة */}
        <View style={[styles.tripInfoCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
          <ThemedText type="title" style={styles.tripTitle}>
            {الرحلة.الاسم}
          </ThemedText>
          {الرحلة.الوصف && (
            <ThemedText type="default" style={styles.tripDescription}>
              {الرحلة.الوصف}
            </ThemedText>
          )}

          <View style={styles.tripMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <ThemedText type="caption" style={styles.metaText}>
                {تنسيق_التاريخ(الرحلة.تاريخ_البداية)}
                {الرحلة.تاريخ_النهاية && ` - ${تنسيق_التاريخ(الرحلة.تاريخ_النهاية)}`}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="people" size={16} color="#666" />
              <ThemedText type="caption" style={styles.metaText}>
                {مشاركو_الرحلة.length} مشارك
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="wallet" size={16} color="#666" />
              <ThemedText type="caption" style={styles.metaText}>
                إجمالي المصاريف: {formatAmount(ملخص_الرحلة.إجمالي_المصاريف, الرحلة.العملة)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* المشاركون */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            المشاركون ({مشاركو_الرحلة.length})
          </ThemedText>
          <View style={styles.participantsContainer}>
            {مشاركو_الرحلة.map(عرض_بطاقة_مشارك)}
          </View>
        </View>

        {/* المصاريف */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              المصاريف ({مصاريف_الرحلة.length})
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#007AFF' }]}
              onPress={إضافة_مصروف}
            >
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={[styles.addButtonText, { color: 'white' }]}>
                إضافة مصروف
              </ThemedText>
            </TouchableOpacity>
          </View>

          {مصاريف_الرحلة.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt" size={48} color={isDark ? '#666' : '#CCC'} />
              <ThemedText type="caption" style={styles.emptyText}>
                لا توجد مصاريف بعد
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtext}>
                اضغط على "إضافة مصروف" لبدء تتبع المصاريف
              </ThemedText>
            </View>
          ) : (
            <View style={styles.expensesContainer}>
              {مصاريف_الرحلة.map(عرض_مصروف)}
            </View>
          )}
        </View>

        {/* التسويات المطلوبة */}
        {ملخص_الرحلة.التسويات_المطلوبة.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              التسويات المطلوبة
            </ThemedText>
            <View style={[styles.settlementsCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              {ملخص_الرحلة.التسويات_المطلوبة.map((تسوية, فهرس) => {
                const من = المستخدمين.find(م => م.id === تسوية.من);
                const إلى = المستخدمين.find(م => م.id === تسوية.إلى);

                return (
                  <View key={فهرس} style={styles.settlementRow}>
                    <View style={styles.settlementInfo}>
                      <ThemedText type="default" style={styles.settlementText}>
                        {من?.الاسم} يدفع لـ {إلى?.الاسم}
                      </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.settlementAmount}>
                      {formatAmount(تسوية.المبلغ, الرحلة.العملة)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* أزرار الإجراءات */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => router.push(`/edit-trip?tripId=${الرحلة.id}`)}
          >
            <Ionicons name="create" size={20} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              تعديل الرحلة
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#34C759' }]}
            onPress={() => router.push(`/trip-analytics?tripId=${الرحلة.id}`)}
          >
            <Ionicons name="analytics" size={20} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              التحليلات
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 8,
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
  tripInfoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  tripDescription: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  tripMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  participantsContainer: {
    gap: 12,
  },
  participantCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: 'white',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    marginBottom: 4,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontWeight: '600',
  },
  participantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: '600',
  },
  expensesContainer: {
    gap: 12,
  },
  expenseCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseTitle: {
    marginBottom: 4,
  },
  expenseCategory: {
    opacity: 0.7,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#007AFF',
  },
  expenseDescription: {
    marginTop: 8,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    textAlign: 'center',
  },
  settlementsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  settlementInfo: {
    flex: 1,
  },
  settlementText: {
    marginBottom: 2,
  },
  settlementAmount: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

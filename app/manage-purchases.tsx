import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { إضافة_مشترى, تحديث_مشترى, حذف_مشترى } from '@/store/slices/مشترياتSlice';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatAmount, توليد_معرف } from '@/utils/helpers';

export default function شاشة_إدارة_المشتريات() {
  const { tripId, userId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  
  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { المشتريات } = useAppSelector(state => state.مشتريات);

  const [عرض_نافذة_الإضافة, تعيين_عرض_نافذة_الإضافة] = useState(false);
  const [المشترى_المحرر, تعيين_المشترى_المحرر] = useState<any>(null);
  const [عنوان_المشترى, تعيين_عنوان_المشترى] = useState('');
  const [مبلغ_المشترى, تعيين_مبلغ_المشترى] = useState('');
  const [وصف_المشترى, تعيين_وصف_المشترى] = useState('');
  const [تاريخ_الشراء, تعيين_تاريخ_الشراء] = useState(new Date());
  const [عرض_تاريخ_الشراء, تعيين_عرض_تاريخ_الشراء] = useState(false);

  const isDark = colorScheme === 'dark';
  const الرحلة = الرحلات.find(ر => ر.id === tripId);
  const المستخدم = المستخدمين.find(م => م.id === userId);
  
  // فلترة المشتريات الخاصة بهذا المستخدم في هذه الرحلة
  const مشتريات_المستخدم = المشتريات.filter(
    م => م.معرف_الرحلة === tripId && م.معرف_المستخدم === userId
  );

  if (!الرحلة || !المستخدم) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <ThemedText type="subtitle" style={styles.errorTitle}>
            بيانات غير صحيحة
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

  // حساب الإحصائيات
  const إجمالي_المشتريات = مشتريات_المستخدم.reduce((مجموع, م) => مجموع + م.المبلغ, 0);
  const المبلغ_المستحق = الرحلة.المبالغ_المستحقة_الفردية?.[userId as string] || 0;
  const المبلغ_المتبقي = المبلغ_المستحق - إجمالي_المشتريات;

  const إعادة_تعيين_النموذج = () => {
    تعيين_عنوان_المشترى('');
    تعيين_مبلغ_المشترى('');
    تعيين_وصف_المشترى('');
    تعيين_تاريخ_الشراء(new Date());
    تعيين_المشترى_المحرر(null);
  };

  const فتح_نافذة_إضافة_مشترى = () => {
    إعادة_تعيين_النموذج();
    تعيين_عرض_نافذة_الإضافة(true);
  };

  const فتح_نافذة_تعديل_مشترى = (مشترى: any) => {
    تعيين_المشترى_المحرر(مشترى);
    تعيين_عنوان_المشترى(مشترى.العنوان);
    تعيين_مبلغ_المشترى(مشترى.المبلغ.toString());
    تعيين_وصف_المشترى(مشترى.الوصف || '');
    تعيين_تاريخ_الشراء(new Date(مشترى.تاريخ_الشراء));
    تعيين_عرض_نافذة_الإضافة(true);
  };

  const حفظ_المشترى = () => {
    if (!عنوان_المشترى.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان المشترى');
      return;
    }

    const مبلغ = parseFloat(مبلغ_المشترى);
    if (isNaN(مبلغ) || مبلغ <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح');
      return;
    }

    if (المشترى_المحرر) {
      // تحديث مشترى موجود
      const مشترى_محدث = {
        ...المشترى_المحرر,
        العنوان: عنوان_المشترى.trim(),
        المبلغ: مبلغ,
        الوصف: وصف_المشترى.trim(),
        تاريخ_الشراء: تاريخ_الشراء.toISOString().split('T')[0],
      };
      dispatch(تحديث_مشترى(مشترى_محدث));
      Alert.alert('نجح', 'تم تحديث المشترى بنجاح');
    } else {
      // إضافة مشترى جديد
      const مشترى_جديد = {
        id: توليد_معرف(),
        معرف_الرحلة: tripId as string,
        معرف_المستخدم: userId as string,
        العنوان: عنوان_المشترى.trim(),
        المبلغ: مبلغ,
        الوصف: وصف_المشترى.trim(),
        تاريخ_الشراء: تاريخ_الشراء.toISOString().split('T')[0],
        تاريخ_الإنشاء: new Date().toISOString(),
      };
      dispatch(إضافة_مشترى(مشترى_جديد));
      Alert.alert('نجح', 'تم إضافة المشترى بنجاح');
    }

    تعيين_عرض_نافذة_الإضافة(false);
    إعادة_تعيين_النموذج();
  };

  const حذف_مشترى_مع_التأكيد = (مشترى: any) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من رغبتك في حذف "${مشترى.العنوان}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            dispatch(حذف_مشترى(مشترى.id));
            Alert.alert('تم الحذف', 'تم حذف المشترى بنجاح');
          },
        },
      ]
    );
  };

  const عرض_بطاقة_مشترى = (مشترى: any) => (
    <View
      key={مشترى.id}
      style={[styles.purchaseCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
    >
      <View style={styles.purchaseHeader}>
        <View style={styles.purchaseInfo}>
          <ThemedText type="defaultSemiBold" style={styles.purchaseTitle}>
            {مشترى.العنوان}
          </ThemedText>
          <ThemedText type="caption" style={styles.purchaseDate}>
            {new Date(مشترى.تاريخ_الشراء).toLocaleDateString('ar-EG')}
          </ThemedText>
          {مشترى.الوصف && (
            <ThemedText type="caption" style={styles.purchaseDescription}>
              {مشترى.الوصف}
            </ThemedText>
          )}
        </View>
        <View style={styles.purchaseActions}>
          <ThemedText type="defaultSemiBold" style={[styles.purchaseAmount, { color: '#007AFF' }]}>
            {formatAmount(مشترى.المبلغ, الرحلة.العملة)}
          </ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={() => فتح_نافذة_تعديل_مشترى(مشترى)}
            >
              <Ionicons name="create" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => حذف_مشترى_مع_التأكيد(مشترى)}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

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
        <View style={styles.headerInfo}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            مشتريات {المستخدم.الاسم}
          </ThemedText>
          <ThemedText type="caption" style={styles.headerSubtitle}>
            {الرحلة.الاسم}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={فتح_نافذة_إضافة_مشترى}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* الإحصائيات */}
      <View style={[styles.statsContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
        <View style={styles.statItem}>
          <ThemedText type="caption" style={styles.statLabel}>
            المبلغ المستحق
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {formatAmount(المبلغ_المستحق, الرحلة.العملة)}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="caption" style={styles.statLabel}>
            إجمالي المشتريات
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#FF9500' }]}>
            {formatAmount(إجمالي_المشتريات, الرحلة.العملة)}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="caption" style={styles.statLabel}>
            المبلغ المتبقي
          </ThemedText>
          <ThemedText 
            type="defaultSemiBold" 
            style={[
              styles.statValue, 
              { color: المبلغ_المتبقي >= 0 ? '#34C759' : '#FF3B30' }
            ]}
          >
            {formatAmount(المبلغ_المتبقي, الرحلة.العملة)}
          </ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {مشتريات_المستخدم.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag" size={64} color={isDark ? '#666' : '#CCC'} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              لا توجد مشتريات بعد
            </ThemedText>
            <ThemedText type="caption" style={styles.emptyDescription}>
              اضغط على "+" لإضافة مشترى جديد
            </ThemedText>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#007AFF' }]}
              onPress={فتح_نافذة_إضافة_مشترى}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                إضافة مشترى جديد
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.purchasesContainer}>
            <ThemedText type="caption" style={styles.purchasesCount}>
              {مشتريات_المستخدم.length} مشترى
            </ThemedText>
            {مشتريات_المستخدم
              .sort((أ, ب) => new Date(ب.تاريخ_الشراء).getTime() - new Date(أ.تاريخ_الشراء).getTime())
              .map(عرض_بطاقة_مشترى)}
          </View>
        )}
      </ScrollView>

      {/* نافذة إضافة/تعديل مشترى */}
      <Modal
        visible={عرض_نافذة_الإضافة}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => تعيين_عرض_نافذة_الإضافة(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <TouchableOpacity
              onPress={() => تعيين_عرض_نافذة_الإضافة(false)}
              style={styles.modalCloseButton}
            >
              <ThemedText style={[styles.modalCloseText, { color: '#007AFF' }]}>
                إلغاء
              </ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {المشترى_المحرر ? 'تعديل مشترى' : 'إضافة مشترى جديد'}
            </ThemedText>
            <TouchableOpacity
              onPress={حفظ_المشترى}
              style={styles.modalSaveButton}
            >
              <ThemedText style={[styles.modalSaveText, { color: '#007AFF' }]}>
                حفظ
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* عنوان المشترى */}
            <View style={styles.modalSection}>
              <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                عنوان المشترى *
              </ThemedText>
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={عنوان_المشترى}
                onChangeText={تعيين_عنوان_المشترى}
                placeholder="مثال: وجبة غداء"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            {/* مبلغ المشترى */}
            <View style={styles.modalSection}>
              <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                المبلغ *
              </ThemedText>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={[
                    styles.modalInput,
                    styles.amountInput,
                    { 
                      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                      color: isDark ? '#FFFFFF' : '#000000',
                      borderColor: isDark ? '#666' : '#CCC'
                    }
                  ]}
                  value={مبلغ_المشترى}
                  onChangeText={تعيين_مبلغ_المشترى}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <ThemedText type="default" style={styles.currencyText}>
                  {الرحلة.العملة}
                </ThemedText>
              </View>
            </View>

            {/* تاريخ الشراء */}
            <View style={styles.modalSection}>
              <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                تاريخ الشراء
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.dateSelector,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                onPress={() => تعيين_عرض_تاريخ_الشراء(true)}
              >
                <ThemedText type="default">
                  {تاريخ_الشراء.toLocaleDateString('ar-EG')}
                </ThemedText>
                <Ionicons name="calendar" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            {/* وصف المشترى */}
            <View style={styles.modalSection}>
              <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                وصف إضافي
              </ThemedText>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.descriptionInput,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={وصف_المشترى}
                onChangeText={تعيين_وصف_المشترى}
                placeholder="وصف اختياري للمشترى..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Date Picker */}
      {عرض_تاريخ_الشراء && (
        <DateTimePicker
          value={تاريخ_الشراء}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            تعيين_عرض_تاريخ_الشراء(false);
            if (selectedDate) {
              تعيين_تاريخ_الشراء(selectedDate);
            }
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  statValue: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  purchasesContainer: {
    gap: 12,
  },
  purchasesCount: {
    marginBottom: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  purchaseCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseTitle: {
    marginBottom: 4,
  },
  purchaseDate: {
    opacity: 0.7,
    marginBottom: 4,
  },
  purchaseDescription: {
    opacity: 0.8,
  },
  purchaseActions: {
    alignItems: 'flex-end',
  },
  purchaseAmount: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Almarai-Bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCloseButton: {
    minWidth: 60,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  modalSaveButton: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  modalSaveText: {
    fontSize: 16,
    fontFamily: 'Almarai-Bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    marginBottom: 8,
  },
  modalInput: {
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  currencyText: {
    minWidth: 60,
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
});

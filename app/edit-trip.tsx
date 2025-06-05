import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { تحديث_رحلة } from '@/store/slices/رحلاتSlice';
import { حذف_مشتريات_المستخدم } from '@/store/slices/مشترياتSlice';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatAmount } from '@/utils/helpers';

export default function شاشة_تعديل_الرحلة() {
  const { tripId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  
  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { المشتريات } = useAppSelector(state => state.مشتريات);

  const isDark = colorScheme === 'dark';
  const الرحلة = الرحلات.find(ر => ر.id === tripId);

  // حالة النموذج
  const [اسم_الرحلة, تعيين_اسم_الرحلة] = useState('');
  const [وصف_الرحلة, تعيين_وصف_الرحلة] = useState('');
  const [تاريخ_البداية, تعيين_تاريخ_البداية] = useState(new Date());
  const [تاريخ_النهاية, تعيين_تاريخ_النهاية] = useState(new Date());
  const [المبلغ_المستحق_العام, تعيين_المبلغ_المستحق_العام] = useState('0');
  const [المشاركون_المحددون, تعيين_المشاركون_المحددون] = useState<string[]>([]);
  const [المبالغ_المستحقة_الفردية, تعيين_المبالغ_المستحقة_الفردية] = useState<{ [معرف: string]: string }>({});
  const [عرض_تاريخ_البداية, تعيين_عرض_تاريخ_البداية] = useState(false);
  const [عرض_تاريخ_النهاية, تعيين_عرض_تاريخ_النهاية] = useState(false);

  // تحميل بيانات الرحلة
  useEffect(() => {
    if (الرحلة) {
      تعيين_اسم_الرحلة(الرحلة.الاسم);
      تعيين_وصف_الرحلة(الرحلة.الوصف || '');
      تعيين_تاريخ_البداية(new Date(الرحلة.تاريخ_البداية));
      تعيين_تاريخ_النهاية(new Date(الرحلة.تاريخ_النهاية || الرحلة.تاريخ_البداية));
      تعيين_المبلغ_المستحق_العام(الرحلة.المبلغ_المستحق_العام?.toString() || '0');
      تعيين_المشاركون_المحددون(الرحلة.المشاركون || []);
      
      // تحويل المبالغ المستحقة الفردية إلى نصوص
      const مبالغ_نصية: { [معرف: string]: string } = {};
      Object.entries(الرحلة.المبالغ_المستحقة_الفردية || {}).forEach(([معرف, مبلغ]) => {
        مبالغ_نصية[معرف] = مبلغ.toString();
      });
      تعيين_المبالغ_المستحقة_الفردية(مبالغ_نصية);
    }
  }, [الرحلة]);

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

  const تبديل_مشارك = (معرف_المستخدم: string) => {
    if (المشاركون_المحددون.includes(معرف_المستخدم)) {
      // إزالة المشارك
      تعيين_المشاركون_المحددون(المشاركون_المحددون.filter(id => id !== معرف_المستخدم));
      
      // إزالة المبلغ المستحق
      const مبالغ_جديدة = { ...المبالغ_المستحقة_الفردية };
      delete مبالغ_جديدة[معرف_المستخدم];
      تعيين_المبالغ_المستحقة_الفردية(مبالغ_جديدة);
      
      // حذف مشتريات هذا المستخدم من الرحلة
      dispatch(حذف_مشتريات_المستخدم({ 
        معرف_الرحلة: الرحلة.id, 
        معرف_المستخدم 
      }));
    } else {
      // إضافة المشارك
      تعيين_المشاركون_المحددون([...المشاركون_المحددون, معرف_المستخدم]);
      تعيين_المبالغ_المستحقة_الفردية({
        ...المبالغ_المستحقة_الفردية,
        [معرف_المستخدم]: المبلغ_المستحق_العام || '0'
      });
    }
  };

  const تحديث_المبلغ_المستحق_الفردي = (معرف_المستخدم: string, مبلغ: string) => {
    تعيين_المبالغ_المستحقة_الفردية({
      ...المبالغ_المستحقة_الفردية,
      [معرف_المستخدم]: مبلغ
    });
  };

  const تطبيق_المبلغ_العام_على_الجميع = () => {
    const مبالغ_محدثة: { [معرف: string]: string } = {};
    المشاركون_المحددون.forEach(معرف => {
      مبالغ_محدثة[معرف] = المبلغ_المستحق_العام;
    });
    تعيين_المبالغ_المستحقة_الفردية(مبالغ_محدثة);
  };

  const حساب_إجمالي_المشتريات_للمستخدم = (معرف_المستخدم: string): number => {
    return المشتريات
      .filter(م => م.معرف_الرحلة === الرحلة.id && م.معرف_المستخدم === معرف_المستخدم)
      .reduce((مجموع, م) => مجموع + م.المبلغ, 0);
  };

  const حساب_المبلغ_المتبقي_للمستخدم = (معرف_المستخدم: string): number => {
    const المبلغ_المستحق = parseFloat(المبالغ_المستحقة_الفردية[معرف_المستخدم] || '0');
    const إجمالي_المشتريات = حساب_إجمالي_المشتريات_للمستخدم(معرف_المستخدم);
    return المبلغ_المستحق - إجمالي_المشتريات;
  };

  const حفظ_التعديلات = () => {
    // التحقق من صحة البيانات
    if (!اسم_الرحلة.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الرحلة');
      return;
    }

    if (المشاركون_المحددون.length === 0) {
      Alert.alert('خطأ', 'يرجى اختيار مشارك واحد على الأقل');
      return;
    }

    if (تاريخ_النهاية < تاريخ_البداية) {
      Alert.alert('خطأ', 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    // تحديث الرحلة
    const رحلة_محدثة = {
      ...الرحلة,
      الاسم: اسم_الرحلة.trim(),
      الوصف: وصف_الرحلة.trim(),
      تاريخ_البداية: تاريخ_البداية.toISOString().split('T')[0],
      تاريخ_النهاية: تاريخ_النهاية.toISOString().split('T')[0],
      المبلغ_المستحق_العام: parseFloat(المبلغ_المستحق_العام) || 0,
      المشاركون: المشاركون_المحددون,
      المبالغ_المستحقة_الفردية: Object.fromEntries(
        Object.entries(المبالغ_المستحقة_الفردية).map(([معرف, مبلغ]) => [معرف, parseFloat(مبلغ) || 0])
      ),
      تاريخ_التحديث: new Date().toISOString(),
    };

    dispatch(تحديث_رحلة(رحلة_محدثة));
    Alert.alert('نجح', 'تم تحديث الرحلة بنجاح', [
      { text: 'موافق', onPress: () => router.back() }
    ]);
  };

  const عرض_مستخدم = (مستخدم: any) => {
    const محدد = المشاركون_المحددون.includes(مستخدم.id);
    const المبلغ_المستحق = parseFloat(المبالغ_المستحقة_الفردية[مستخدم.id] || '0');
    const إجمالي_المشتريات = حساب_إجمالي_المشتريات_للمستخدم(مستخدم.id);
    const المبلغ_المتبقي = حساب_المبلغ_المتبقي_للمستخدم(مستخدم.id);
    
    return (
      <View key={مستخدم.id} style={styles.userContainer}>
        <TouchableOpacity
          style={[
            styles.userCard,
            { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' },
            محدد && { borderColor: '#007AFF', borderWidth: 2 }
          ]}
          onPress={() => تبديل_مشارك(مستخدم.id)}
        >
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <ThemedText style={styles.avatarText}>
                {مستخدم.الصورة_الرمزية || '👤'}
              </ThemedText>
            </View>
            <View style={styles.userDetails}>
              <ThemedText type="default" style={styles.userName}>
                {مستخدم.الاسم}
              </ThemedText>
              {محدد && (
                <View style={styles.userStats}>
                  <ThemedText type="caption" style={styles.statText}>
                    مشتريات: {formatAmount(إجمالي_المشتريات, الرحلة.العملة)}
                  </ThemedText>
                  <ThemedText 
                    type="caption" 
                    style={[
                      styles.statText,
                      { color: المبلغ_المتبقي >= 0 ? '#34C759' : '#FF3B30' }
                    ]}
                  >
                    متبقي: {formatAmount(المبلغ_المتبقي, الرحلة.العملة)}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          <View style={styles.checkboxContainer}>
            {محدد && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
            {!محدد && (
              <View style={[styles.checkbox, { borderColor: isDark ? '#666' : '#CCC' }]} />
            )}
          </View>
        </TouchableOpacity>
        
        {محدد && (
          <View style={[styles.amountContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <ThemedText type="caption" style={styles.amountLabel}>
              المبلغ المستحق:
            </ThemedText>
            <TextInput
              style={[
                styles.amountInput,
                { 
                  backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#666' : '#CCC'
                }
              ]}
              value={المبالغ_المستحقة_الفردية[مستخدم.id] || '0'}
              onChangeText={(نص) => تحديث_المبلغ_المستحق_الفردي(مستخدم.id, نص)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
            <ThemedText type="caption" style={styles.currencyLabel}>
              {الرحلة.العملة}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

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
          تعديل الرحلة
        </ThemedText>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={حفظ_التعديلات}
        >
          <ThemedText style={[styles.saveButtonText, { color: '#007AFF' }]}>
            حفظ
          </ThemedText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* معلومات الرحلة الأساسية */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              معلومات الرحلة
            </ThemedText>
            
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              <ThemedText type="caption" style={styles.inputLabel}>
                اسم الرحلة *
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={اسم_الرحلة}
                onChangeText={تعيين_اسم_الرحلة}
                placeholder="مثال: رحلة الإسكندرية"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              <ThemedText type="caption" style={styles.inputLabel}>
                وصف الرحلة
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { 
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={وصف_الرحلة}
                onChangeText={تعيين_وصف_الرحلة}
                placeholder="وصف مختصر للرحلة..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* التواريخ */}
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => تعيين_عرض_تاريخ_البداية(true)}
              >
                <ThemedText type="caption" style={styles.dateLabel}>
                  تاريخ البداية
                </ThemedText>
                <ThemedText type="default" style={styles.dateValue}>
                  {تاريخ_البداية.toLocaleDateString('ar-EG')}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => تعيين_عرض_تاريخ_النهاية(true)}
              >
                <ThemedText type="caption" style={styles.dateLabel}>
                  تاريخ النهاية
                </ThemedText>
                <ThemedText type="default" style={styles.dateValue}>
                  {تاريخ_النهاية.toLocaleDateString('ar-EG')}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* المبلغ المستحق العام */}
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              <View style={styles.generalAmountHeader}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  المبلغ المستحق العام
                </ThemedText>
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: '#007AFF' }]}
                  onPress={تطبيق_المبلغ_العام_على_الجميع}
                >
                  <ThemedText style={[styles.applyButtonText, { color: 'white' }]}>
                    تطبيق على الجميع
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={المبلغ_المستحق_العام}
                onChangeText={تعيين_المبلغ_المستحق_العام}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>
          </View>

          {/* اختيار المشاركين */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              المشاركون ({المشاركون_المحددون.length})
            </ThemedText>
            
            {المستخدمين.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people" size={48} color={isDark ? '#666' : '#CCC'} />
                <ThemedText type="caption" style={styles.emptyText}>
                  لا يوجد مشاركون متاحون
                </ThemedText>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#007AFF', marginTop: 16 }]}
                  onPress={() => router.push('/manage-users')}
                >
                  <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                    إضافة مشاركين
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.usersContainer}>
                {المستخدمين.map(عرض_مستخدم)}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {عرض_تاريخ_البداية && (
        <DateTimePicker
          value={تاريخ_البداية}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            تعيين_عرض_تاريخ_البداية(false);
            if (selectedDate) {
              تعيين_تاريخ_البداية(selectedDate);
            }
          }}
        />
      )}

      {عرض_تاريخ_النهاية && (
        <DateTimePicker
          value={تاريخ_النهاية}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            تعيين_عرض_تاريخ_النهاية(false);
            if (selectedDate) {
              تعيين_تاريخ_النهاية(selectedDate);
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Almarai-Bold',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
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
  dateLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  dateValue: {
    fontFamily: 'Almarai-Bold',
  },
  generalAmountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyButtonText: {
    fontSize: 12,
    fontFamily: 'Almarai-Bold',
  },
  usersContainer: {
    gap: 12,
  },
  userContainer: {
    marginBottom: 8,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    opacity: 0.8,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  amountLabel: {
    flex: 1,
  },
  amountInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
  },
  currencyLabel: {
    minWidth: 40,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Almarai-Bold',
    textAlign: 'center',
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

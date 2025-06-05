import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    إعادة_تعيين_الإعدادات,
    تبديل_الإشعارات,
    تبديل_الوضع_المظلم,
    تعيين_العملة_الافتراضية
} from '@/store/slices/إعداداتSlice';
import {
    مسح_جميع_الرحلات
} from '@/store/slices/رحلاتSlice';
import {
    مسح_جميع_المستخدمين
} from '@/store/slices/مستخدمينSlice';
import {
    مسح_جميع_المصاريف
} from '@/store/slices/مصاريفSlice';
import { العملات_المدعومة } from '@/utils/helpers';

// استيراد مؤقت للخدمات - سيتم تفعيلها عند إعداد Firebase
const AuthService = {
  هل_مسجل_الدخول: () => false,
  الحصول_على_معرف_المستخدم: () => null
};

const FirebaseService = {
  حفظ_جميع_البيانات: async () => { throw new Error('Firebase غير مفعل'); }
};

const بدء_المزامنة = () => ({ type: 'START_SYNC' });
const نجحت_المزامنة = () => ({ type: 'SYNC_SUCCESS' });
const فشلت_المزامنة = (error: string) => ({ type: 'SYNC_FAILED', payload: error });
const تسجيل_الخروج = () => ({ type: 'LOGOUT' });

export default function شاشة_الإعدادات() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const { الإعدادات } = useAppSelector(state => state.إعدادات);
  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المصاريف } = useAppSelector(state => state.مصاريف);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { مسجل_الدخول, المستخدم, جاري_المزامنة, آخر_مزامنة } = useAppSelector(state => state.auth);

  const [عرض_اختيار_العملة, تعيين_عرض_اختيار_العملة] = useState(false);

  const isDark = colorScheme === 'dark';

  const تأكيد_مسح_البيانات = () => {
    Alert.alert(
      'تأكيد المسح',
      'هل أنت متأكد من رغبتك في مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: مسح_جميع_البيانات,
        },
      ]
    );
  };

  const مسح_جميع_البيانات = () => {
    dispatch(مسح_جميع_الرحلات());
    dispatch(مسح_جميع_المصاريف());
    dispatch(مسح_جميع_المستخدمين());
    Alert.alert('تم المسح', 'تم مسح جميع البيانات بنجاح');
  };

  const حفظ_البيانات_على_السحابة = async () => {
    // التحقق من تسجيل الدخول
    if (!AuthService.هل_مسجل_الدخول()) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول بجوجل لحفظ البيانات على السحابة',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تسجيل الدخول',
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }

    try {
      dispatch(بدء_المزامنة());

      const معرف_المستخدم = AuthService.الحصول_على_معرف_المستخدم();

      if (معرف_المستخدم) {
        await FirebaseService.حفظ_جميع_البيانات(
          معرف_المستخدم,
          المستخدمين,
          الرحلات,
          المصاريف
        );

        dispatch(نجحت_المزامنة());
        Alert.alert('نجح', 'تم حفظ البيانات على السحابة بنجاح');
      }
    } catch (خطأ: any) {
      dispatch(فشلت_المزامنة(خطأ.message));
      Alert.alert('خطأ', 'فشل في حفظ البيانات: ' + خطأ.message);
    }
  };

  const تأكيد_حفظ_البيانات = () => {
    Alert.alert(
      'حفظ على السحابة',
      'هل تريد حفظ جميع بياناتك على السحابة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: حفظ_البيانات_على_السحابة
        }
      ]
    );
  };

  const تأكيد_إعادة_تعيين_الإعدادات = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: () => {
            dispatch(إعادة_تعيين_الإعدادات());
            Alert.alert('تم', 'تم إعادة تعيين الإعدادات بنجاح');
          },
        },
      ]
    );
  };

  const عرض_عنصر_إعداد = (
    العنوان: string,
    الوصف: string,
    الأيقونة: string,
    المحتوى: React.ReactNode,
    عند_الضغط?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
      onPress={عند_الضغط}
      disabled={!عند_الضغط}
      activeOpacity={عند_الضغط ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={الأيقونة as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="default" style={styles.settingTitle}>
          {العنوان}
        </ThemedText>
        <ThemedText type="caption" style={styles.settingDescription}>
          {الوصف}
        </ThemedText>
      </View>
      <View style={styles.settingControl}>
        {المحتوى}
      </View>
    </TouchableOpacity>
  );

  const عرض_قسم = (العنوان: string, المحتوى: React.ReactNode) => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {العنوان}
      </ThemedText>
      {المحتوى}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* الرأس */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          الإعدادات
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* إعدادات المظهر */}
        {عرض_قسم('المظهر', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'الوضع المظلم',
              'تفعيل أو إلغاء الوضع المظلم',
              'moon',
              <Switch
                value={الإعدادات.الوضع_المظلم}
                onValueChange={() => dispatch(تبديل_الوضع_المظلم())}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
        ))}

        {/* إدارة المشاركين */}
        {عرض_قسم('المشاركون', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'إدارة المشاركين',
              `عدد المشاركين: ${المستخدمين.length}`,
              'people',
              <Ionicons name="chevron-back" size={20} color="#C7C7CC" />,
              () => router.push('/manage-users')
            )}
          </View>
        ))}

        {/* إعدادات العملة */}
        {عرض_قسم('العملة', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'العملة الافتراضية',
              `العملة المستخدمة حالياً: ${الإعدادات.العملة_الافتراضية}`,
              'card',
              <Ionicons name="chevron-back" size={20} color="#C7C7CC" />,
              () => تعيين_عرض_اختيار_العملة(true)
            )}
          </View>
        ))}

        {/* إعدادات الإشعارات */}
        {عرض_قسم('الإشعارات', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'الإشعارات',
              'تفعيل أو إلغاء الإشعارات',
              'notifications',
              <Switch
                value={الإعدادات.الإشعارات_مفعلة}
                onValueChange={() => dispatch(تبديل_الإشعارات())}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
        ))}

        {/* إحصائيات التطبيق */}
        {عرض_قسم('إحصائيات التطبيق', (
          <View style={[styles.statsCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
            <View style={styles.statRow}>
              <ThemedText type="caption">عدد الرحلات:</ThemedText>
              <ThemedText type="defaultSemiBold">{الرحلات.length}</ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText type="caption">عدد المصاريف:</ThemedText>
              <ThemedText type="defaultSemiBold">{المصاريف.length}</ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText type="caption">عدد المستخدمين:</ThemedText>
              <ThemedText type="defaultSemiBold">{المستخدمين.length}</ThemedText>
            </View>
          </View>
        ))}

        {/* المزامنة والنسخ الاحتياطي */}
        {عرض_قسم('المزامنة والنسخ الاحتياطي', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'حفظ على السحابة',
              'حفظ جميع بياناتك على Google Drive (يتطلب تسجيل الدخول)',
              'cloud-upload',
              <Ionicons name="chevron-back" size={20} color="#34C759" />,
              تأكيد_حفظ_البيانات
            )}
          </View>
        ))}

        {/* إعدادات متقدمة */}
        {عرض_قسم('إعدادات متقدمة', (
          <View style={styles.settingsGroup}>
            {عرض_عنصر_إعداد(
              'إعادة تعيين الإعدادات',
              'إعادة جميع الإعدادات إلى القيم الافتراضية',
              'refresh',
              <Ionicons name="chevron-back" size={20} color="#C7C7CC" />,
              تأكيد_إعادة_تعيين_الإعدادات
            )}
            {عرض_عنصر_إعداد(
              'مسح جميع البيانات',
              'حذف جميع الرحلات والمصاريف والمستخدمين',
              'trash',
              <Ionicons name="chevron-back" size={20} color="#FF3B30" />,
              تأكيد_مسح_البيانات
            )}
          </View>
        ))}

        {/* معلومات التطبيق */}
        {عرض_قسم('حول التطبيق', (
          <View style={[styles.aboutCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
            <ThemedText type="large" style={styles.appName}>
              رحلة - REHLAH
            </ThemedText>
            <ThemedText type="caption" style={styles.appVersion}>
              الإصدار 1.0.0
            </ThemedText>
            <ThemedText type="caption" style={styles.appDescription}>
              تطبيق لإدارة المصاريف المشتركة في الرحلات والأنشطة الجماعية
            </ThemedText>
          </View>
        ))}
      </ScrollView>

      {/* نافذة اختيار العملة */}
      <Modal
        visible={عرض_اختيار_العملة}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => تعيين_عرض_اختيار_العملة(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <TouchableOpacity
              onPress={() => تعيين_عرض_اختيار_العملة(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              اختيار العملة
            </ThemedText>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {العملات_المدعومة.map((عملة) => (
              <TouchableOpacity
                key={عملة.الرمز}
                style={[
                  styles.currencyItem,
                  { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' },
                  الإعدادات.العملة_الافتراضية === عملة.الرمز && styles.selectedCurrency
                ]}
                onPress={() => {
                  dispatch(تعيين_العملة_الافتراضية(عملة.الرمز));
                  تعيين_عرض_اختيار_العملة(false);
                }}
              >
                <View style={styles.currencyInfo}>
                  <ThemedText type="default" style={styles.currencySymbol}>
                    {عملة.الرمز}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.currencyName}>
                    {عملة.الاسم}
                  </ThemedText>
                </View>
                {الإعدادات.العملة_الافتراضية === عملة.الرمز && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
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
    marginBottom: 12,
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingDescription: {
    opacity: 0.7,
  },
  settingControl: {
    marginRight: 4,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  appVersion: {
    marginBottom: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  appDescription: {
    textAlign: 'center',
    opacity: 0.7,
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCurrency: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  currencyInfo: {
    flex: 1,
  },
  currencySymbol: {
    marginBottom: 2,
  },
  currencyName: {
    opacity: 0.7,
  },
});

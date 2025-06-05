import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { إضافة_مستخدم, تحديث_مستخدم, حذف_مستخدم } from '@/store/slices/مستخدمينSlice';
import { useColorScheme } from '@/hooks/useColorScheme';
import { توليد_معرف } from '@/utils/helpers';

const الصور_الرمزية_الافتراضية = [
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️',
  '👨‍🔧', '👩‍🔧', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨',
  '👨‍💻', '👩‍💻', '👨‍🚀', '👩‍🚀', '🧑‍🎤', '👩‍🎤',
  '👨‍🏫', '👩‍🏫', '👨‍🌾', '👩‍🌾', '👨‍⚖️', '👩‍⚖️'
];

export default function شاشة_إدارة_المستخدمين() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);

  const [عرض_نافذة_الإضافة, تعيين_عرض_نافذة_الإضافة] = useState(false);
  const [عرض_اختيار_الصورة, تعيين_عرض_اختيار_الصورة] = useState(false);
  const [المستخدم_المحرر, تعيين_المستخدم_المحرر] = useState<any>(null);
  const [اسم_المستخدم, تعيين_اسم_المستخدم] = useState('');
  const [الصورة_المختارة, تعيين_الصورة_المختارة] = useState('👤');

  const isDark = colorScheme === 'dark';

  const إعادة_تعيين_النموذج = () => {
    تعيين_اسم_المستخدم('');
    تعيين_الصورة_المختارة('👤');
    تعيين_المستخدم_المحرر(null);
  };

  const فتح_نافذة_إضافة_مستخدم = () => {
    إعادة_تعيين_النموذج();
    تعيين_عرض_نافذة_الإضافة(true);
  };

  const فتح_نافذة_تعديل_مستخدم = (مستخدم: any) => {
    تعيين_المستخدم_المحرر(مستخدم);
    تعيين_اسم_المستخدم(مستخدم.الاسم);
    تعيين_الصورة_المختارة(مستخدم.الصورة_الرمزية || '👤');
    تعيين_عرض_نافذة_الإضافة(true);
  };

  const حفظ_المستخدم = () => {
    if (!اسم_المستخدم.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم');
      return;
    }

    if (المستخدم_المحرر) {
      // تحديث مستخدم موجود
      const مستخدم_محدث = {
        ...المستخدم_المحرر,
        الاسم: اسم_المستخدم.trim(),
        الصورة_الرمزية: الصورة_المختارة,
      };
      dispatch(تحديث_مستخدم(مستخدم_محدث));
      Alert.alert('نجح', 'تم تحديث المستخدم بنجاح');
    } else {
      // إضافة مستخدم جديد
      const مستخدم_جديد = {
        id: توليد_معرف(),
        الاسم: اسم_المستخدم.trim(),
        الصورة_الرمزية: الصورة_المختارة,
        تاريخ_الإنشاء: new Date().toISOString(),
      };
      dispatch(إضافة_مستخدم(مستخدم_جديد));
      Alert.alert('نجح', 'تم إضافة المستخدم بنجاح');
    }

    تعيين_عرض_نافذة_الإضافة(false);
    إعادة_تعيين_النموذج();
  };

  const حذف_مستخدم_مع_التأكيد = (مستخدم: any) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من رغبتك في حذف ${مستخدم.الاسم}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            dispatch(حذف_مستخدم(مستخدم.id));
            Alert.alert('تم الحذف', 'تم حذف المستخدم بنجاح');
          },
        },
      ]
    );
  };

  const اختيار_صورة_من_المعرض = async () => {
    try {
      const نتيجة = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!نتيجة.canceled && نتيجة.assets[0]) {
        تعيين_الصورة_المختارة(نتيجة.assets[0].uri);
        تعيين_عرض_اختيار_الصورة(false);
      }
    } catch (خطأ) {
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const التقاط_صورة_بالكاميرا = async () => {
    try {
      const نتيجة = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!نتيجة.canceled && نتيجة.assets[0]) {
        تعيين_الصورة_المختارة(نتيجة.assets[0].uri);
        تعيين_عرض_اختيار_الصورة(false);
      }
    } catch (خطأ) {
      Alert.alert('خطأ', 'فشل في التقاط الصورة');
    }
  };

  const عرض_بطاقة_مستخدم = (مستخدم: any) => (
    <View
      key={مستخدم.id}
      style={[styles.userCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
    >
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          {مستخدم.الصورة_الرمزية?.startsWith('http') || مستخدم.الصورة_الرمزية?.startsWith('file') ? (
            <Image 
              source={{ uri: مستخدم.الصورة_الرمزية }} 
              style={styles.avatarImage}
            />
          ) : (
            <ThemedText style={styles.avatarText}>
              {مستخدم.الصورة_الرمزية || '👤'}
            </ThemedText>
          )}
        </View>
        <View style={styles.userDetails}>
          <ThemedText type="defaultSemiBold" style={styles.userName}>
            {مستخدم.الاسم}
          </ThemedText>
          <ThemedText type="caption" style={styles.userDate}>
            أضيف في {new Date(مستخدم.تاريخ_الإنشاء).toLocaleDateString('ar-EG')}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => فتح_نافذة_تعديل_مستخدم(مستخدم)}
        >
          <Ionicons name="create" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => حذف_مستخدم_مع_التأكيد(مستخدم)}
        >
          <Ionicons name="trash" size={16} color="white" />
        </TouchableOpacity>
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
        <ThemedText type="subtitle" style={styles.headerTitle}>
          إدارة المشاركين
        </ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={فتح_نافذة_إضافة_مستخدم}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {المستخدمين.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color={isDark ? '#666' : '#CCC'} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              لا يوجد مشاركون بعد
            </ThemedText>
            <ThemedText type="caption" style={styles.emptyDescription}>
              أضف مشاركين جدد لبدء تتبع المصاريف معهم
            </ThemedText>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#007AFF' }]}
              onPress={فتح_نافذة_إضافة_مستخدم}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                إضافة مشارك جديد
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.usersContainer}>
            <ThemedText type="caption" style={styles.usersCount}>
              {المستخدمين.length} مشارك
            </ThemedText>
            {المستخدمين.map(عرض_بطاقة_مستخدم)}
          </View>
        )}
      </ScrollView>

      {/* نافذة إضافة/تعديل مستخدم */}
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
              {المستخدم_المحرر ? 'تعديل مشارك' : 'إضافة مشارك جديد'}
            </ThemedText>
            <TouchableOpacity
              onPress={حفظ_المستخدم}
              style={styles.modalSaveButton}
            >
              <ThemedText style={[styles.modalSaveText, { color: '#007AFF' }]}>
                حفظ
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* اختيار الصورة */}
            <View style={styles.avatarSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                الصورة الشخصية
              </ThemedText>
              <TouchableOpacity
                style={styles.avatarSelector}
                onPress={() => تعيين_عرض_اختيار_الصورة(true)}
              >
                <View style={[styles.selectedAvatar, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}>
                  {الصورة_المختارة?.startsWith('http') || الصورة_المختارة?.startsWith('file') ? (
                    <Image 
                      source={{ uri: الصورة_المختارة }} 
                      style={styles.selectedAvatarImage}
                    />
                  ) : (
                    <ThemedText style={styles.selectedAvatarText}>
                      {الصورة_المختارة}
                    </ThemedText>
                  )}
                </View>
                <ThemedText type="caption" style={styles.avatarHint}>
                  اضغط لتغيير الصورة
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* إدخال الاسم */}
            <View style={styles.nameSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                الاسم *
              </ThemedText>
              <TextInput
                style={[
                  styles.nameInput,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#666' : '#CCC'
                  }
                ]}
                value={اسم_المستخدم}
                onChangeText={تعيين_اسم_المستخدم}
                placeholder="مثال: أحمد محمد"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* نافذة اختيار الصورة */}
      <Modal
        visible={عرض_اختيار_الصورة}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => تعيين_عرض_اختيار_الصورة(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <TouchableOpacity
              onPress={() => تعيين_عرض_اختيار_الصورة(false)}
              style={styles.modalCloseButton}
            >
              <ThemedText style={[styles.modalCloseText, { color: '#007AFF' }]}>
                إلغاء
              </ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              اختيار الصورة
            </ThemedText>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* خيارات الصورة */}
            <View style={styles.imageOptionsSection}>
              <TouchableOpacity
                style={[styles.imageOption, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={اختيار_صورة_من_المعرض}
              >
                <Ionicons name="images" size={24} color="#007AFF" />
                <ThemedText type="default" style={styles.imageOptionText}>
                  اختيار من المعرض
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.imageOption, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={التقاط_صورة_بالكاميرا}
              >
                <Ionicons name="camera" size={24} color="#007AFF" />
                <ThemedText type="default" style={styles.imageOptionText}>
                  التقاط صورة
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* الصور الرمزية الافتراضية */}
            <View style={styles.defaultAvatarsSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                أو اختر رمز تعبيري
              </ThemedText>
              <View style={styles.avatarsGrid}>
                {الصور_الرمزية_الافتراضية.map((رمز, فهرس) => (
                  <TouchableOpacity
                    key={فهرس}
                    style={[
                      styles.avatarOption,
                      { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' },
                      الصورة_المختارة === رمز && { borderColor: '#007AFF', borderWidth: 2 }
                    ]}
                    onPress={() => {
                      تعيين_الصورة_المختارة(رمز);
                      تعيين_عرض_اختيار_الصورة(false);
                    }}
                  >
                    <ThemedText style={styles.avatarOptionText}>
                      {رمز}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  usersContainer: {
    gap: 12,
  },
  usersCount: {
    marginBottom: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userDate: {
    opacity: 0.7,
  },
  userActions: {
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarSelector: {
    alignItems: 'center',
  },
  selectedAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  selectedAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  selectedAvatarText: {
    fontSize: 48,
  },
  avatarHint: {
    opacity: 0.7,
    textAlign: 'center',
  },
  nameSection: {
    marginBottom: 24,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  imageOptionsSection: {
    marginBottom: 24,
    gap: 12,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageOptionText: {
    flex: 1,
  },
  defaultAvatarsSection: {
    marginBottom: 24,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarOptionText: {
    fontSize: 28,
  },
});

import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { مستخدم } from '@/types';

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  onAddParticipant: (userId: string, amount: number) => void;
  existingParticipants: string[];
  users: مستخدم[];
  currency: string;
  isDark: boolean;
}

export default function AddParticipantModal({
  visible,
  onClose,
  onAddParticipant,
  existingParticipants,
  users,
  currency,
  isDark
}: AddParticipantModalProps) {
  const [مستخدم_محدد, تعيين_مستخدم_محدد] = useState<string>('');
  const [مبلغ_مستحق, تعيين_مبلغ_مستحق] = useState('0');

  // المستخدمون المتاحون للإضافة (غير مشاركين بالفعل)
  const مستخدمون_متاحون = users.filter(user => !existingParticipants.includes(user.id));

  const إضافة_مشارك = () => {
    if (!مستخدم_محدد) {
      Alert.alert('خطأ', 'يرجى اختيار مشارك');
      return;
    }

    const مبلغ = parseFloat(مبلغ_مستحق) || 0;
    if (مبلغ < 0) {
      Alert.alert('خطأ', 'المبلغ لا يمكن أن يكون سالباً');
      return;
    }

    onAddParticipant(مستخدم_محدد, مبلغ);
    
    // إعادة تعيين القيم
    تعيين_مستخدم_محدد('');
    تعيين_مبلغ_مستحق('0');
  };

  const إلغاء = () => {
    تعيين_مستخدم_محدد('');
    تعيين_مبلغ_مستحق('0');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        {/* الرأس */}
        <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={إلغاء}>
            <ThemedText style={styles.cancelText}>إلغاء</ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="subtitle" style={styles.headerTitle}>
            إضافة مشارك
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#007AFF' }]} 
            onPress={إضافة_مشارك}
          >
            <ThemedText style={[styles.addText, { color: 'white' }]}>إضافة</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {مستخدمون_متاحون.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color={isDark ? '#666' : '#CCC'} />
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                لا يوجد مستخدمون متاحون
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtitle}>
                جميع المستخدمين مشاركون بالفعل في هذه الرحلة
              </ThemedText>
            </View>
          ) : (
            <>
              {/* اختيار المستخدم */}
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  اختر المشارك
                </ThemedText>
                
                <View style={styles.usersContainer}>
                  {مستخدمون_متاحون.map(user => (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userCard,
                        { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
                        مستخدم_محدد === user.id && { 
                          backgroundColor: '#007AFF', 
                          borderColor: '#007AFF' 
                        }
                      ]}
                      onPress={() => تعيين_مستخدم_محدد(user.id)}
                    >
                      <View style={styles.userAvatar}>
                        <ThemedText style={[
                          styles.avatarText,
                          مستخدم_محدد === user.id && { color: 'white' }
                        ]}>
                          {user.الصورة_الرمزية || '👤'}
                        </ThemedText>
                      </View>
                      
                      <ThemedText 
                        type="default" 
                        style={[
                          styles.userName,
                          مستخدم_محدد === user.id && { color: 'white' }
                        ]}
                      >
                        {user.الاسم}
                      </ThemedText>
                      
                      {مستخدم_محدد === user.id && (
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* تحديد المبلغ المستحق */}
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  المبلغ المستحق
                </ThemedText>
                
                <View style={styles.amountContainer}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                        color: isDark ? '#FFFFFF' : '#000000',
                        borderColor: isDark ? '#666' : '#CCC'
                      }
                    ]}
                    value={مبلغ_مستحق}
                    onChangeText={تعيين_مبلغ_مستحق}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                  <ThemedText type="caption" style={styles.currencyLabel}>
                    {currency}
                  </ThemedText>
                </View>
                
                <ThemedText type="caption" style={styles.amountDescription}>
                  المبلغ الذي يجب على هذا المشارك دفعه للرحلة
                </ThemedText>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
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
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  usersContainer: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userAvatar: {
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
  userName: {
    flex: 1,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  amountDescription: {
    opacity: 0.7,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

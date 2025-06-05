import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAppSelector } from '@/store/hooks';
import { formatAmount } from '@/utils/helpers';
import { رحلة, مستخدم, ملخص_الرحلة } from '@/types';

interface ParticipantCardProps {
  participant: مستخدم;
  trip: رحلة;
  summary: ملخص_الرحلة;
  isDark: boolean;
  onRemove: () => void;
  onUpdateAmount: (amount: number) => void;
}

export default function ParticipantCard({ 
  participant, 
  trip, 
  summary, 
  isDark, 
  onRemove,
  onUpdateAmount 
}: ParticipantCardProps) {
  const { المشتريات } = useAppSelector(state => state.مشتريات);
  const [تحرير_المبلغ, تعيين_تحرير_المبلغ] = useState(false);
  const [مبلغ_مؤقت, تعيين_مبلغ_مؤقت] = useState('');

  const رصيد_المستخدم = summary.أرصدة_المستخدمين.find(ر => ر.معرف_المستخدم === participant.id);
  const المبلغ_المستحق_الفردي = trip.المبالغ_المستحقة_الفردية?.[participant.id] || 0;
  const المدفوع = رصيد_المستخدم?.إجمالي_المدفوع || 0;
  const النصيب = رصيد_المستخدم?.إجمالي_النصيب || 0;
  const الرصيد_الصافي = رصيد_المستخدم?.الرصيد_الصافي || 0;

  // حساب المشتريات الفردية
  const مشتريات_المستخدم = المشتريات.filter(
    م => م.معرف_الرحلة === trip.id && م.معرف_المستخدم === participant.id
  );
  const إجمالي_المشتريات = مشتريات_المستخدم.reduce((مجموع, م) => مجموع + م.المبلغ, 0);
  const المبلغ_المتبقي = المبلغ_المستحق_الفردي - إجمالي_المشتريات;

  const بدء_تحرير_المبلغ = () => {
    تعيين_مبلغ_مؤقت(المبلغ_المستحق_الفردي.toString());
    تعيين_تحرير_المبلغ(true);
  };

  const حفظ_المبلغ = () => {
    const مبلغ_جديد = parseFloat(مبلغ_مؤقت) || 0;
    if (مبلغ_جديد < 0) {
      Alert.alert('خطأ', 'المبلغ لا يمكن أن يكون سالباً');
      return;
    }
    onUpdateAmount(مبلغ_جديد);
    تعيين_تحرير_المبلغ(false);
  };

  const إلغاء_تحرير_المبلغ = () => {
    تعيين_تحرير_المبلغ(false);
    تعيين_مبلغ_مؤقت('');
  };

  return (
    <View style={[styles.participantCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
      <View style={styles.participantHeader}>
        <View style={styles.participantInfo}>
          <View style={styles.participantAvatar}>
            <ThemedText style={styles.avatarText}>
              {participant.الصورة_الرمزية || '👤'}
            </ThemedText>
          </View>
          
          <View style={styles.participantDetails}>
            <ThemedText type="defaultSemiBold" style={styles.participantName}>
              {participant.الاسم}
            </ThemedText>
            <View style={styles.balanceInfo}>
              <ThemedText 
                type="caption" 
                style={[
                  styles.balanceText,
                  { color: الرصيد_الصافي >= 0 ? '#34C759' : '#FF3B30' }
                ]}
              >
                {الرصيد_الصافي >= 0 ? 'له' : 'عليه'}: {formatAmount(Math.abs(الرصيد_الصافي), trip.العملة)}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.participantActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => router.push(`/individual-purchases?tripId=${trip.id}&userId=${participant.id}`)}
          >
            <Ionicons name="bag" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
            onPress={بدء_تحرير_المبلغ}
          >
            <Ionicons name="create" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={onRemove}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.participantDetails}>
        <View style={styles.detailRow}>
          <ThemedText type="caption" style={styles.detailLabel}>
            المبلغ المستحق:
          </ThemedText>
          {تحرير_المبلغ ? (
            <View style={styles.editAmountContainer}>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}
                value={مبلغ_مؤقت}
                onChangeText={تعيين_مبلغ_مؤقت}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isDark ? '#666' : '#999'}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#34C759' }]}
                onPress={حفظ_المبلغ}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: '#FF3B30' }]}
                onPress={إلغاء_تحرير_المبلغ}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <ThemedText type="caption" style={styles.detailValue}>
              {formatAmount(المبلغ_المستحق_الفردي, trip.العملة)}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText type="caption" style={styles.detailLabel}>
            إجمالي المدفوع:
          </ThemedText>
          <ThemedText type="caption" style={styles.detailValue}>
            {formatAmount(المدفوع, trip.العملة)}
          </ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText type="caption" style={styles.detailLabel}>
            نصيبه من المصاريف:
          </ThemedText>
          <ThemedText type="caption" style={styles.detailValue}>
            {formatAmount(النصيب, trip.العملة)}
          </ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText type="caption" style={styles.detailLabel}>
            المشتريات الفردية:
          </ThemedText>
          <ThemedText type="caption" style={styles.detailValue}>
            {formatAmount(إجمالي_المشتريات, trip.العملة)}
          </ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText type="caption" style={styles.detailLabel}>
            المبلغ المتبقي:
          </ThemedText>
          <ThemedText 
            type="caption" 
            style={[
              styles.detailValue,
              { color: المبلغ_المتبقي >= 0 ? '#34C759' : '#FF3B30' }
            ]}
          >
            {formatAmount(المبلغ_المتبقي, trip.العملة)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  editAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInput: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  saveButton: {
    padding: 4,
    borderRadius: 4,
  },
  cancelButton: {
    padding: 4,
    borderRadius: 4,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { formatAmount } from '@/utils/helpers';

interface TotalAmountDueCardProps {
  totalAmountDue: number;
  currency: string;
  isDark: boolean;
}

export default function TotalAmountDueCard({ totalAmountDue, currency, isDark }: TotalAmountDueCardProps) {
  return (
    <View style={[styles.totalAmountCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
      <View style={styles.cardHeader}>
        <Ionicons name="cash" size={24} color="#007AFF" />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          إجمالي المبلغ المستحق من جميع المشاركين
        </ThemedText>
      </View>
      
      <View style={styles.amountContainer}>
        <ThemedText type="title" style={[styles.totalAmount, { color: '#007AFF' }]}>
          {formatAmount(totalAmountDue, currency)}
        </ThemedText>
        <ThemedText type="caption" style={styles.amountDescription}>
          المبلغ الإجمالي المطلوب من جميع المشاركين
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  totalAmountCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountDescription: {
    opacity: 0.7,
    textAlign: 'center',
  },
});

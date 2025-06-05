import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { formatAmount, تنسيق_التاريخ } from '@/utils/helpers';
import { رحلة, مصروف } from '@/types';

interface ExpensesSectionProps {
  trip: رحلة;
  expenses: مصروف[];
  isDark: boolean;
  onAddExpense: () => void;
}

export default function ExpensesSection({ trip, expenses, isDark, onAddExpense }: ExpensesSectionProps) {
  const عرض_مصروف = (مصروف: مصروف) => (
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
            {formatAmount(مصروف.المبلغ, trip.العملة)}
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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          المصاريف ({expenses.length})
        </ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#007AFF' }]}
          onPress={onAddExpense}
        >
          <Ionicons name="add" size={20} color="white" />
          <ThemedText style={[styles.addButtonText, { color: 'white' }]}>
            إضافة مصروف
          </ThemedText>
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
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
          {expenses.map(عرض_مصروف)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
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
});

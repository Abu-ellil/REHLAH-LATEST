import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { formatAmount } from '@/utils/helpers';
import { تسوية, مستخدم } from '@/types';

interface SettlementsSectionProps {
  settlements: تسوية[];
  users: مستخدم[];
  currency: string;
  isDark: boolean;
}

export default function SettlementsSection({ settlements, users, currency, isDark }: SettlementsSectionProps) {
  if (settlements.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        التسويات المطلوبة
      </ThemedText>
      
      <View style={[styles.settlementsCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
        {settlements.map((تسوية, فهرس) => {
          const من = users.find(م => م.id === تسوية.من);
          const إلى = users.find(م => م.id === تسوية.إلى);

          return (
            <View 
              key={فهرس} 
              style={[
                styles.settlementRow,
                فهرس < settlements.length - 1 && styles.settlementRowBorder
              ]}
            >
              <View style={styles.settlementInfo}>
                <ThemedText type="default" style={styles.settlementText}>
                  {من?.الاسم} يدفع لـ {إلى?.الاسم}
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={styles.settlementAmount}>
                {formatAmount(تسوية.المبلغ, currency)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
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
  },
  settlementRowBorder: {
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
});

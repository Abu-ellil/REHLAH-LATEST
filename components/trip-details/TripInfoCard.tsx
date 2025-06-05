import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { formatAmount, تنسيق_التاريخ } from '@/utils/helpers';
import { رحلة, ملخص_الرحلة } from '@/types';

interface TripInfoCardProps {
  trip: رحلة;
  summary: ملخص_الرحلة;
  participantsCount: number;
  isDark: boolean;
}

export default function TripInfoCard({ trip, summary, participantsCount, isDark }: TripInfoCardProps) {
  return (
    <View style={[styles.tripInfoCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
      <ThemedText type="title" style={styles.tripTitle}>
        {trip.الاسم}
      </ThemedText>
      
      {trip.الوصف && (
        <ThemedText type="default" style={styles.tripDescription}>
          {trip.الوصف}
        </ThemedText>
      )}

      <View style={styles.tripMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <ThemedText type="caption" style={styles.metaText}>
            {تنسيق_التاريخ(trip.تاريخ_البداية)}
            {trip.تاريخ_النهاية && ` - ${تنسيق_التاريخ(trip.تاريخ_النهاية)}`}
          </ThemedText>
        </View>
        
        <View style={styles.metaRow}>
          <Ionicons name="people" size={16} color="#666" />
          <ThemedText type="caption" style={styles.metaText}>
            {participantsCount} مشارك
          </ThemedText>
        </View>
        
        <View style={styles.metaRow}>
          <Ionicons name="wallet" size={16} color="#666" />
          <ThemedText type="caption" style={styles.metaText}>
            إجمالي المصاريف: {formatAmount(summary.إجمالي_المصاريف, trip.العملة)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

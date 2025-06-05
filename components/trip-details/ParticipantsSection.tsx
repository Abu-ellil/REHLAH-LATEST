import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { رحلة, مستخدم, ملخص_الرحلة } from '@/types';
import ParticipantCard from './ParticipantCard';

interface ParticipantsSectionProps {
  trip: رحلة;
  participants: مستخدم[];
  summary: ملخص_الرحلة;
  isDark: boolean;
  onAddParticipant: () => void;
  onRemoveParticipant: (userId: string) => void;
  onUpdateAmount: (userId: string, amount: number) => void;
}

export default function ParticipantsSection({ 
  trip, 
  participants, 
  summary, 
  isDark, 
  onAddParticipant, 
  onRemoveParticipant,
  onUpdateAmount 
}: ParticipantsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          المشاركون ({participants.length})
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#34C759' }]}
          onPress={onAddParticipant}
        >
          <Ionicons name="person-add" size={20} color="white" />
          <ThemedText style={[styles.addButtonText, { color: 'white' }]}>
            إضافة مشارك
          </ThemedText>
        </TouchableOpacity>
      </View>

      {participants.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color={isDark ? '#666' : '#CCC'} />
          <ThemedText type="caption" style={styles.emptyText}>
            لا يوجد مشاركون بعد
          </ThemedText>
          <ThemedText type="caption" style={styles.emptySubtext}>
            اضغط على "إضافة مشارك" لبدء إضافة المشاركين
          </ThemedText>
        </View>
      ) : (
        <View style={styles.participantsContainer}>
          {participants.map(participant => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              trip={trip}
              summary={summary}
              isDark={isDark}
              onRemove={() => onRemoveParticipant(participant.id)}
              onUpdateAmount={(amount) => onUpdateAmount(participant.id, amount)}
            />
          ))}
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
  participantsContainer: {
    gap: 12,
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

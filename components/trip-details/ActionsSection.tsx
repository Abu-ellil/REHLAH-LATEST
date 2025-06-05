import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface ActionsSectionProps {
  tripId: string;
  isDark: boolean;
}

export default function ActionsSection({ tripId, isDark }: ActionsSectionProps) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
        onPress={() => router.push(`/edit-trip?tripId=${tripId}`)}
      >
        <Ionicons name="create" size={20} color="white" />
        <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
          تعديل الرحلة
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#34C759' }]}
        onPress={() => router.push(`/trip-analytics?tripId=${tripId}`)}
      >
        <Ionicons name="analytics" size={20} color="white" />
        <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
          التحليلات
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

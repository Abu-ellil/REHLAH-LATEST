import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface TripHeaderProps {
  isDark: boolean;
  onBack: () => void;
  onDelete: () => void;
}

export default function TripHeader({ isDark, onBack, onDelete }: TripHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-forward" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
      
      <ThemedText type="subtitle" style={styles.headerTitle}>
        تفاصيل الرحلة
      </ThemedText>
      
      <TouchableOpacity style={styles.menuButton} onPress={onDelete}>
        <Ionicons name="trash" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 8,
  },
});

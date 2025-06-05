import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const LoadingScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ActivityIndicator 
        size="large" 
        color={isDark ? '#fff' : '#007AFF'} 
        style={styles.spinner}
      />
      <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
        جاري التحميل...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Almarai-Regular',
    textAlign: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { تحديد_رحلة } from '@/store/slices/رحلاتSlice';
import { formatAmount, تنسيق_التاريخ } from '@/utils/helpers';

export default function الشاشة_الرئيسية() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const { الرحلات, جاري_التحميل } = useAppSelector(state => state.رحلات);
  const { المصاريف } = useAppSelector(state => state.مصاريف);
  const { الإعدادات } = useAppSelector(state => state.إعدادات);

  const isDark = colorScheme === 'dark';

  const إضافة_رحلة_جديدة = () => {
    router.push('/add-trip');
  };

  const فتح_تفاصيل_الرحلة = (معرف_الرحلة: string) => {
    dispatch(تحديد_رحلة(معرف_الرحلة));
    router.push(`/trip-details?tripId=${معرف_الرحلة}`);
  };

  const حساب_إجمالي_مصاريف_الرحلة = (معرف_الرحلة: string) => {
    const مصاريف_الرحلة = المصاريف.filter(م => م.معرف_الرحلة === معرف_الرحلة);
    return مصاريف_الرحلة.reduce((مجموع, مصروف) => مجموع + مصروف.المبلغ, 0);
  };

  const عرض_بطاقة_رحلة = (رحلة: any) => {
    const إجمالي_المصاريف = حساب_إجمالي_مصاريف_الرحلة(رحلة.id);
    const عدد_المشاركين = رحلة.المشاركون.length;

    return (
      <TouchableOpacity
        key={رحلة.id}
        style={[styles.tripCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}
        onPress={() => فتح_تفاصيل_الرحلة(رحلة.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <ThemedText type="subtitle" style={styles.tripTitle}>
            {رحلة.الاسم}
          </ThemedText>
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <ThemedText type="caption" style={styles.infoText}>
              {تنسيق_التاريخ(رحلة.تاريخ_البداية)}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={16} color="#666" />
            <ThemedText type="caption" style={styles.infoText}>
              {عدد_المشاركين} مشارك
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="wallet" size={16} color="#666" />
            <ThemedText type="caption" style={styles.infoText}>
              {formatAmount(إجمالي_المصاريف, الإعدادات.العملة_الافتراضية)}
            </ThemedText>
          </View>
        </View>

        {رحلة.الوصف && (
          <ThemedText type="caption" style={styles.tripDescription}>
            {رحلة.الوصف}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* الرأس */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <TouchableOpacity
          style={styles.usersButton}
          onPress={() => router.push('/manage-users')}
        >
          <Ionicons name="people" size={20} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          رحلاتي
        </ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#007AFF' }]}
          onPress={إضافة_رحلة_جديدة}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* قائمة الرحلات */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={جاري_التحميل}
            onRefresh={() => {}}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {الرحلات.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="airplane"
              size={64}
              color={isDark ? '#666' : '#CCC'}
              style={styles.emptyIcon}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              لا توجد رحلات بعد
            </ThemedText>
            <ThemedText type="caption" style={styles.emptyDescription}>
              ابدأ بإضافة رحلتك الأولى لتتبع المصاريف مع الأصدقاء
            </ThemedText>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#007AFF' }]}
              onPress={إضافة_رحلة_جديدة}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                إضافة رحلة جديدة
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {الرحلات.map(عرض_بطاقة_رحلة)}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    flex: 1,
  },
  usersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  tripsContainer: {
    gap: 16,
  },
  tripCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripTitle: {
    flex: 1,
  },
  tripInfo: {
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  tripDescription: {
    marginTop: 8,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Almarai-Bold',
    textAlign: 'center',
  },
});

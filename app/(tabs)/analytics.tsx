import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppSelector } from '@/store/hooks';
import { حساب_النسبة_المئوية } from '@/utils/calculations';
import { formatAmount, ألوان_الفئات, أيقونات_الفئات } from '@/utils/helpers';

const { width } = Dimensions.get('window');

export default function شاشة_التحليلات() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { الرحلات } = useAppSelector(state => state.رحلات);
  const { المصاريف } = useAppSelector(state => state.مصاريف);
  const { المستخدمين } = useAppSelector(state => state.مستخدمين);
  const { الإعدادات } = useAppSelector(state => state.إعدادات);

  // حساب الإحصائيات العامة
  const إجمالي_المصاريف = المصاريف.reduce((مجموع, مصروف) => مجموع + مصروف.المبلغ, 0);
  const عدد_الرحلات = الرحلات.length;
  const متوسط_المصاريف_للرحلة = عدد_الرحلات > 0 ? إجمالي_المصاريف / عدد_الرحلات : 0;

  // حساب توزيع الفئات
  const توزيع_الفئات: { [فئة: string]: number } = {};
  المصاريف.forEach(مصروف => {
    توزيع_الفئات[مصروف.الفئة] = (توزيع_الفئات[مصروف.الفئة] || 0) + مصروف.المبلغ;
  });

  // حساب أكثر المستخدمين إنفاقاً
  const إنفاق_المستخدمين: { [معرف: string]: number } = {};
  المصاريف.forEach(مصروف => {
    Object.entries(مصروف.مبالغ_الدفع).forEach(([معرف_المستخدم, المبلغ]) => {
      إنفاق_المستخدمين[معرف_المستخدم] = (إنفاق_المستخدمين[معرف_المستخدم] || 0) + المبلغ;
    });
  });

  const أكثر_المستخدمين_إنفاقاً = Object.entries(إنفاق_المستخدمين)
    .sort(([, أ], [, ب]) => ب - أ)
    .slice(0, 5);

  const عرض_بطاقة_إحصائية = (العنوان: string, القيمة: string, الأيقونة: string, اللون: string) => (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
      <View style={[styles.statIcon, { backgroundColor: اللون }]}>
        <Ionicons name={الأيقونة as any} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <ThemedText type="caption" style={styles.statTitle}>
          {العنوان}
        </ThemedText>
        <ThemedText type="large" style={styles.statValue}>
          {القيمة}
        </ThemedText>
      </View>
    </View>
  );

  const عرض_فئة_مصروف = (فئة: string, مبلغ: number) => {
    const النسبة = حساب_النسبة_المئوية(مبلغ, إجمالي_المصاريف);
    const اللون = ألوان_الفئات[فئة as keyof typeof ألوان_الفئات] || '#95A5A6';
    const الأيقونة = أيقونات_الفئات[فئة as keyof typeof أيقونات_الفئات] || '📝';

    return (
      <View key={فئة} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryIcon}>{الأيقونة}</Text>
            <ThemedText type="default" style={styles.categoryName}>
              {فئة}
            </ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={styles.categoryAmount}>
            {formatAmount(مبلغ, الإعدادات.العملة_الافتراضية)}
          </ThemedText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${النسبة}%`,
                backgroundColor: اللون
              }
            ]}
          />
        </View>
        <ThemedText type="caption" style={styles.categoryPercentage}>
          {النسبة}%
        </ThemedText>
      </View>
    );
  };

  const عرض_مستخدم_منفق = (معرف_المستخدم: string, المبلغ: number, الترتيب: number) => {
    const المستخدم = المستخدمين.find(م => م.id === معرف_المستخدم);
    const الاسم = المستخدم?.الاسم || 'مستخدم غير معروف';
    const النسبة = حساب_النسبة_المئوية(المبلغ, إجمالي_المصاريف);

    return (
      <View key={معرف_المستخدم} style={styles.userItem}>
        <View style={styles.userRank}>
          <ThemedText type="defaultSemiBold" style={styles.rankNumber}>
            {الترتيب + 1}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText type="default" style={styles.userName}>
            {الاسم}
          </ThemedText>
          <ThemedText type="caption" style={styles.userPercentage}>
            {النسبة}% من إجمالي المصاريف
          </ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.userAmount}>
          {formatAmount(المبلغ, الإعدادات.العملة_الافتراضية)}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* الرأس */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          التحليلات والإحصائيات
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* الإحصائيات العامة */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            الإحصائيات العامة
          </ThemedText>
          <View style={styles.statsGrid}>
            {عرض_بطاقة_إحصائية(
              'إجمالي المصاريف',
              formatAmount(إجمالي_المصاريف, الإعدادات.العملة_الافتراضية),
              'wallet',
              '#007AFF'
            )}
            {عرض_بطاقة_إحصائية(
              'عدد الرحلات',
              عدد_الرحلات.toString(),
              'airplane',
              '#34C759'
            )}
            {عرض_بطاقة_إحصائية(
              'متوسط المصاريف',
              formatAmount(متوسط_المصاريف_للرحلة, الإعدادات.العملة_الافتراضية),
              'analytics',
              '#FF9500'
            )}
            {عرض_بطاقة_إحصائية(
              'عدد المصاريف',
              المصاريف.length.toString(),
              'receipt',
              '#AF52DE'
            )}
          </View>
        </View>

        {/* توزيع الفئات */}
        {Object.keys(توزيع_الفئات).length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              توزيع المصاريف حسب الفئة
            </ThemedText>
            <View style={[styles.card, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              {Object.entries(توزيع_الفئات)
                .sort(([, أ], [, ب]) => ب - أ)
                .map(([فئة, مبلغ]) => عرض_فئة_مصروف(فئة, مبلغ))}
            </View>
          </View>
        )}

        {/* أكثر المستخدمين إنفاقاً */}
        {أكثر_المستخدمين_إنفاقاً.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              أكثر المستخدمين إنفاقاً
            </ThemedText>
            <View style={[styles.card, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
              {أكثر_المستخدمين_إنفاقاً.map(([معرف_المستخدم, المبلغ], فهرس) =>
                عرض_مستخدم_منفق(معرف_المستخدم, المبلغ, فهرس)
              )}
            </View>
          </View>
        )}

        {/* رسالة فارغة */}
        {المصاريف.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="analytics"
              size={64}
              color={isDark ? '#666' : '#CCC'}
              style={styles.emptyIcon}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              لا توجد بيانات للتحليل
            </ThemedText>
            <ThemedText type="caption" style={styles.emptyDescription}>
              أضف بعض المصاريف لرؤية التحليلات والإحصائيات
            </ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Almarai-Bold',
  },
  card: {
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
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  categoryName: {
    flex: 1,
  },
  categoryAmount: {
    marginRight: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    textAlign: 'left',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  rankNumber: {
    color: 'white',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userPercentage: {
    opacity: 0.7,
  },
  userAmount: {
    textAlign: 'left',
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
    paddingHorizontal: 40,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BarChart3, TrendingUp, TrendingDown, Calendar, ChevronRight, Award, DollarSign, ShoppingBag } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, topRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/sales-stats')
      ]);
      setSummary(sumRes.data);
      setTopProducts(topRes.data);
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics & Reports</Text>
        <TouchableOpacity style={styles.dateBtn}>
          <Calendar size={18} color="#e21b5a" />
          <Text style={styles.dateBtnText}>May 2026</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revLabel}>Total Revenue</Text>
              <Text style={styles.revValue}>${summary?.totalRevenue?.toLocaleString()}</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color="#34C759" />
              <Text style={styles.trendText}>+24%</Text>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBarContainer}>
              {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                <View key={i} style={[styles.chartBar, { height: h }, i === 5 && styles.activeBar]} />
              ))}
            </View>
            <View style={styles.chartLabels}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => <Text key={l} style={styles.chartLabelText}>{l}</Text>)}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.smallStatCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <ShoppingBag size={20} color="#4F46E5" />
            </View>
            <Text style={styles.smallStatValue}>{summary?.totalOrders}</Text>
            <Text style={styles.smallStatLabel}>Total Orders</Text>
          </View>
          <View style={styles.smallStatCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
              <Award size={20} color="#e21b5a" />
            </View>
            <Text style={styles.smallStatValue}>4.8</Text>
            <Text style={styles.smallStatLabel}>Avg Rating</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <View style={styles.topProductsList}>
          {topProducts.slice(0, 5).map((product, index) => (
            <View key={index} style={styles.topProductItem}>
              <View style={styles.rankBox}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.productName}</Text>
                <Text style={styles.productSales}>{product.totalSales} units sold</Text>
              </View>
              <Text style={styles.productRev}>${product.totalRevenue.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <BarChart3 size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>Generate PDF Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff' 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#101130' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF0F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  dateBtnText: { fontSize: 12, color: '#e21b5a', fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  revenueCard: { backgroundColor: '#101130', borderRadius: 32, padding: 24, marginBottom: 24 },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  revLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 4 },
  revValue: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(52,199,89,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendText: { color: '#34C759', fontSize: 12, fontWeight: 'bold' },
  chartPlaceholder: { marginTop: 8 },
  chartBarContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginBottom: 12 },
  chartBar: { width: 30, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  activeBar: { backgroundColor: '#e21b5a' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabelText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', width: 30, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  smallStatCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f0f0f0' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  smallStatValue: { fontSize: 20, fontWeight: 'bold', color: '#101130', marginBottom: 2 },
  smallStatLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101130', marginBottom: 16 },
  topProductsList: { backgroundColor: '#fff', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 32 },
  topProductItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  rankBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rankText: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  productDetails: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#101130', marginBottom: 2 },
  productSales: { fontSize: 11, color: '#999' },
  productRev: { fontSize: 15, fontWeight: 'bold', color: '#101130' },
  downloadBtn: { 
    backgroundColor: '#e21b5a', flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'center', gap: 10, height: 56, borderRadius: 18, marginBottom: 40 
  },
  downloadBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

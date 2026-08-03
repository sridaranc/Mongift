import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Star, TrendingUp, AlertCircle, Plus, ClipboardList,
  UserCheck, BarChart3, ChevronRight, LogOut, Bell
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../theme/Theme';
import api from '../../api/client';

export default function AdminDashboard() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/summary');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
      </View>
    </View>
  );

  const QuickAction = ({ title, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Icon size={24} color="#fff" />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.firstName || 'Admin'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={logout}>
            <LogOut size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.seeAll}>Full Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            title="Today's Orders" 
            value={stats?.totalOrders || '0'} 
            icon={ShoppingBag} 
            color="#e21b5a" 
            subValue="+12% from yesterday"
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`} 
            icon={TrendingUp} 
            color="#101130" 
          />
          <StatCard 
            title="Pending" 
            value="5" 
            icon={AlertCircle} 
            color="#f59e0b" 
            subValue="Requires action"
          />
          <StatCard 
            title="Active Users" 
            value={stats?.totalCustomers || '0'} 
            icon={Users} 
            color="#3b82f6" 
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction title="Add Product" icon={Plus} color="#e21b5a" onPress={() => navigation.navigate('AddProduct')} />
          <QuickAction title="Manage Orders" icon={ClipboardList} color="#101130" onPress={() => navigation.navigate('OrderList')} />
          <QuickAction title="Inventory" icon={Package} color="#3b82f6" onPress={() => navigation.navigate('Inventory')} />
          <QuickAction title="Customers" icon={UserCheck} color="#10b981" onPress={() => navigation.navigate('CustomerList')} />
        </View>

        <View style={styles.reviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <Star size={18} color="#f59e0b" fill="#f59e0b" />
          </View>
          <TouchableOpacity style={styles.reviewCard} onPress={() => navigation.navigate('ReviewList')}>
            <View style={styles.reviewHeader}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} color="#f59e0b" fill={s <= 4 ? "#f59e0b" : "transparent"} />)}
              </View>
              <Text style={styles.reviewTime}>2h ago</Text>
            </View>
            <Text style={styles.reviewText}>"The premium cake was delicious and delivered right on time. Great service!"</Text>
            <View style={styles.reviewFooter}>
              <Text style={styles.reviewerName}>- Sarah J.</Text>
              <ChevronRight size={16} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff',
  },
  greeting: { fontSize: 14, color: '#999', fontWeight: '500' },
  adminName: { fontSize: 20, fontWeight: 'bold', color: '#101130' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 8, backgroundColor: '#f5f5f5', rounded: 12, borderRadius: 12 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101130', marginBottom: 16 },
  seeAll: { fontSize: 12, color: '#e21b5a', fontWeight: '700', textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: { 
    width: '47.5%', backgroundColor: '#fff', padding: 16, borderRadius: 24,
    borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statTitle: { fontSize: 12, color: '#999', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#101130' },
  statSubValue: { fontSize: 10, color: '#10b981', fontWeight: '600', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  actionItem: { width: '21%', alignItems: 'center' },
  actionIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  actionTitle: { fontSize: 10, color: '#666', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase' },
  reviewSection: { marginTop: 8 },
  reviewCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f0f0f0' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 2 },
  reviewTime: { fontSize: 10, color: '#bbb', fontWeight: '600' },
  reviewText: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12, fontStyle: 'italic' },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: 12, fontWeight: 'bold', color: '#101130' }
});


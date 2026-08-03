import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, ChevronRight, Clock, MapPin, Search, Filter } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function OrderListScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');

  const statuses = ['All', 'Pending', 'Processing', 'OutForDelivery', 'Delivered'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?pageSize=50');
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = activeStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#FFF9E6', text: '#D97706' };
      case 'Processing': return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'OutForDelivery': return { bg: '#FEF3C7', text: '#92400E' };
      case 'Delivered': return { bg: '#F0FDF4', text: '#16A34A' };
      case 'Cancelled': return { bg: '#FEF2F2', text: '#DC2626' };
      default: return { bg: '#F9FAFB', text: '#6B7280' };
    }
  };

  const OrderItem = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.orderBody}>
          <View style={styles.orderInfoRow}>
            <ShoppingBag size={14} color="#999" />
            <Text style={styles.orderInfoText}>{item.recipientName}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Clock size={14} color="#999" />
            <Text style={styles.orderInfoText}>{new Date(item.orderDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderAmount}>${item.totalAmount.toFixed(2)}</Text>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details</Text>
            <ChevronRight size={14} color="#e21b5a" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statuses}
          keyExtractor={item => item}
          contentContainerStyle={styles.statusList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.statusTab, activeStatus === item && styles.statusTabActive]}
              onPress={() => setActiveStatus(item)}
            >
              <Text style={[styles.statusTabText, activeStatus === item && styles.statusTabTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ShoppingBag size={64} color="#eee" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
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
  iconBtn: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 12 },
  statusFilterContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  statusList: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4 },
  statusTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginRight: 8, backgroundColor: '#f5f5f5' },
  statusTabActive: { backgroundColor: '#e21b5a' },
  statusTabText: { fontSize: 13, color: '#666', fontWeight: '600' },
  statusTabTextActive: { color: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  orderCard: { 
    backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, 
    borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderNumber: { fontSize: 15, fontWeight: 'bold', color: '#101130' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  orderBody: { gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  orderInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderInfoText: { fontSize: 13, color: '#666', fontWeight: '500' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderAmount: { fontSize: 18, fontWeight: 'bold', color: '#101130' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsBtnText: { fontSize: 12, color: '#e21b5a', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, fontWeight: '500' }
});

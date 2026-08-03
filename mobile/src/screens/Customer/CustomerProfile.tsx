import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Theme } from '../../theme/Theme';

export default function CustomerProfile() {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.detail}>Total: ${item.totalAmount.toFixed(2)}</Text>
      <Text style={styles.detail}>Date: {new Date(item.orderDate).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't placed any orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 20, paddingTop: 60, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutText: { color: 'red', fontWeight: 'bold', marginTop: 6 },
  profileHeader: { padding: 20, alignItems: 'center', backgroundColor: '#fff', marginBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { color: '#666', marginTop: 4 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderNumber: { fontWeight: 'bold', fontSize: 16 },
  status: { color: Theme.colors.primary, fontWeight: 'bold' },
  detail: { color: '#666', marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});

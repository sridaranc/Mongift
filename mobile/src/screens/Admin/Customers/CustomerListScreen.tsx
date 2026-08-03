import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { User, Phone, Mail, ChevronRight, UserX, UserCheck, Search } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function CustomerListScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/users');
      // Filter out only customers or show all personnel based on preference
      // Here we show everyone but label them
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.post(`/admin/users/${id}/toggle-status`);
      setCustomers(customers.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      Alert.alert('Status Updated', `User has been ${currentStatus ? 'deactivated' : 'activated'}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const CustomerItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#34C759' : '#FF3B30' }]} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.roles[0] || 'Customer'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.statusBtn, { backgroundColor: item.isActive ? '#FFF0F0' : '#F0FFF4' }]} 
          onPress={() => toggleStatus(item.id, item.isActive)}
        >
          {item.isActive ? <UserX size={18} color="#FF3B30" /> : <UserCheck size={18} color="#34C759" />}
        </TouchableOpacity>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Mail size={14} color="#999" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={14} color="#999" />
          <Text style={styles.detailText}>{item.phoneNumber || 'No phone number'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.historyBtn}>
        <Text style={styles.historyBtnText}>View Order History</Text>
        <ChevronRight size={14} color="#e21b5a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personnel & Users</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={({ item }) => <CustomerItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchCustomers}
          refreshing={refreshing}
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  userCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { 
    width: 50, height: 50, borderRadius: 18, backgroundColor: '#101130', 
    justifyContent: 'center', alignItems: 'center', position: 'relative' 
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusDot: { 
    position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, 
    borderRadius: 7, borderOriginWidth: 3, borderColor: '#fff' 
  },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#101130', marginBottom: 4 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 10, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  statusBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  userDetails: { gap: 10, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 14, color: '#666' },
  historyBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyBtnText: { fontSize: 13, color: '#e21b5a', fontWeight: 'bold' }
});

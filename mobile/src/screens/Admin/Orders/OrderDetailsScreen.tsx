import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Alert, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Package, MapPin, User, Phone, Mail, Calendar, Clock, CreditCard, ChevronDown, Check } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function OrderDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deliveryStaff, setDeliveryStaff] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const statuses = ['Pending', 'Processing', 'OutForDelivery', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrderDetails();
    fetchDeliveryStaff();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to fetch order details', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryStaff = async () => {
    try {
      const res = await api.get('/admin/users');
      const staff = res.data.filter((u: any) => u.roles.includes('Delivery'));
      setDeliveryStaff(staff);
    } catch (err) {
      console.error('Failed to fetch delivery staff', err);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      setShowStatusModal(false);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const assignStaff = async (staffId: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { 
        status: order.status, 
        assignedStaffId: staffId 
      });
      fetchOrderDetails();
      setShowStaffModal(false);
      Alert.alert('Success', 'Delivery staff assigned successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to assign staff');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const statusInfo = (status: string) => {
    switch (status) {
      case 'Pending': return { color: '#D97706', bg: '#FFF9E6' };
      case 'Processing': return { color: '#4F46E5', bg: '#EEF2FF' };
      case 'OutForDelivery': return { color: '#92400E', bg: '#FEF3C7' };
      case 'Delivered': return { color: '#16A34A', bg: '#F0FDF4' };
      case 'Cancelled': return { color: '#DC2626', bg: '#FEF2F2' };
      default: return { color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const currentStatus = statusInfo(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderSummary}>
          <View>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{new Date(order.orderDate).toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={[styles.statusText, { color: currentStatus.color }]}>{order.status}</Text>
            <ChevronDown size={14} color={currentStatus.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color="#e21b5a" />
            <Text style={styles.sectionTitle}>Items</Text>
          </View>
          {order.items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#e21b5a" />
            <Text style={styles.sectionTitle}>Delivery Information</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Recipient</Text>
            <Text style={styles.infoValue}>{order.recipientName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Occasion</Text>
            <Text style={styles.infoValue}>{order.occasion || 'General Gift'}</Text>
          </View>
          {order.giftMessage && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Gift Message</Text>
              <Text style={styles.messageValue}>"{order.giftMessage}"</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#e21b5a" />
            <Text style={styles.sectionTitle}>Delivery Assignment</Text>
          </View>
          <TouchableOpacity 
            style={styles.assignCard} 
            onPress={() => setShowStaffModal(true)}
          >
            <View>
              <Text style={styles.assignLabel}>Assigned Staff</Text>
              <Text style={styles.assignValue}>
                {order.assignedStaffId ? 'Staff Member Assigned' : 'Unassigned'}
              </Text>
            </View>
            <View style={styles.assignBtn}>
              <Text style={styles.assignBtnText}>Change</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            {statuses.map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.modalItem, order.status === s && styles.modalItemActive]}
                onPress={() => updateStatus(s)}
              >
                <Text style={[styles.modalItemText, order.status === s && styles.modalItemTextActive]}>{s}</Text>
                {order.status === s && <Check size={20} color="#fff" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowStatusModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Staff Modal */}
      <Modal visible={showStaffModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Delivery Staff</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {deliveryStaff.map(s => (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.modalItem, order.assignedStaffId === s.id && styles.modalItemActive]}
                  onPress={() => assignStaff(s.id)}
                >
                  <View>
                    <Text style={[styles.modalItemText, order.assignedStaffId === s.id && styles.modalItemTextActive]}>
                      {s.firstName} {s.lastName}
                    </Text>
                    <Text style={[styles.modalSubText, order.assignedStaffId === s.id && styles.modalItemTextActive]}>
                      {s.phoneNumber || 'No Phone'}
                    </Text>
                  </View>
                  {order.assignedStaffId === s.id && <Check size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowStaffModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#101130' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, backgroundColor: '#fcfcfd' },
  orderSummary: { 
    backgroundColor: '#fff', padding: 24, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 
  },
  orderNumber: { fontSize: 20, fontWeight: 'bold', color: '#101130', marginBottom: 4 },
  orderDate: { fontSize: 13, color: '#999', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  section: { backgroundColor: '#fff', padding: 24, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101130', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#101130', marginBottom: 4 },
  itemQty: { fontSize: 13, color: '#999' },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#101130' },
  totalRow: { 
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, 
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f9f9f9' 
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#101130' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#e21b5a' },
  infoBlock: { marginBottom: 16 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  infoValue: { fontSize: 15, color: '#101130', fontWeight: '500' },
  messageValue: { fontSize: 14, color: '#666', fontStyle: 'italic', lineHeight: 22 },
  assignCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#f9f9f9', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0' 
  },
  assignLabel: { fontSize: 11, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  assignValue: { fontSize: 15, color: '#101130', fontWeight: 'bold' },
  assignBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  assignBtnText: { fontSize: 12, color: '#101130', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#101130', marginBottom: 24, textAlign: 'center' },
  modalItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 16, borderRadius: 16, marginBottom: 12, backgroundColor: '#f9f9f9' 
  },
  modalItemActive: { backgroundColor: '#101130' },
  modalItemText: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  modalSubText: { fontSize: 12, color: '#999' },
  modalItemTextActive: { color: '#fff' },
  modalClose: { marginTop: 12, padding: 16, alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: '#999', fontWeight: 'bold' }
});

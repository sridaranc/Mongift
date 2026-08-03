import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2, Circle, Truck, Package, Gift, Star } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import api from '../api/client';

export default function TrackOrderScreen({ route, navigation }: any) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Assuming GET /orders/{orderId} exists and returns status
      // If we don't have a real orderId, we'll mock the data
      if (orderId && !orderId.startsWith('ORD-')) {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } else {
        // Mock data for demo purposes if orderId is generated locally
        setTimeout(() => {
          setOrder({
            orderNumber: orderId || 'ORD-98765432',
            status: 'OutForDelivery', // Placed, Preparing, OutForDelivery, Delivered
            totalAmount: 104.90,
          });
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (e) {
      console.error(e);
      // Fallback mock
      setOrder({ orderNumber: orderId || 'ORD-ERROR', status: 'Placed' });
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepStatus: string) => {
    const statuses = ['Placed', 'Preparing', 'OutForDelivery', 'Delivered'];
    const currentIndex = statuses.indexOf(order?.status || 'Placed');
    const stepIndex = statuses.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const Step = ({ title, subtitle, icon: Icon, status, isLast }: any) => {
    const isActive = status === 'active';
    const isCompleted = status === 'completed';
    
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          <View style={[styles.iconWrapper, isCompleted ? styles.iconCompleted : isActive ? styles.iconActive : styles.iconPending]}>
            {isCompleted ? <CheckCircle2 size={24} color="#fff" /> : <Icon size={20} color={isActive ? '#fff' : Theme.colors.textLight} />}
          </View>
          {!isLast && <View style={[styles.stepLine, (isCompleted || isActive) && styles.lineActive]} />}
        </View>
        <View style={styles.stepTextContainer}>
          <Text style={[styles.stepTitle, (isCompleted || isActive) && styles.textActive]}>{title}</Text>
          <Text style={styles.stepSubtitle}>{subtitle}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const isDelivered = order?.status === 'Delivered';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.orderSummary}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderNumber}>{order?.orderNumber}</Text>
        </View>

        <View style={styles.trackingCard}>
          <Step 
            title="Order Placed" 
            subtitle="We have received your order" 
            icon={Package} 
            status={getStepStatus('Placed')} 
          />
          <Step 
            title="Preparing" 
            subtitle="Your gift is being prepared" 
            icon={Gift} 
            status={getStepStatus('Preparing')} 
          />
          <Step 
            title="Out for Delivery" 
            subtitle="Driver is on the way" 
            icon={Truck} 
            status={getStepStatus('OutForDelivery')} 
          />
          <Step 
            title="Delivered" 
            subtitle="Package has been delivered" 
            icon={CheckCircle2} 
            status={getStepStatus('Delivered')} 
            isLast 
          />
        </View>

        {isDelivered && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>How was your experience?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s}>
                  <Star size={32} color="#f59e0b" fill="transparent" />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.reorderBtn}>
              <Text style={styles.reorderBtnText}>Order Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text },
  content: { padding: 20 },
  orderSummary: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center' },
  orderLabel: { fontSize: 12, color: Theme.colors.textLight, textTransform: 'uppercase', marginBottom: 4 },
  orderNumber: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.text },
  trackingCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 24 },
  stepContainer: { flexDirection: 'row', marginBottom: 0 },
  stepIconContainer: { alignItems: 'center', width: 40, marginRight: 16 },
  iconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconCompleted: { backgroundColor: Theme.colors.success },
  iconActive: { backgroundColor: Theme.colors.primary },
  iconPending: { backgroundColor: Theme.colors.surface, borderWidth: 2, borderColor: Theme.colors.border },
  stepLine: { width: 2, height: 40, backgroundColor: Theme.colors.border, marginVertical: 4 },
  lineActive: { backgroundColor: Theme.colors.primary },
  stepTextContainer: { flex: 1, paddingTop: 8, paddingBottom: 32 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: Theme.colors.textLight, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Theme.colors.textLight },
  textActive: { color: Theme.colors.text },
  reviewCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center' },
  reviewTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  reorderBtn: { width: '100%', backgroundColor: Theme.colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  reorderBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

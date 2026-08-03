import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useCart } from '../context/CartContext';
import api from '../api/client';

const DELIVERY_FEE = 15.00;

export default function PaymentScreen({ route, navigation }: any) {
  const { checkoutData } = route.params;
  const { items, totalPrice, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const grandTotal = totalPrice + DELIVERY_FEE;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create the order payload based on backend DTOs
      const orderPayload = {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        deliveryAddress: checkoutData.address,
        totalAmount: grandTotal,
        paymentStatus: 'Paid',
        orderNumber: `ORD-${Date.now()}`
      };

      // In a real app with Stripe Mobile SDK, we would:
      // 1. Fetch PaymentIntent client secret from backend
      // 2. Present Stripe payment sheet
      // 3. Wait for success, then finalize order
      // For this flow demo, we'll simulate a successful API call.

      const response = await api.post('/orders', orderPayload);
      
      clearCart();
      navigation.navigate('OrderConfirmation', { 
        orderId: response.data.id || orderPayload.orderNumber,
        deliveryTime: `${checkoutData.date} at ${checkoutData.time}`
      });
    } catch (e) {
      console.error(e);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PaymentOption = ({ id, title, icon: Icon, selected }: any) => (
    <TouchableOpacity 
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={() => setSelectedMethod(id)}
    >
      <Icon size={24} color={selected ? Theme.colors.primary : Theme.colors.textLight} />
      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
      <View style={styles.radioContainer}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Payment</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Items Total</Text>
            <Text style={styles.summaryText}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Delivery Fee</Text>
            <Text style={styles.summaryText}>${DELIVERY_FEE.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalText}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <PaymentOption id="card" title="Credit / Debit Card" icon={CreditCard} selected={selectedMethod === 'card'} />
        <PaymentOption id="apple" title="Apple Pay" icon={Smartphone} selected={selectedMethod === 'apple'} />
        <PaymentOption id="paynow" title="PayNow" icon={Smartphone} selected={selectedMethod === 'paynow'} />
        <PaymentOption id="cod" title="Cash on Delivery" icon={Banknote} selected={selectedMethod === 'cod'} />

        <View style={styles.secureBadge}>
          <ShieldCheck size={16} color={Theme.colors.success} />
          <Text style={styles.secureText}>Payments are secure and encrypted</Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Pay ${grandTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.surface },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: Theme.colors.text },
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: Theme.colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryText: { fontSize: 14, color: Theme.colors.textLight },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 12 },
  grandTotalText: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.text },
  grandTotalValue: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.primary },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  optionCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.surface },
  optionTitle: { flex: 1, marginLeft: 16, fontSize: 16, fontWeight: '500', color: Theme.colors.textLight },
  optionTitleSelected: { color: Theme.colors.text, fontWeight: 'bold' },
  radioContainer: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.primary },
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  secureText: { marginLeft: 8, fontSize: 12, color: Theme.colors.success, fontWeight: '600' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border },
  payBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme/Theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutScreen({ navigation }: any) {
  const { totalPrice } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    recipientName: user?.firstName || '',
    phone: '',
    address: '',
    date: '',
    time: '',
    message: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);

  const handleNext = () => {
    // In a real app, validate fields here
    navigation.navigate('Payment', { checkoutData: formData });
  };

  const updateForm = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipient Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Who is receiving this?"
              value={formData.recipientName}
              onChangeText={(v) => updateForm('recipientName', v)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipient Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="+65 9123 4567"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(v) => updateForm('phone', v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Address *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Block / Unit / Street name"
              multiline
              value={formData.address}
              onChangeText={(v) => updateForm('address', v)}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Save this address for future</Text>
            <Switch
              value={saveAddress}
              onValueChange={setSaveAddress}
              trackColor={{ false: '#d1d5db', true: Theme.colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Delivery</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.date}
                onChangeText={(v) => updateForm('date', v)}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="10:00 AM"
                value={formData.time}
                onChangeText={(v) => updateForm('time', v)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Message (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Write a sweet message..."
              multiline
              value={formData.message}
              onChangeText={(v) => updateForm('message', v)}
            />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalText}>Subtotal: ${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue to Payment</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.surface },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 24 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: Theme.colors.text },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: Theme.colors.textLight, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 12, padding: 16, fontSize: 16 },
  row: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  switchLabel: { fontSize: 14, color: Theme.colors.text },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border },
  summaryRow: { marginBottom: 16, alignItems: 'center' },
  totalText: { fontSize: 16, fontWeight: '600', color: Theme.colors.textLight },
  nextBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

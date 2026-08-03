import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Package, Clock, MapPin } from 'lucide-react-native';
import { Theme } from '../theme/Theme';

export default function OrderConfirmationScreen({ route, navigation }: any) {
  const { orderId, deliveryTime } = route.params || {};

  // Prevent back button from going to payment screen
  useEffect(() => {
    const onBackPress = () => {
      navigation.navigate('HomeMain');
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={80} color={Theme.colors.success} />
        </View>
        
        <Text style={styles.title}>Order Placed Successfully! 🎉</Text>
        <Text style={styles.subtitle}>Thank you for choosing Mon Gifts.</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Package size={20} color={Theme.colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>{orderId || 'ORD-12345678'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Theme.colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Estimated Delivery</Text>
              <Text style={styles.detailValue}>{deliveryTime || 'Today at 5:00 PM'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <MapPin size={20} color={Theme.colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: Theme.colors.primary }]}>Preparing your gift 🎁</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.trackBtn} 
          onPress={() => navigation.navigate('TrackOrder', { orderId })}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shopBtn} 
          onPress={() => navigation.navigate('HomeMain')}
        >
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.surface },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Theme.colors.textLight, textAlign: 'center', marginBottom: 32 },
  detailsCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 40 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailTextContainer: { marginLeft: 16 },
  detailLabel: { fontSize: 12, color: Theme.colors.textLight, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '600', color: Theme.colors.text },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
  trackBtn: { width: '100%', backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  shopBtn: { width: '100%', backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.primary },
  shopBtnText: { color: Theme.colors.primary, fontSize: 16, fontWeight: 'bold' }
});

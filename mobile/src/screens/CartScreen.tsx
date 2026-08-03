import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/imageUtils';

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { token } = useAuth();

  const handleCheckout = () => {
    if (!token) {
      // Require login before checkout
      navigation.navigate('Login', { returnTo: 'Checkout' });
    } else {
      navigation.navigate('Checkout');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image 
        key={`cart-img-${item.id}`}
        source={{ uri: getImageUrl(item.imageUrl || item.ImageUrl) }} 
        style={styles.itemImage} 
        defaultSource={{ uri: 'https://via.placeholder.com/150' }}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.actionsRow}>
          <View style={styles.quantityControl}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
              <Minus size={16} color={Theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
              <Plus size={16} color={Theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
            <Trash2 size={20} color={Theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBagPlaceholder />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Looks like you haven't added any gifts yet.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </>
      )}
    </SafeAreaView>
  );
}

const ShoppingBagPlaceholder = () => (
  <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
    <Text style={{ fontSize: 40 }}>🛒</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text },
  clearText: { color: Theme.colors.error, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 14, color: Theme.colors.textLight, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listContent: { padding: 20 },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  itemDetails: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '600', color: Theme.colors.text },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.primary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtn: { padding: 4 },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: '600' },
  removeBtn: { padding: 4 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { fontSize: 16, color: Theme.colors.textLight },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text },
  checkoutBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 }
});

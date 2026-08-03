import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Truck, ShieldCheck, Clock, Minus, Plus } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api/imageUtils';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }: any) {
  const { product } = route.params || {};
  const { addItem, totalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  if (!product) return <View style={styles.container}><Text>Product not found.</Text></View>;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.category?.name || 'Gift'
    });
    // In a full app, might want to add exactly the `quantity` amount, 
    // but the addItem logic adds 1 or increments. Let's just add it and navigate or toast.
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getImageUrl(product.imageUrl) }} 
            style={styles.image} 
            defaultSource={{ uri: 'https://via.placeholder.com/800' }}
          />
          <SafeAreaView style={styles.navHeader} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <ChevronLeft size={24} color={Theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
              <ShoppingBag size={24} color={Theme.colors.text} />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.categoryName}>{product.category?.name || 'Gifts'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>
          
          <View style={styles.benefitsRow}>
            <View style={styles.benefit}>
              <Truck size={20} color={Theme.colors.primary} />
              <Text style={styles.benefitText}>Free Delivery</Text>
            </View>
            <View style={styles.benefit}>
              <ShieldCheck size={20} color={Theme.colors.primary} />
              <Text style={styles.benefitText}>Secure</Text>
            </View>
            <View style={styles.benefit}>
              <Clock size={20} color={Theme.colors.primary} />
              <Text style={styles.benefitText}>Same Day</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Fixed Bottom */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart - ${product.price.toFixed(2)}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: Theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 24,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  categoryName: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Theme.colors.textLight,
    lineHeight: 22,
    fontWeight: '300',
    marginBottom: 24,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  benefit: {
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.textLight,
    marginTop: 4,
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.white,
  },
  addToCartButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

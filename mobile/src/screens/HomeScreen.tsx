import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Search, ShoppingBag, MapPin, Sparkles } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api/imageUtils';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?pageSize=6'),
        api.get('/categories')
      ]);
      // Handle both camelCase and PascalCase from API
      const products = prodRes.data.data || prodRes.data.Data || (Array.isArray(prodRes.data) ? prodRes.data : []);
      setFeatured(products);
      
      const categories = catRes.data.data || catRes.data.Data || (Array.isArray(catRes.data) ? catRes.data : []);
      setCategories(categories);
    } catch (err) {
      console.log('Error fetching mobile data:', err);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Collections', { search: searchQuery });
    }
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Collections', { category: item.name })}
    >
      <View style={styles.categoryImageContainer}>
        <Image 
          key={`cat-${item.id}`}
          source={{ uri: getImageUrl(item.imageUrl || item.ImageUrl) }} 
          style={styles.categoryImg} 
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, product: item })}
    >
      <Image 
        key={`prod-${item.id}`}
        source={{ uri: getImageUrl(item.imageUrl || item.ImageUrl) }} 
        style={styles.productImage}
        resizeMode="cover"
        defaultSource={{ uri: 'https://via.placeholder.com/400' }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.categoryName || item.CategoryName || 'Gift'}</Text>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>${(item.price || item.Price || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={18} color={Theme.colors.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <Text style={styles.locationValue}>Trichy, TN ▼</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {!user && (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={24} color={Theme.colors.text} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Theme.colors.textLight} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search gifts, flowers, cakes..."
            placeholderTextColor={Theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <FlatList 
          data={categories}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
        />

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Sparkles size={24} color="#fff" />
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Special Offer!</Text>
              <Text style={styles.promoSubtitle}>Get 20% off on your first order with code WELCOME20</Text>
            </View>
          </View>
        </View>

        {/* Trending Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trending Gifts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Collections')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList 
          data={featured}
          renderItem={renderProduct}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{paddingLeft: 20}}>Loading trending items...</Text>}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 10,
    color: Theme.colors.textLight,
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  loginBtnText: {
    color: Theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Theme.colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  categoryList: {
    paddingLeft: 20,
    paddingBottom: 24,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  promoBanner: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  productList: {
    paddingLeft: 20,
  },
  productCard: {
    width: width * 0.45,
    marginRight: 16,
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: Theme.colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
});

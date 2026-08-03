import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Star } from 'lucide-react-native';
import { getImageUrl } from '../api/imageUtils';
import { Theme } from '../theme/Theme';
import api from '../api/client';

export default function CollectionsScreen({ route, navigation }: any) {
  const { category, search } = route.params || {};
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(search || '');

  useEffect(() => {
    if (search) setSearchQuery(search);
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // In a real app, we'd filter by category via API parameter if provided
      const response = await api.get('/products');
      const productsData = response.data.data || response.data.Data || (Array.isArray(response.data) ? response.data : []);
      setProducts(productsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!category || p.categoryName === category || category === 'All')
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, product: item })}
    >
      <Image 
        source={{ uri: getImageUrl(item.imageUrl || item.ImageUrl) }} 
        style={styles.productImage} 
        defaultSource={{ uri: 'https://via.placeholder.com/400' }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${(item.price || item.Price || 0).toFixed(2)}</Text>
          <View style={styles.rating}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{category || 'All Gifts'}</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Theme.colors.textLight} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text },
  filterBtn: { padding: 8, backgroundColor: Theme.colors.surface, borderRadius: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface,
    marginHorizontal: 20, paddingHorizontal: 16, height: 46, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: Theme.colors.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden'
  },
  productImage: { width: '100%', height: 160, backgroundColor: '#f0f0f0' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: Theme.colors.text, marginBottom: 8, height: 40 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.primary },
  rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 10, fontWeight: 'bold', color: '#92400e', marginLeft: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: Theme.colors.textLight }
});

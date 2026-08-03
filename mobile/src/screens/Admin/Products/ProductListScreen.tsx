import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, Filter, Edit2, Trash2, Package, ChevronRight } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';
import { getImageUrl } from '../../../api/imageUtils';

export default function ProductListScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?pageSize=100');
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/products/${id}`);
              setProducts(products.filter(p => p.id !== id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete product");
            }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const ProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image 
          key={`adm-prod-${item.id}`}
          source={{ uri: getImageUrl(item.imageUrl || item.ImageUrl) }} 
          style={styles.productImage} 
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.categoryName}>{item.categoryName}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <View style={[styles.stockBadge, { backgroundColor: item.stockQuantity <= 5 ? '#FFF0F0' : '#F0FFF4' }]}>
            <Text style={[styles.stockText, { color: item.stockQuantity <= 5 ? '#FF3B30' : '#34C759' }]}>
              {item.stockQuantity} in stock
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddProduct', { product: item })}>
          <Edit2 size={18} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
          <Trash2 size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or categories..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#444" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color="#eee" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#101130' },
  addBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e21b5a', 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6 
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  searchBarContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  searchBar: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#eee', gap: 10 
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: { 
    width: 48, height: 48, backgroundColor: '#fff', borderRadius: 12, 
    borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' 
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  productCard: { 
    flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 20, 
    marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' 
  },
  productImageContainer: { width: 70, height: 70, borderRadius: 14, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, marginLeft: 16 },
  categoryName: { fontSize: 10, color: '#e21b5a', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#101130', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stockText: { fontSize: 10, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, fontWeight: '500' }
});

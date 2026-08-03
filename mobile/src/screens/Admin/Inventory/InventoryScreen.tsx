import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Package, AlertCircle, RefreshCw, ChevronRight, Search, TrendingDown, TrendingUp } from 'lucide-react-native';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function InventoryScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/products?pageSize=100');
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const product = products.find(p => p.id === id);
      await api.put(`/products/${id}`, { ...product, stockQuantity: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stockQuantity: newStock } : p));
    } catch (err) {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;

  const InventoryItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <View style={styles.iconBox}>
          <Package size={24} color={item.stockQuantity <= 5 ? '#FF3B30' : '#101130'} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.categoryName}>{item.categoryName}</Text>
        </View>
        <View style={styles.stockControl}>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={() => updateStock(item.id, Math.max(0, item.stockQuantity - 1))}
          >
            <TrendingDown size={18} color="#666" />
          </TouchableOpacity>
          <View style={styles.stockValueBox}>
            <Text style={[styles.stockValue, item.stockQuantity <= 5 && styles.lowStockText]}>
              {item.stockQuantity}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={() => updateStock(item.id, item.stockQuantity + 1)}
          >
            <TrendingUp size={18} color="#e21b5a" />
          </TouchableOpacity>
        </View>
      </View>
      {item.stockQuantity <= 5 && (
        <View style={styles.alertBar}>
          <AlertCircle size={14} color="#FF3B30" />
          <Text style={styles.alertText}>Low stock warning! Refill recommended.</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Control</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchInventory}>
          <RefreshCw size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.overview}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
        <View style={[styles.summaryCard, lowStockCount > 0 && styles.alertCard]}>
          <Text style={[styles.summaryLabel, lowStockCount > 0 && styles.alertLabel]}>Low Stock</Text>
          <Text style={[styles.summaryValue, lowStockCount > 0 && styles.alertValue]}>{lowStockCount}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by product name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <InventoryItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchInventory}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff' 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#101130' },
  refreshBtn: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 12 },
  overview: { flexDirection: 'row', padding: 24, gap: 16 },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f0f0f0' },
  alertCard: { backgroundColor: '#FFF0F0', borderColor: '#FFC1C1' },
  summaryLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 4 },
  alertLabel: { color: '#FF3B30' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#101130' },
  alertValue: { color: '#FF3B30' },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    marginHorizontal: 24, paddingHorizontal: 16, height: 50, borderRadius: 12, 
    borderWidth: 1, borderColor: '#eee', gap: 10, marginBottom: 16
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  itemCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden' },
  itemMain: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconBox: { width: 44, height: 44, backgroundColor: '#f9f9f9', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#101130', marginBottom: 2 },
  categoryName: { fontSize: 11, color: '#999', fontWeight: '600' },
  stockControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: { width: 36, height: 36, backgroundColor: '#f5f5f5', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stockValueBox: { width: 40, alignItems: 'center' },
  stockValue: { fontSize: 18, fontWeight: 'bold', color: '#101130' },
  lowStockText: { color: '#FF3B30' },
  alertBar: { backgroundColor: '#FFF0F0', paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertText: { fontSize: 11, color: '#FF3B30', fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

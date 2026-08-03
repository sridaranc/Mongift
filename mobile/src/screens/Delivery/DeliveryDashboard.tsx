import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Theme } from '../../theme/Theme';

export default function DeliveryDashboard() {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (id: string, status: string, imageUri?: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status, message: '' });
      
      if (status === 'Delivered' && imageUri) {
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        await api.post(`/orders/${id}/pod`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      fetchOrders();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleDeliver = async (id: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateStatus(id, 'Delivered', result.assets[0].uri);
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.detail}>Recipient: {item.recipientName}</Text>
      <Text style={styles.detail}>Items: {item.itemCount}</Text>
      
      <View style={styles.actions}>
        {item.status === 'Assigned' && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => updateStatus(item.id, 'OutForDelivery')}
          >
            <Text style={styles.actionText}>Start Delivery</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'OutForDelivery' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'green' }]} 
            onPress={() => handleDeliver(item.id)}
          >
            <Text style={styles.actionText}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No assigned deliveries.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 6,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  detail: {
    color: '#666',
    marginBottom: 4,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: Theme.colors.primary,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  }
});

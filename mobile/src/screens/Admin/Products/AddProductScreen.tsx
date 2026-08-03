import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, X, ChevronDown, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../api/client';
import { Theme } from '../../../theme/Theme';

export default function AddProductScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingProduct = route.params?.product;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [name, setName] = useState(editingProduct?.name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [price, setPrice] = useState(editingProduct?.price?.toString() || '');
  const [stockQuantity, setStockQuantity] = useState(editingProduct?.stockQuantity?.toString() || '');
  const [categoryId, setCategoryId] = useState(editingProduct?.categoryId || '');
  const [imageUrl, setImageUrl] = useState(editingProduct?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', { uri, name: filename, type } as any);

    try {
      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !stockQuantity || !categoryId) {
      Alert.alert('Required Fields', 'Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      categoryId,
      imageUrl,
      isActive: true
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await api.post('/products', payload);
        Alert.alert('Success', 'Product created successfully');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save product. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading || isUploading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Product Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Camera size={32} color="#999" />
              <Text style={styles.pickerText}>Upload Photo</Text>
            </View>
          )}
          {imageUrl && !isUploading && (
            <View style={styles.editIcon}>
              <Camera size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Premium Chocolate Cake"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                  styles.categoryItem, 
                  categoryId === cat.id && styles.categoryItemSelected
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextSelected]}>
                  {cat.name}
                </Text>
                {categoryId === cat.id && <Check size={14} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.label}>Initial Stock *</Text>
            <TextInput
              style={styles.input}
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write details about the product..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#101130' },
  saveBtn: { backgroundColor: '#e21b5a', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  form: { flex: 1 },
  formContent: { padding: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#101130', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  imagePicker: { 
    width: '100%', height: 200, backgroundColor: '#f9f9f9', borderRadius: 24, 
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#eee', justifyContent: 'center', 
    alignItems: 'center', marginBottom: 32, overflow: 'hidden' 
  },
  pickerPlaceholder: { alignItems: 'center' },
  pickerText: { fontSize: 13, color: '#999', marginTop: 8, fontWeight: '600' },
  selectedImage: { width: '100%', height: '100%' },
  editIcon: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#e21b5a', padding: 8, borderRadius: 10 },
  inputGroup: { marginBottom: 24 },
  input: { 
    backgroundColor: '#f9f9f9', height: 56, borderRadius: 16, paddingHorizontal: 16, 
    fontSize: 15, color: '#101130', borderWidth: 1, borderColor: '#f0f0f0' 
  },
  textArea: { height: 120, paddingVertical: 16 },
  row: { flexDirection: 'row' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f5f5', 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#eee' 
  },
  categoryItemSelected: { backgroundColor: '#101130', borderColor: '#101130' },
  categoryText: { fontSize: 13, color: '#666', fontWeight: '600' },
  categoryTextSelected: { color: '#fff' }
});

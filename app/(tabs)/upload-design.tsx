import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

import ApiService from '@/services/apiClient';

export default function UploadDesignScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = {
    background: isDark ? '#121212' : '#F7F7FB',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#2A2636',
    muted: isDark ? '#A1A1AA' : '#7A7687',
    border: isDark ? '#34343A' : '#E3E0EE',
    dashed: isDark ? '#5C547A' : '#C8C2DE',
    chip: isDark ? '#252533' : '#ECEAF7',
    primary: '#4833A3',
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow media permissions to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category.trim() || !price.trim() || !imageUri) {
      Alert.alert('Missing fields', 'Please fill all fields and upload an image before submitting.');
      return;
    }

    setLoading(true);
    try {
      let uploadedPath = '';
      if (imageUri) {
        const uploaded = await ApiService.uploadSingleFile(imageUri);
        uploadedPath = uploaded?.path || uploaded?.url || uploaded?.originalFilePath || '';
      }

      const payload = {
        name: title.trim(),
        frontImageUrl: uploadedPath,
        designImages: uploadedPath ? [uploadedPath] : [],
        description: description.trim(),
        openForCustomization: true,
        amount: Number(price || 0),
        mocks: uploadedPath
          ? [
              {
                limitedStatus: false,
                imageUrl: uploadedPath,
                availableQty: 0,
                name: `${title.trim()} Mock`,
                category: category.trim(),
                colours: [],
              },
            ]
          : [],
        tags: [],
        categories: [category.trim()],
      };

      if (designId) {
        await ApiService.updateCustomDesign(designId, payload);
      } else {
        await ApiService.createDesign(payload);
      }

      Alert.alert('Success', `Design ${designId ? 'updated' : 'uploaded'} successfully.`);
      router.back();
    } catch (error: any) {
      Alert.alert('Unable to submit', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 pt-12" style={{ backgroundColor: theme.background }}>
      <View className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: theme.chip }}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-semibold" style={{ color: theme.text }}>Upload Design</Text>
      </View>
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <TouchableOpacity onPress={pickImage} className="mb-4 items-center justify-center rounded-2xl border border-dashed p-6" style={{ borderColor: theme.dashed, backgroundColor: theme.surface }}>
          {imageUri ? <Image source={{ uri: imageUri }} className="h-40 w-full rounded-xl" resizeMode="cover" /> : <Text style={{ color: theme.muted }}>Tap to upload design image</Text>}
        </TouchableOpacity>
        <TextInput value={title} onChangeText={setTitle} placeholder="Design title" placeholderTextColor={theme.muted} style={{ color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }} className="mb-3 rounded-xl border px-4 py-3" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={theme.muted} multiline style={{ color: theme.text, borderColor: theme.border, backgroundColor: theme.surface, textAlignVertical: 'top' }} className="mb-3 h-24 rounded-xl border px-4 py-3" />
        <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor={theme.muted} style={{ color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }} className="mb-3 rounded-xl border px-4 py-3" />
        <TextInput value={price} onChangeText={setPrice} placeholder="Price" placeholderTextColor={theme.muted} keyboardType="number-pad" style={{ color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }} className="mb-3 rounded-xl border px-4 py-3" />
        <TouchableOpacity disabled={loading} onPress={handleSubmit} className="mt-3 rounded-full py-4 disabled:opacity-60" style={{ backgroundColor: theme.primary }}>
          <Text className="text-center text-base font-semibold text-white">{loading ? 'Submitting...' : designId ? 'Update Design' : 'Upload Design'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

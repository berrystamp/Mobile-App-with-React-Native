import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiService from '@/services/apiClient';

export default function UploadDesignScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!title.trim() || !description.trim() || !category.trim() || !price.trim()) {
      Alert.alert('Missing fields', 'Please fill all fields before uploading.');
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
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        amount: Number(price || 0),
        imagePath: uploadedPath,
      };

      if (designId) {
        await ApiService.updateCustomDesign(designId, payload);
      } else {
        await ApiService.createCustomDesign(payload);
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
    <View className="flex-1 bg-[#F7F7FB] pt-12">
      <View className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-xl bg-[#ECEAF7]">
          <Ionicons name="arrow-back" size={20} color="#2B2833" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-semibold text-[#2A2636]">Upload Design</Text>
      </View>
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <TouchableOpacity onPress={pickImage} className="mb-4 items-center justify-center rounded-2xl border border-dashed border-[#C8C2DE] bg-white p-6">
          {imageUri ? <Image source={{ uri: imageUri }} className="h-40 w-full rounded-xl" resizeMode="cover" /> : <Text className="text-[#7A7687]">Tap to upload design image</Text>}
        </TouchableOpacity>
        <TextInput value={title} onChangeText={setTitle} placeholder="Design title" className="mb-3 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline className="mb-3 h-24 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TextInput value={category} onChangeText={setCategory} placeholder="Category" className="mb-3 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TextInput value={price} onChangeText={setPrice} placeholder="Price" keyboardType="number-pad" className="mb-3 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TouchableOpacity disabled={loading} onPress={handleSubmit} className="mt-3 rounded-full bg-[#4833A3] py-4 disabled:opacity-60">
          <Text className="text-center text-base font-semibold text-white">{loading ? 'Submitting...' : designId ? 'Update Design' : 'Upload Design'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

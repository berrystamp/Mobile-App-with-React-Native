import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiService from '@/services/apiClient';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { collectionId, name: existingName } = useLocalSearchParams<{ collectionId?: string; name?: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingName) setName(String(existingName));
  }, [existingName]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow media permissions to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Collection name is required.');
      return;
    }
    setLoading(true);
    try {
      let imagePath = '';
      if (imageUri) {
        const file = await ApiService.uploadSingleFile(imageUri);
        imagePath = file?.path || file?.url || '';
      }
      const payload = { name: name.trim(), description: description.trim(), imagePath };
      if (collectionId) {
        await ApiService.updateCollection(collectionId, payload);
      } else {
        await ApiService.createCollection(payload);
      }
      Alert.alert('Success', `Collection ${collectionId ? 'updated' : 'created'} successfully.`);
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
        <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-xl bg-[#ECEAF7]"><Ionicons name="arrow-back" size={20} color="#2B2833" /></TouchableOpacity>
        <Text className="ml-4 text-2xl font-semibold text-[#2A2636]">{collectionId ? 'Update Collection' : 'Create Collection'}</Text>
      </View>
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <TouchableOpacity onPress={pickImage} className="mb-4 items-center justify-center rounded-2xl border border-dashed border-[#C8C2DE] bg-white p-6">
          {imageUri ? <Image source={{ uri: imageUri }} className="h-40 w-full rounded-xl" resizeMode="cover" /> : <Text className="text-[#7A7687]">Tap to upload collection cover</Text>}
        </TouchableOpacity>
        <TextInput value={name} onChangeText={setName} placeholder="Collection name" className="mb-3 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TextInput value={description} onChangeText={setDescription} placeholder="Collection description" multiline className="mb-3 h-24 rounded-xl border border-[#E3E0EE] bg-white px-4 py-3" />
        <TouchableOpacity disabled={loading} onPress={submit} className="rounded-full bg-[#4833A3] py-4 disabled:opacity-60"><Text className="text-center text-base font-semibold text-white">{loading ? 'Saving...' : collectionId ? 'Update Collection' : 'Create Collection'}</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

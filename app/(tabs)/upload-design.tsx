import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import ApiService from '@/services/apiClient';

export default function UploadToGalleryScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [imageUri, setImageUri] = useState('');
  const [uploading, setUploading] = useState(false);

  const theme = {
    background: isDark ? '#121212' : '#F7F7FB',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#2A2636',
    muted: isDark ? '#A1A1AA' : '#7A7687',
    border: isDark ? '#34343A' : '#E3E0EE',
    dashed: isDark ? '#5C547A' : '#C9C9C9',
    chip: isDark ? '#252533' : '#ECEAF7',
    primary: '#3E2F8A',
    lightPrimary: '#3E2F8A9E',
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow media permissions to continue.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for gallery
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please upload an image before adding to gallery.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload image file to get path
      const uploadResponse = await ApiService.uploadSingleFile(imageUri);
      const uploadedPath = 
        uploadResponse?.data?.responseBody?.path || 
        uploadResponse?.path || 
        uploadResponse?.url || 
        '';

      if (!uploadedPath) {
        throw new Error('Failed to upload image');
      }

      // Step 2: Add uploaded image to gallery
      // Determine profile type (SELLER or BUYER)
      const profileType = 'SELLER'; // You may need to get this from user context

      await ApiService.post('/gallery', {
        url: uploadedPath,
        profileType: profileType,
      });

      Alert.alert('Success', 'Picture added to Gallery successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert(
        'Upload failed',
        error?.response?.data?.responseMessage || 
        error?.message || 
        'Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = () => {
    pickImage();
  };

  const handleDelete = () => {
    setImageUri('');
  };

  return (
    <View
      className="flex-1 pt-12"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: theme.chip }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: theme.text }}
        >
          Add To Gallery
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Description */}
        <Text
          className="mb-6 text-center text-sm leading-5"
          style={{ color: theme.muted }}
        >
          Upload new images to your gallery. This helps customers see your
          printed works and helps them decide to work with you
        </Text>

        {/* Image Upload Area */}
        {imageUri ? (
          // Display uploaded image with controls
          <View className="mb-6">
            <View
              className="overflow-hidden rounded-2xl"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Image
                source={{ uri: imageUri }}
                className="h-64 w-full"
                resizeMode="cover"
              />
            </View>

            {/* Image Controls */}
            <View className="mt-3 flex-row justify-center gap-3">
              <TouchableOpacity
                onPress={handleReplace}
                className="flex-1 flex-row items-center justify-center rounded-full py-3"
                style={{
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Ionicons name="refresh" size={18} color={theme.primary} />
                <Text
                  className="ml-2 text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  Replace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 flex-row items-center justify-center rounded-full py-3"
                style={{
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: '#EF4444',
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="ml-2 text-sm font-semibold text-red-500">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Upload placeholder
          <TouchableOpacity
            onPress={pickImage}
            className="mb-6 items-center justify-center rounded-2xl p-6"
            style={{
              borderWidth: 1,
              borderColor: theme.dashed,
              backgroundColor: theme.surface,
              minHeight: 200,
            }}
          >
            <View
              className="mb-4 h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.chip }}
            >
              <Ionicons name="images-outline" size={40} color={theme.lightPrimary} />
            </View>

            <Text
              className="mb-2 text-base font-semibold"
              style={{ color: theme.lightPrimary }}
            >
              Art Images
            </Text>

            <Text
              className="mb-4 text-xs"
              style={{ color: theme.muted }}
            >
              Upload Dimensions: 1200px by 1200px
            </Text>

            <View
              className="rounded-full px-6 py-2"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-sm font-semibold text-white">
                Upload
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Upload Info Box */}
        <View
          className="mb-6 rounded-xl p-4"
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View className="mb-3 flex-row items-start">
            <Ionicons
              name="information-circle"
              size={20}
              color={theme.primary}
              style={{ marginTop: 2 }}
            />
            <View className="ml-3 flex-1">
              <Text
                className="mb-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Image Guidelines
              </Text>
              <Text className="text-xs leading-5" style={{ color: theme.muted }}>
                • Use high-quality images (1200x1200px recommended){'\n'}
                • Supported formats: JPG, PNG{'\n'}
                • Maximum file size: 5MB{'\n'}
                • Showcase your best printed work
              </Text>
            </View>
          </View>
        </View>

        {/* Add to Gallery Button */}
        <TouchableOpacity
          disabled={uploading || !imageUri}
          onPress={handleUpload}
          className="rounded-full py-4 disabled:opacity-50"
          style={{ backgroundColor: theme.primary }}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-center text-base font-bold text-white">
              Add to Gallery
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

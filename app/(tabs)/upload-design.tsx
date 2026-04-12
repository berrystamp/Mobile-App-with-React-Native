import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import ApiService from '@/services/apiClient';

type DraftMock = {
  id?: number;
  name: string;
  category: string;
  availableQty: string;
  colours: string;
  limitedStatus: boolean;
  imageUri: string;
  imagePath: string;
};

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const extractUploadPath = (input: any): string =>
  String(
    input?.path ||
      input?.originalFilePath ||
      input?.previewPath ||
      input?.thumbnailPath ||
      input?.url ||
      input?.originalUrl ||
      '',
  ).trim();

const unwrapBody = (response: any) => response?.responseBody || response?.data || response || {};

const createEmptyMock = (): DraftMock => ({
  name: '',
  category: '',
  availableQty: '',
  colours: '',
  limitedStatus: false,
  imageUri: '',
  imagePath: '',
});

export default function UploadDesignScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const isEditing = Boolean(designId);
  const isDark = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(Boolean(designId));
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [printerId, setPrinterId] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState('');
  const [openForCustomization, setOpenForCustomization] = useState(true);
  const [frontImageUri, setFrontImageUri] = useState('');
  const [frontImagePath, setFrontImagePath] = useState('');
  const [designUploadUris, setDesignUploadUris] = useState<string[]>([]);
  const [existingDesignUploads, setExistingDesignUploads] = useState<string[]>([]);
  const [mocks, setMocks] = useState<DraftMock[]>([createEmptyMock()]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#111113' : '#F6F6F8',
      surface: isDark ? '#1A1A1E' : '#FFFFFF',
      text: isDark ? '#F3F3F5' : '#282433',
      muted: isDark ? '#A9A9B1' : '#7A7687',
      border: isDark ? '#2B2B31' : '#E9E6F3',
      primary: '#4732A1',
      chip: isDark ? '#252533' : '#F3F0FF',
    }),
    [isDark],
  );

  useEffect(() => {
    if (!designId) return;

    const loadDesign = async () => {
      try {
        setLoading(true);
        const response = await ApiService.fetchDesignById(Number(designId));
        const design = unwrapBody(response);
        const loadedMocks = Array.isArray(design?.mocks) && design.mocks.length
          ? design.mocks.map((item: any) => ({
              id: item?.id,
              name: String(item?.name || ''),
              category: String(item?.category || ''),
              availableQty: String(item?.availableQty ?? ''),
              colours: Array.isArray(item?.colours) ? item.colours.join(', ') : '',
              limitedStatus: Boolean(item?.limitedStatus),
              imageUri: String(item?.imageUrl || item?.previewImageUrl || item?.thumbnailImageUrl || item?.image?.url || ''),
              imagePath: String(item?.imageUrl || item?.image?.path || ''),
            }))
          : [createEmptyMock()];

        setName(String(design?.name || ''));
        setDescription(String(design?.description || ''));
        setAmount(String(design?.amount ?? ''));
        setPrinterId(String(design?.printer?.id ?? ''));
        setTags(Array.isArray(design?.tags) ? design.tags.join(', ') : '');
        setCategories(Array.isArray(design?.categories) ? design.categories.join(', ') : '');
        setOpenForCustomization(Boolean(design?.openForCustomization));
        setFrontImageUri(String(design?.imageUrlFront || design?.previewUrlFront || design?.thumbnailUrlFront || design?.coverImage?.url || ''));
        setFrontImagePath(String(design?.imageUrlFront || design?.coverImage?.path || ''));
        setExistingDesignUploads(Array.isArray(design?.designUploads) ? design.designUploads.map((item: any) => String(item?.fileUpload?.url || item?.fileUpload?.path || '')).filter(Boolean) : []);
        setMocks(loadedMocks);
      } catch (error: any) {
        Alert.alert('Unable to load design', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDesign();
  }, [designId]);

  const requestPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos to continue.');
      return false;
    }
    return true;
  };

  const pickSingleImage = async (onSelect: (uri: string) => void) => {
    const allowed = await requestPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSelect(result.assets[0].uri);
    }
  };

  const addDesignUploads = async () => {
    const allowed = await requestPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const nextUris = result.assets.map((asset) => asset.uri).filter(Boolean);
      setDesignUploadUris((current) => [...current, ...nextUris]);
    }
  };

  const updateMock = (index: number, patch: Partial<DraftMock>) => {
    setMocks((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const addMock = () => setMocks((current) => [...current, createEmptyMock()]);

  const removeMock = (index: number) => {
    setMocks((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const validate = () => {
    if (!name.trim()) return 'Design name is required.';
    if (!description.trim()) return 'Description is required.';
    if (!amount.trim()) return 'Amount is required.';
    if (!frontImageUri && !frontImagePath) return 'Please select a front image.';
    if (!designUploadUris.length && !existingDesignUploads.length) return 'Upload at least 1 design image.';
    if (!mocks.length) return 'Add at least one mock.';

    for (const [index, mock] of mocks.entries()) {
      if (!mock.name.trim()) return `Mock ${index + 1}: name is required.`;
      if (!mock.category.trim()) return `Mock ${index + 1}: category is required.`;
      if (!mock.imageUri && !mock.imagePath) return `Mock ${index + 1}: image is required.`;
    }

    return '';
  };

  const handleSubmit = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      Alert.alert('Incomplete design', validationMessage);
      return;
    }

    try {
      setSubmitting(true);

      let nextFrontImagePath = frontImagePath;
      if (frontImageUri && !frontImageUri.startsWith('http') && frontImageUri !== frontImagePath) {
        nextFrontImagePath = extractUploadPath(await ApiService.uploadSingleFile(frontImageUri));
      }

      const uploadedDesignImagePaths: string[] = [];
      for (const uri of designUploadUris) {
        const upload = await ApiService.uploadSingleFile(uri);
        const uploadedPath = extractUploadPath(upload);
        if (uploadedPath) uploadedDesignImagePaths.push(uploadedPath);
      }

      const normalizedMocks = [] as {
        source: DraftMock;
        payload: {
          limitedStatus: boolean;
          imageUrl: string;
          availableQty: number;
          name: string;
          category: string;
          colours: string[];
        };
      }[];

      for (const mock of mocks) {
        let imagePath = mock.imagePath;
        if (mock.imageUri && !mock.imageUri.startsWith('http') && mock.imageUri !== mock.imagePath) {
          imagePath = extractUploadPath(await ApiService.uploadSingleFile(mock.imageUri));
        }

        normalizedMocks.push({
          source: mock,
          payload: {
            limitedStatus: mock.limitedStatus,
            imageUrl: imagePath,
            availableQty: Number(mock.availableQty || 0),
            name: mock.name.trim(),
            category: mock.category.trim(),
            colours: splitCsv(mock.colours),
          },
        });
      }

      const [primaryMock, ...additionalMocks] = normalizedMocks;
      const designPayload = {
        name: name.trim(),
        frontImageUrl: nextFrontImagePath,
        designImages: isEditing ? [] : uploadedDesignImagePaths,
        description: description.trim(),
        printerId: printerId.trim() ? Number(printerId) : undefined,
        openForCustomization,
        amount: Number(amount),
        mocks: primaryMock ? [primaryMock.payload] : [],
        tags: splitCsv(tags),
        categories: splitCsv(categories),
      };

      const response = isEditing
        ? await ApiService.updateCustomDesign(String(designId), designPayload)
        : await ApiService.createDesign(designPayload);

      const savedDesign = unwrapBody(response);
      const savedDesignId = String(savedDesign?.id || designId || '');

      for (const item of additionalMocks) {
        if (!item.source.id && savedDesignId) {
          await ApiService.addDesignMock(savedDesignId, item.payload);
        }
      }

      for (const imagePath of uploadedDesignImagePaths) {
        if (savedDesignId && isEditing) {
          await ApiService.uploadDesignAsset(savedDesignId, imagePath);
        }
      }

      Alert.alert('Success', isEditing ? 'Design updated successfully.' : 'Design created successfully.');
      router.replace('/my-shop');
    } catch (error: any) {
      Alert.alert('Unable to save design', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderImagePicker = ({
    label,
    uri,
    onPress,
    onClear,
  }: {
    label: string;
    uri: string;
    onPress: () => void;
    onClear?: () => void;
  }) => (
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {uri ? <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" /> : null}
      <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.chip }]} onPress={onPress}>
        <Text style={{ color: theme.primary, fontWeight: '700' }}>{uri ? 'Replace image' : 'Choose image'}</Text>
      </TouchableOpacity>
      {uri && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={{ color: '#D14343', fontWeight: '600' }}>Remove</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{isEditing ? 'Update Design' : 'Create Design'}</Text>
          <View style={styles.backButtonSpacer} />
        </View>

        {renderImagePicker({
          label: 'Front image',
          uri: frontImageUri,
          onPress: () => pickSingleImage((uri) => {
            setFrontImageUri(uri);
            setFrontImagePath('');
          }),
          onClear: () => {
            setFrontImageUri('');
            setFrontImagePath('');
          },
        })}

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Design details</Text>
          <Input label="Name" value={name} onChangeText={setName} theme={theme} />
          <Input label="Description" value={description} onChangeText={setDescription} multiline theme={theme} />
          <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" theme={theme} />
          <Input label="Printer ID (optional)" value={printerId} onChangeText={setPrinterId} keyboardType="numeric" theme={theme} />
          <Input label="Tags" value={tags} onChangeText={setTags} placeholder="streetwear, summer" theme={theme} />
          <Input label="Categories" value={categories} onChangeText={setCategories} placeholder="Tshirt, Urban" theme={theme} />
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>Open for customization</Text>
            <Switch value={openForCustomization} onValueChange={setOpenForCustomization} trackColor={{ false: '#CFCFD6', true: theme.primary }} />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Design uploads</Text>
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.chip }]} onPress={addDesignUploads}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Add upload</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.helper, { color: theme.muted }]}>Upload at least one design image.</Text>
          {existingDesignUploads.map((uri, index) => (
            <View key={`existing-${uri}-${index}`} style={styles.uploadRow}>
              <Image source={{ uri }} style={styles.extraPreview} resizeMode="cover" />
              <Text style={{ color: theme.muted, flex: 1 }}>Existing upload</Text>
            </View>
          ))}
          {designUploadUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.uploadRow}>
              <Image source={{ uri }} style={styles.extraPreview} resizeMode="cover" />
              <TouchableOpacity onPress={() => setDesignUploadUris((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                <Text style={{ color: '#D14343', fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Mocks</Text>
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.chip }]} onPress={addMock}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Add mock</Text>
            </TouchableOpacity>
          </View>

          {mocks.map((mock, index) => (
            <View key={`mock-${mock.id || index}`} style={[styles.mockCard, { borderColor: theme.border }]}>
              <View style={styles.mockHeader}>
                <Text style={[styles.mockTitle, { color: theme.text }]}>Mock {index + 1}</Text>
                {mocks.length > 1 ? (
                  <TouchableOpacity onPress={() => removeMock(index)}>
                    <Text style={{ color: '#D14343', fontWeight: '600' }}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {renderImagePicker({
                label: 'Mock image',
                uri: mock.imageUri,
                onPress: () => pickSingleImage((uri) => updateMock(index, { imageUri: uri, imagePath: '' })),
                onClear: () => updateMock(index, { imageUri: '', imagePath: '' }),
              })}

              <Input label="Mock name" value={mock.name} onChangeText={(value) => updateMock(index, { name: value })} theme={theme} />
              <Input label="Mock category" value={mock.category} onChangeText={(value) => updateMock(index, { category: value })} theme={theme} />
              <Input label="Available quantity" value={mock.availableQty} onChangeText={(value) => updateMock(index, { availableQty: value })} keyboardType="numeric" theme={theme} />
              <Input label="Colours" value={mock.colours} onChangeText={(value) => updateMock(index, { colours: value })} placeholder="Black, White, Red" theme={theme} />
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Limited stock</Text>
                <Switch value={mock.limitedStatus} onValueChange={(value) => updateMock(index, { limitedStatus: value })} trackColor={{ false: '#CFCFD6', true: theme.primary }} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}> 
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]} disabled={submitting} onPress={handleSubmit}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditing ? 'Update Design' : 'Create Design'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Input({
  label,
  theme,
  multiline,
  ...props
}: {
  label: string;
  theme: { text: string; muted: string; border: string; surface: string };
  multiline?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            height: multiline ? 110 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backButtonSpacer: { width: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  section: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  helper: { fontSize: 13, marginBottom: 12 },
  previewImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 12 },
  pickerButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  smallButton: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  clearButton: { marginTop: 12, alignSelf: 'flex-start' },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  extraPreview: { width: 56, height: 56, borderRadius: 10 },
  mockCard: { borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 12 },
  mockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  mockTitle: { fontSize: 15, fontWeight: '700' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopWidth: 1 },
  submitButton: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

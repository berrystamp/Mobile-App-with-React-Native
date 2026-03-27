import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatNaira } from '@/lib/currency';
import { normalizeDesignListResponse } from '@/lib/designs';
import { CustomDesignRecord, toCustomDesignRecord } from '@/lib/customDesign';
import ApiService from '@/services/apiClient';

export default function CustomDesignsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<CustomDesignRecord[]>([]);
  const [selected, setSelected] = useState<CustomDesignRecord | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const loadDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCustomDesigns(0, 50);
      const normalized = normalizeDesignListResponse(response).map(toCustomDesignRecord);
      setDesigns(normalized);
    } catch (error) {
      console.error('Failed to load custom designs', error);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const formattedCount = useMemo(() => `(${designs.length})`, [designs.length]);

  const clearAll = () => {
    setDesigns([]);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected) return;

    const existing = [...designs];
    setDesigns((current) => current.filter((item) => item.id !== selected.id));
    setShowDeletePrompt(false);
    setShowActions(false);

    try {
      await ApiService.deleteCustomDesign(selected.designId);
      setSelected(null);
    } catch (error) {
      console.error('Unable to delete design', error);
      setDesigns(existing);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading custom designs..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/profile'))}>
          <Ionicons name="arrow-back" size={24} color="#2A2338" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Designs <Text style={styles.count}>{formattedCount}</Text></Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      {designs.length ? (
        <FlatList
          data={designs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imagePath }} style={styles.thumbnail} />
              <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.meta} numberOfLines={1}>By {item.designerName}</Text>
                <Text style={styles.price}>{formatNaira(item.price)}</Text>
              </View>

              <View style={styles.trailing}>
                <TouchableOpacity
                  onPress={() => {
                    setSelected(item);
                    setShowActions(true);
                  }}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#6E6780" />
                </TouchableOpacity>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={90} color="#C8C3D4" />
          <Text style={styles.emptyTitle}>No Custom Design Yet</Text>
          <Text style={styles.emptyBody}>Click the custom design button to personalize your designs.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.newButton} onPress={() => router.push('/custom-design')}>
        <Text style={styles.newButtonText}>New Custom Design</Text>
      </TouchableOpacity>

      <Modal transparent visible={showActions} animationType="slide" onRequestClose={() => setShowActions(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowActions(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setShowActions(false);
                if (selected) {
                  router.push({
                    pathname: '/products',
                    params: { designId: String(selected.designId) },
                  });
                }
              }}>
              <Text style={styles.sheetText}>Print design</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => setShowActions(false)}>
              <Text style={styles.sheetText}>Upload to marketplace</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setShowActions(false);
                setShowDeletePrompt(true);
              }}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={showDeletePrompt} animationType="fade" onRequestClose={() => setShowDeletePrompt(false)}>
        <View style={styles.overlayCenter}>
          <View style={styles.dialog}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDeletePrompt(false)}>
              <Ionicons name="close" size={22} color="#40384F" />
            </TouchableOpacity>
            <Text style={styles.dialogTitle}>Delete design?</Text>
            <Text style={styles.dialogBody}>Are you sure you want to delete this design? You won&apos;t see it in your database again.</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F4F8' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '600', color: '#2A2338' },
  count: { color: '#1E5CCB' },
  clear: { color: '#E4A7AF', fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#EEEBF5' },
  thumbnail: { width: 80, height: 60, borderRadius: 6, backgroundColor: '#F4F4F4' },
  content: { flex: 1, marginLeft: 12 },
  name: { fontSize: 17, fontWeight: '500', color: '#2E2A38' },
  meta: { fontSize: 14, color: '#8D879A', marginTop: 2 },
  price: { marginTop: 4, fontSize: 18, color: '#2F258C', fontWeight: '700' },
  trailing: { alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 56 },
  date: { fontSize: 12, color: '#8D879A', marginTop: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { marginTop: 18, fontSize: 32, color: '#2A2338', fontWeight: '500' },
  emptyBody: { marginTop: 8, textAlign: 'center', color: '#8E889A', fontSize: 17, lineHeight: 24 },
  newButton: { position: 'absolute', bottom: 34, left: 20, right: 20, borderRadius: 30, backgroundColor: '#3C2D90', alignItems: 'center', paddingVertical: 16 },
  newButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(26, 18, 34, 0.2)', justifyContent: 'flex-end' },
  overlayCenter: { flex: 1, backgroundColor: 'rgba(12, 8, 18, 0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 22 },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 28 },
  sheetHandle: { width: 50, height: 5, borderRadius: 6, backgroundColor: '#DAD3E8', alignSelf: 'center', marginTop: 10, marginBottom: 14 },
  sheetItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0EBF7' },
  sheetText: { fontSize: 18, color: '#2E2A38' },
  deleteText: { fontSize: 18, color: '#EB5A56' },
  dialog: { width: '100%', maxWidth: 420, borderRadius: 34, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  closeButton: { alignSelf: 'flex-end' },
  dialogTitle: { textAlign: 'center', fontSize: 34, color: '#2C2733', fontWeight: '500' },
  dialogBody: { marginTop: 18, textAlign: 'center', color: '#524B5E', fontSize: 21, lineHeight: 31 },
  deleteButton: { marginTop: 24, borderRadius: 30, backgroundColor: '#EE5757', alignItems: 'center', paddingVertical: 16 },
  deleteButtonText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});

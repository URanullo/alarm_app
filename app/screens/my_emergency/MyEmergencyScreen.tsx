import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { db } from '../../services/firebaseConfig';
import { useUser } from '../../UserContext';

type ResidentEmergency = {
  id?: string;
  barangay: string;
  contactNumber: string;
  dateTime: string;
  description: string;
  email: string;
  images?: string[];
  location: string;
  priority: string;
  reportedBy: string;
  status: string;
  type: string;
};

export default function MyEmergencyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [residentEmergency, setResidentEmergency] = useState<ResidentEmergency[]>([]);

  const numColumns = useMemo(() => {
    if (width >= 1000) return 3;
    if (width >= 700) return 2;
    return 1;
  }, [width]);

  useEffect(() => {
    if (!user?.email) return;

    const baseQuery = query(
      collection(db, 'resident_emergency_reports'),
      where('email', '==', user.email),
    );

    const unsub = onSnapshot(
      baseQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        items.sort((a, b) => {
          const dateA = new Date(a.dateTime.seconds * 1000 || a.dateTime).getTime();
          const dateB = new Date(b.dateTime.seconds * 1000 || b.dateTime).getTime();
          return dateB - dateA; // descending
        });
        setResidentEmergency(items);
        setLoading(false);
        setRefreshing(false);
      },
      (_err) => {
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsub();
  }, [user?.email]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '#9c27b0';
      case 'High':
        return '#f44336';
      case 'Medium':
        return '#ff9800';
      case 'Low':
        return '#4caf50';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#ff9800';
      case 'Responded':
        return '#2196f3';
      case 'Resolved':
        return '#4caf50';
      default:
        return '#f3f4f6';
    }
  };

  const renderCard = ({ item }: { item: ResidentEmergency }) => (
    <View style={[styles.card, { flex: 1 / numColumns }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Ionicons name="alert" size={16} color="#fff" />
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.titleText}>{item.type}</Text>
      <Text style={styles.bodyText}>{item.description}</Text>

      {/* Meta Info */}
      <View style={styles.metaRow}>
        <Ionicons name="call" size={16} color="#4b5563" />
        <Text style={styles.metaText}>Contact: {item.contactNumber}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location" size={16} color="#4b5563" />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="time" size={16} color="#4b5563" />
        <Text style={styles.metaText}>{formatTimestamp(item.dateTime)}</Text>
      </View>

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <View style={styles.imageStrip}>
          {item.images.slice(0, 3).map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.imageThumb} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={residentEmergency}
          key={numColumns}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          numColumns={numColumns}
          renderItem={renderCard}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
          ListEmptyComponent={<Text style={styles.bodyText}>No emergency reports found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

// 🕓 Format Firestore/ISO date string
function formatTimestamp(ts?: { seconds: number; nanoseconds: number } | string | null) {
  if (!ts) return '';
  let date: Date;
  if (typeof ts === 'string') date = new Date(ts);
  else if (typeof ts === 'object' && 'seconds' in ts) date = new Date(ts.seconds * 1000);
  else return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#eef2ff',
  },
  screenTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 12 },
  columnWrap: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  titleText: { marginTop: 10, fontSize: 16, fontWeight: '700', color: '#111827' },
  bodyText: { marginTop: 6, fontSize: 14, color: '#374151' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  metaText: { fontSize: 13, color: '#374151' },
  imageStrip: { marginTop: 10, flexDirection: 'row', gap: 6 },
  imageThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#e5e7eb' },
  footerRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

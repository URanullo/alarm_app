import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
    View
} from 'react-native';
import { useUser } from '../UserContext';
import { db } from './firebaseConfig';

type Emergency = {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  title?: string | null;
  body?: string | null;
  type: string;
  description?: string | null;
  location?: string | null;
  priority?: string | null;
  images?: string[];
  status?: 'Pending' | 'Responded' | 'Resolved' | string;
  receivedAt?: { seconds: number; nanoseconds: number } | null;
  reportedAt?: { seconds: number; nanoseconds: number } | null;
  reporter?: { name?: string; photoURL?: string } | null;
};

function formatTimestamp(ts?: { seconds: number; nanoseconds: number } | null) {
  if (!ts) return '';
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString();
}

export default function EmergencyCasesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  const numColumns = useMemo(() => {
    if (width >= 1000) return 3;
    if (width >= 700) return 2;
    return 1;
  }, [width]);

  useEffect(() => {
    const baseQuery = query(
      collection(db, 'EmergencyCases'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(baseQuery, (snap) => {
      const items: Emergency[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setEmergencies(items);
      setLoading(false);
      setRefreshing(false);
    }, (_err) => {
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const renderCard = ({ item }: { item: Emergency }) => {
    return (
      <View style={[styles.card, { flex: 1 / numColumns }]}> 
        <View style={styles.headerRow}>
          <View style={styles.typeBadge}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.typeText}>{(item as any).alarmType || 'ALERT'}</Text>
          </View>
          <View style={[styles.statusPill, 
            item.status === 'Resolved' ? styles.statusResolved :
            item.status === 'Responded' ? styles.statusResponded :
            styles.statusPending
          ]}>
            <Text style={styles.statusText}>{(item as any).alarmLevel || 'Medium'}</Text>
          </View>
        </View>

        <Text style={styles.titleText} numberOfLines={2}>Emergency Alert</Text>
        {((item as any).message) ? <Text style={styles.bodyText} numberOfLines={3}>{(item as any).message}</Text> : null}

        <View style={styles.metaRow}>
          <View style={styles.avatar}>
            {item.reporter?.photoURL ? (
              <Image source={{ uri: item.reporter.photoURL }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person-circle" size={28} color="#9aa3af" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reporterName} numberOfLines={1}>{item.reporter?.name || item.userEmail || 'Unknown Reporter'}</Text>
            <Text style={styles.dateText}>{formatTimestamp(item.receivedAt || item.reportedAt)}</Text>
          </View>
        </View>

        {item.images && item.images.length > 0 ? (
          <View style={styles.imageStrip}>
            {item.images.slice(0, 3).map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.imageThumb} />
            ))}
          </View>
        ) : null}

        {item.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{(item as any).alarmLevel || 'Medium'}</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8}>
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={styles.ctaText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Emergency Cases</Text>
        <View style={{ width: 32 }} />
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={emergencies}
          key={numColumns}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
          contentContainerStyle={styles.listContent}
          renderItem={renderCard}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.bodyText}>No emergencies yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb'
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#eef2ff'
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 12
  },
  columnWrap: {
    gap: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ef4444'
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  statusPending: { backgroundColor: '#fde68a' },
  statusResponded: { backgroundColor: '#bfdbfe' },
  statusResolved: { backgroundColor: '#bbf7d0' },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827'
  },
  titleText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  bodyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#374151'
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6'
  },
  avatarImg: {
    width: 32,
    height: 32
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280'
  },
  reporterName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600'
  },
  imageStrip: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 6
  },
  imageThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#e5e7eb'
  },
  locationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  locationText: {
    fontSize: 13,
    color: '#374151'
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e5e7eb'
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827'
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb'
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  }
});



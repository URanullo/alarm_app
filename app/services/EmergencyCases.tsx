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
import { db } from './firebaseConfig';

type AdminAlarm = {
  id: string;
  title: string;
  message: string;
  alarmType: string;
  alarmLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  location?: string;
  images?: string[];
  status: 'Active' | 'Acknowledged' | 'Resolved';
  sentBy: string; // Admin name
  sentAt: { seconds: number; nanoseconds: number };
  expiresAt?: { seconds: number; nanoseconds: number };
  targetAudience?: 'All' | 'Specific' | 'Barangay';
  targetBarangays?: string[];
  isUrgent: boolean;
  instructions?: string;
};

function formatTimestamp(ts?: { seconds: number; nanoseconds: number } | null) {
  if (!ts) return '';
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString();
}

export default function EmergencyCasesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminAlarms, setAdminAlarms] = useState<AdminAlarm[]>([]);

  const numColumns = useMemo(() => {
    if (width >= 1000) return 3;
    if (width >= 700) return 2;
    return 1;
  }, [width]);

  useEffect(() => {
    // Read from AdminAlarms collection instead of EmergencyCases
    const baseQuery = query(
      collection(db, 'AdminAlarms'),
      orderBy('sentAt', 'desc')
    );
    const unsub = onSnapshot(baseQuery, (snap) => {
      const items: AdminAlarm[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setAdminAlarms(items);
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

  const renderCard = ({ item }: { item: AdminAlarm }) => {
    const getAlarmLevelColor = (level: string) => {
      switch (level) {
        case 'Critical': return '#dc2626';
        case 'High': return '#ea580c';
        case 'Medium': return '#d97706';
        case 'Low': return '#16a34a';
        default: return '#6b7280';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Active': return '#fde68a';
        case 'Acknowledged': return '#bfdbfe';
        case 'Resolved': return '#bbf7d0';
        default: return '#f3f4f6';
      }
    };

    return (
      <View style={[styles.card, { flex: 1 / numColumns }]}> 
        <View style={styles.headerRow}>
          <View style={[styles.typeBadge, { backgroundColor: getAlarmLevelColor(item.alarmLevel) }]}>
            <Ionicons name="megaphone" size={16} color="#fff" />
            <Text style={styles.typeText}>{item.alarmType}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bodyText} numberOfLines={3}>{item.message}</Text>

        <View style={styles.metaRow}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={28} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reporterName} numberOfLines={1}>Admin: {item.sentBy}</Text>
            <Text style={styles.dateText}>{formatTimestamp(item.sentAt)}</Text>
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

        {item.instructions ? (
          <View style={styles.instructionsRow}>
            <Ionicons name="information-circle" size={16} color="#6b7280" />
            <Text style={styles.instructionsText} numberOfLines={2}>{item.instructions}</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={[styles.priorityBadge, { backgroundColor: getAlarmLevelColor(item.alarmLevel) }]}>
            <Text style={[styles.priorityText, { color: '#fff' }]}>{item.alarmLevel}</Text>
          </View>
          <TouchableOpacity style={[styles.ctaBtn, item.isUrgent && styles.urgentBtn]} activeOpacity={0.8}>
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={styles.ctaText}>{item.isUrgent ? 'URGENT' : 'View Details'}</Text>
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
        <Text style={styles.screenTitle}>Admin Alarms</Text>
        <View style={{ width: 32 }} />
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={adminAlarms}
          key={numColumns}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
          contentContainerStyle={styles.listContent}
          renderItem={renderCard}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.bodyText}>No admin alarms yet.</Text>}
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
  },
  instructionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic'
  },
  urgentBtn: {
    backgroundColor: '#dc2626'
  }
});



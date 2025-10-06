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
import { db } from '../../services/firebaseConfig';


type AdminNewsReport = {
  body: string;
  title: string;
  alarmLevel: string;
  data: {
    alarmLevel: string;
    clientDateTime: string;
    description: string;
    reportedBy: string;
    type: string;
  };
};

function formatTimestamp(
  ts?: { seconds: number; nanoseconds: number } | string | null
) {
  if (!ts) return '';

  let date: Date;

  if (typeof ts === 'string') {
    date = new Date(ts);
  } else if (typeof ts === 'object' && 'seconds' in ts) {
    date = new Date(ts.seconds * 1000);
  } else {
    return '';
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
export default function NewsReportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminNews, setAdminNews] = useState<AdminNewsReport[]>([]);

  const numColumns = useMemo(() => {
    if (width >= 1000) return 3;
    if (width >= 700) return 2;
    return 1;
  }, [width]);

  useEffect(() => {
    const baseQuery = query(
      collection(db, 'admin_news_report'),
    );
    const unsub = onSnapshot(baseQuery, (snap) => {
      const items: AdminNewsReport[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setAdminNews(items);
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

  const renderCard = ({ item }: { item: AdminNewsReport }) => {
    const getAlarmLevelColor = (level: string) => {
      switch (level) {
        case 'Advisory': return '#2e7d32';
        case 'Alert': return '#fdd835';
        case 'Warning': return '#fb8c00';
        case 'Evacuation': return '#e53935';
        case 'Emergency': return '#000000';
        default: return '#6b7280';
      }
    };

    return (
      <View style={[styles.card, { flex: 1 / numColumns }]}>
        {/* Alarm level badge */}
        <View style={[styles.typeBadge, { backgroundColor: getAlarmLevelColor(item.alarmLevel) }]}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.typeText}>{item.alarmLevel}</Text>
        </View>

        {/* Title & Body */}
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.bodyText}>{item.body}</Text>

        {/* Nested Data Section */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.reporterName}>Details:</Text>
          <Text style={styles.bodyText}>Type: {item.data?.type ?? 'N/A'}</Text>
          <Text style={styles.bodyText}>Description: {item.data?.description ?? 'N/A'}</Text>
          <Text style={styles.bodyText}>Reported By: {item.data?.reportedBy ?? 'N/A'}</Text>
          <Text style={styles.bodyText}>Reported Date: {formatTimestamp(item.data?.clientDateTime) ?? 'N/A'}</Text>
          <Text style={styles.bodyText}>Alarm Level (Nested): {item.data?.alarmLevel ?? 'N/A'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={adminNews}
          key={numColumns}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          numColumns={numColumns}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.bodyText}>No reports yet.</Text>}
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



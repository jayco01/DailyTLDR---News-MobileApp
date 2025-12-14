import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { getBookmarks, removeBookmark } from '../services/BookmarkService';
import { colors } from '../theme/colors';

const BookmarksPage = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(SettingsContext);

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const data = await getBookmarks(user.uid);
      const processed = data.map(d => {
        const createdAtDate =
          d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : null;
        const displayDate = createdAtDate ? createdAtDate.toDateString() : 'Saved';
        return { ...d, displayDate };
      });
      setBookmarks(processed);
    } catch (e) {
      Alert.alert('Error', 'Could not load bookmarks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [user])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
  };

  const handleRemove = (digestId) => {
    Alert.alert(
      'Remove bookmark?',
      'This will delete it from your saved list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(user.uid, digestId);
              setBookmarks(prev => prev.filter(b => b.id !== digestId));
            } catch (e) {
              Alert.alert('Error', 'Could not remove bookmark.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={[styles.date, { color: theme.mutedText }]}>{item.displayDate}</Text>
          <Text style={[styles.topic, { color: theme.text }]}>
            {(item.topic || 'Bookmark').toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.iconBtn}>
          <Icon name="delete" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      {!!item.overall_key_takeaways?.length && (
        <View style={styles.takeaways}>
          {item.overall_key_takeaways.slice(0, 3).map((point, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.bulletText, { color: theme.text }]}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={[styles.pill, { backgroundColor: colors.primary }]}>
          <Icon name="bookmark" size={16} color={colors.white} />
          <Text style={styles.pillText}>Saved</Text>
        </View>

        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.footerAction}>
          <Text style={[styles.footerActionText, { color: theme.mutedText }]}>Remove</Text>
          <Icon name="chevron-right" size={18} color={theme.mutedText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.text }]}>Bookmarks</Text>

        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.icon} />
          ) : (
            <Icon name="refresh" size={22} color={theme.icon} />
          )}
        </TouchableOpacity>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="bookmark-border" size={48} color={theme.mutedText} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptySub, { color: theme.mutedText }]}>
            Save a digest from Home to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
  },

  refreshBtn: {
    padding: 6,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  cardLeft: { flex: 1, paddingRight: 10 },

  date: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },

  topic: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  iconBtn: { paddingLeft: 8, paddingVertical: 4 },

  takeaways: { marginTop: 6 },

  bulletRow: { flexDirection: 'row', marginBottom: 8 },
  bullet: {
    color: colors.primary,
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: { fontSize: 14, lineHeight: 22, flex: 1, fontWeight: '600' },

  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  pillText: {
    color: colors.white,
    fontWeight: '800',
    marginLeft: 6,
    fontSize: 12,
  },

  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerActionText: {
    fontWeight: '700',
    marginRight: 2,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '900',
  },

  emptySub: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default BookmarksPage;

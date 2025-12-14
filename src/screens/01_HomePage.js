import { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { getWeeklyDigests, triggerManualDigest } from '../services/DigestService';
import { addBookmark, removeBookmark, getBookmarks } from '../services/BookmarkService';
import HomeArticleCard from '../components/HomeArticleCard';
import { colors } from '../theme/colors';

const HomePage = () => {
  const { user, profile } = useContext(AuthContext);
  const { isTTSEnabled, speak, stopSpeaking, isSpeaking, theme } = useContext(SettingsContext);

  const [allDigests, setAllDigests] = useState([]);
  const [dailyDigests, setDailyDigests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const loadBookmarkedIds = async () => {
    if (!user) return;
    try {
      const saved = await getBookmarks(user.uid);
      setBookmarkedIds(new Set(saved.map(b => b.id)));
    } catch (e) {
      setBookmarkedIds(new Set());
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      const rawData = await getWeeklyDigests(user.uid);

      // Keep only freshest digest per day
      const processed = [];
      const seenDates = new Set();

      rawData.forEach(digest => {
        const dateKey = new Date(digest.createdAt.seconds * 1000).toDateString();

        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          digest.displayDate = dateKey;
          processed.push(digest);
        }
      });

      setDailyDigests(processed);

      setAllDigests(rawData);
    } catch (error) {
      Alert.alert("Error", "Could not load news.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    loadBookmarkedIds();
    }, [user]);

  // Audio Cleanup on Blur
  useFocusEffect(
    useCallback(() => {
      return () => stopSpeaking();
    }, [])
  );


  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerManualDigest(
        user.uid,
        profile?.gemini_settings?.tone,
        profile?.gemini_settings?.format
      );
      setTimeout(async () => {
        await loadData();
        await loadBookmarkedIds();
      }, 2000);
    } catch (error) {
      Alert.alert("Limit Reached", error.message);
      setRefreshing(false);
    }
  };

  const handleBookmark = async () => {
    const current = dailyDigests[currentIndex];

    if (current && user) {
      const digestId = current.id;
      if (!digestId) return;

      const isSavedNow = bookmarkedIds.has(digestId);

      try {
        if (isSavedNow) {
          await removeBookmark(user.uid, digestId);
          setBookmarkedIds(prev => {
            const next = new Set(prev);
            next.delete(digestId);
            return next;
          });
          Alert.alert("Removed", "Bookmark removed.");
        } else {
          await addBookmark(user.uid, current);
          setBookmarkedIds(prev => {
            const next = new Set(prev);
            next.add(digestId);
            return next;
          });
          Alert.alert("Saved", "Digest bookmarked!");
        }
      } catch (e) {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };

  const handleAudio = () => {
    const current = dailyDigests[currentIndex];
    if (isSpeaking) {
      stopSpeaking();
    } else if (current) {
      const text = `Here is your summary for ${current.displayDate}. Topic: ${current.topic}. 
      Key Takeaways: ${current.overall_key_takeaways.join('. ')}.`;
      speak(text);
    }
  };


  const goBack = () => { if (currentIndex < dailyDigests.length - 1) setCurrentIndex(c => c + 1); };
  const goForward = () => { if (currentIndex > 0) setCurrentIndex(c => c - 1); };

  const currentDigest = dailyDigests[currentIndex];
  const isSaved = currentDigest && bookmarkedIds.has(currentDigest.id);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <Text style={[styles.appTitle, { color: theme.text }]}>Daily TL;DR</Text>
        <View style={styles.actionRow}>

          {/* TTS Toggle */}
          {isTTSEnabled && (
            <TouchableOpacity onPress={handleAudio} style={styles.iconBtn}>
              <Icon name={isSpeaking ? "stop-circle" : "volume-up"} size={24} color={isSpeaking ? colors.error : theme.icon} />
            </TouchableOpacity>
          )}

          {/* Refresh */}
          <TouchableOpacity onPress={handleRefresh} style={styles.iconBtn}>
            {refreshing ? <ActivityIndicator size="small" color={theme.icon}/> : <Icon name="refresh" size={24} color={theme.icon} />}
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity onPress={handleBookmark} style={styles.iconBtn}>
            <Icon name={isSaved ? "bookmark" : "bookmark-border"} size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* DIGEST NAVIGATION */}
      <View style={[styles.dateNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={goBack} disabled={currentIndex >= dailyDigests.length - 1}>
          <Icon name="chevron-left" size={30} color={currentIndex >= dailyDigests.length - 1 ? colors.lightest : colors.primary} />
        </TouchableOpacity>

        <View style={styles.dateBadge}>
          <Text style={[styles.dateText, { color: theme.text }]}>{currentDigest ? currentDigest.displayDate : "No Data"}</Text>
        </View>

        <TouchableOpacity onPress={goForward} disabled={currentIndex === 0}>
          <Icon name="chevron-right" size={30} color={currentIndex === 0 ? colors.lightest : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* FEED */}
      {!currentDigest ? (
        <View style={styles.center}>
          <Text style={{color: theme.mutedText, marginBottom: 20}}>No digest for this day.</Text>
        </View>
      ) : (
        <FlatList
          data={currentDigest.article_sections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <HomeArticleCard article={item} />}
          contentContainerStyle={{ padding: 16 }}

          ListHeaderComponent={
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.topicLabel}>{currentDigest.topic.toUpperCase()}</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Key Takeaways</Text>

              {currentDigest.overall_key_takeaways.map((point, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.bulletText, { color: theme.text }]}>{point}</Text>
                </View>
              ))}

              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.background
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.darkest
  },
  actionRow: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15 },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 5
  },
  dateBadge: {
    width: 150,
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkest
  },
  topicLabel: {
    textAlign: 'center',
    color: colors.light,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 10
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  bullet: {
    color: colors.primary,
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22
  },
  bulletText: {
    color: colors.darkest,
    fontSize: 15,
    lineHeight: 22,
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 15
  },
});

export default HomePage;

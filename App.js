import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useState } from 'react';
import { Text, ActivityIndicator, StyleSheet, Button, View , FlatList} from 'react-native';
import {AuthProvider, AuthContext} from './src/contexts/AuthContext';
import {Alert, ScrollView} from "react-native";
import {triggerManualDigest, getLatestDigest} from "./src/services/DigestService";
import ArticleCard from "./src/components/ArticleCard"
import {colors} from './src/theme/colors'
import AppButton from './src/components/AppButton'

const AuthStatus = () => {
  const {user, profile, loading, isNewUser, createProfile} = useContext(AuthContext);
  const [isCreating, setIsCreating] = useState(false);
  const [digestData, setDigestData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createProfile("Jester-Tester");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not create profile.");
    }
    setIsCreating(false);
  };

  const handleGenerate = async () => {
    if(!user) return;

    setGenerating(true);
    setDigestData(null);

    try {
      console.log("triggering cloud functions...")
      await triggerManualDigest();

      console.log("Fetching new data...")
      const data = await getLatestDigest(user.uid);

      console.log("Data Received:", data);

      setDigestData(data);

    } catch (e) {
      Alert.alert("Error", "Generation failed. Check console for Index Link.");
    }
    setGenerating(false);
  }

  if (loading) return <ActivityIndicator size="large" color="blue" />
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.appTitle}>Daily TLDR</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>User Status:</Text>
          <Text style={styles.value}>{isNewUser ? 'Needs Profile' : 'Active'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Topic:</Text>
          <Text style={styles.value}>{profile ? profile.topic : '---'}</Text>
        </View>
      </View>

      {/* ACTION AREA */}
      <View style={styles.actionContainer}>
        {isNewUser ? (
          <AppButton
            title="Create User Profile"
            onPress={handleCreate}
            loading={isCreating}
          />
        ) : (
          <AppButton
            title={generating ? "AI is Reading News..." : "Generate Daily Digest"}
            onPress={handleGenerate}
            loading={generating}
          />
        )}
      </View>

      {/* RESULTS AREA */}
      {digestData && (
        <View style={{ flex: 1, marginTop: 20 }}>
          <Text style={styles.resultHeader}>
            Morning Brief: {digestData.topic}
          </Text>

          <FlatList
            data={digestData.article_sections}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <ArticleCard article={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function App(){
  return (
 <AuthProvider>
   <AuthStatus />
 </AuthProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkest,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: colors.dark,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkest,
  },
  actionContainer: {
    marginBottom: 20,
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkest,
    marginBottom: 5,
  },
  topicBadge: {
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
    paddingBottom: 5,
  },
  bulletDot: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
});
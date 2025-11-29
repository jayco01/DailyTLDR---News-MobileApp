import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useState } from 'react';
import { Text, ActivityIndicator, StyleSheet, Button, View} from 'react-native';
import {AuthProvider, AuthContext} from './src/contexts/AuthContext';
import {Alert, ScrollView} from "react-native";
import {triggerManualDigest, getLatestDigest} from "./src/services/DigestService";

const AuthStatus = () => {
  const {user, profile, loading, isNewUser, createProfile} = useContext(AuthContext);
  const [isCreating, setIsCreating] = useState(false);
  const [digestData, setDigestData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleCreate = async () => {
    if(!user) return;

    setIsCreating(true);

    try {
      console.log("triggering cloud functions...")
      await triggerManualDigest();

      console.log("Fetching new data...")
      const data = await getLatestDigest(user.uid);

      setDigestData(data);

    } catch (e) {
      Alert.alert("Error", "Generation failed. Check console for Index Link.");
    }
    setIsCreating(false);
  }

  if (loading) return <ActivityIndicator size="large" color="blue" />
  return (
    <SafeAreaView>
      <View>
      <Text style={styles.label}>Slice 2: Identity Verification</Text>

      <Text style={styles.label}>User ID:</Text>
      <Text style={styles.value}>{user ? user.uid : 'No User'}</Text>

      <Text style={styles.label}>Is New User?</Text>
      <Text style={styles.value}>{isNewUser ? 'YES (Needs Profile)' : 'NO (Has Profile)'}</Text>

      <Text style={styles.label}>Profile Topic:</Text>
      <Text style={styles.value}>{profile ? profile.topic : 'N/A'}</Text>
      </View>

    {isNewUser && (
      <SafeAreaView>
        <Button
          title={isCreating ? "Creating..." : "Create Test Profile"}
          onPress={handleCreate}
          disabled={isCreating}
        />
      </SafeAreaView>
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
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 10
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  }
});
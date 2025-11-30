import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TextInput} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

const WelcomeSetupPage = () => {
  const { createProfile } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (username.length < 3) {
      Alert.alert("Invalid Input", "Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      await createProfile(username);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create profile. Try again.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Daily TL;DR</Text>
        <Text style={styles.subtitle}>
          Your personalized, distraction-free news digest. Let's get you set up.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Choose a Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. JohnDoe99"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <AppButton
            title="Start Reading"
            onPress={handleSetup}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:
    {
      flex: 1,
      backgroundColor: colors.background
    },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.darkest,
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24
  },
  form: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    elevation: 4
  },
  label: {
    fontWeight: 'bold',
    color: colors.darkest,
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    color: colors.darkest
  }
});

export default WelcomeSetupPage;
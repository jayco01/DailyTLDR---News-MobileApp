import { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsContext } from '../contexts/SettingsContext';

const toneOptions = ['Informative', 'Casual', 'Professional', 'Enthusiastic', 'Witty'];
const formatOptions = ['A concise summary', 'A single paragraph', 'Bullet points', 'A detailed explanation', "Explain like I'm 5"];

const CustomizationPage = () => {
  const { profile, updateProfile, loading } = useAuth();
  const { theme } = useContext(SettingsContext);

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setTopic(profile.topic || '');
      setTone(profile.gemini_settings?.tone || toneOptions[0]);
      setFormat(profile.gemini_settings?.format || formatOptions[0]);
    }
  }, [profile]);

  const handleSave = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError('Topic cannot be empty.');
      return;
    }
    setError('');
    const newSettings = {
      topic: trimmedTopic,
      gemini_settings: { tone, format },
    };
    try {
      await updateProfile(newSettings);
      Alert.alert('Success', 'Your settings have been saved!');
    } catch (error) {
      Alert.alert('Error', 'Could not save settings.');
      console.error(error);
    }
  };

  if (loading || !profile) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Your Profile</Text>
        <Text style={[styles.label, { color: theme.text }]}>Your Username</Text>
        <Text style={[styles.usernameText, { color: theme.mutedText }]}>@{profile.publicUsername}</Text>

        <Text style={[styles.label, { color: theme.text }]}>Your Daily Topic</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          value={topic}
          onChangeText={setTopic}
          placeholder="Enter topic"
          placeholderTextColor={theme.mutedText}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={[styles.label, { color: theme.text }]}>AI Summary Tone</Text>
        <View style={[styles.pickerContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <Picker selectedValue={tone} onValueChange={setTone} style={[styles.picker, { color: theme.text }]}>
            {toneOptions.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>AI Summary Format</Text>
        <View style={[styles.pickerContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <Picker selectedValue={format} onValueChange={setFormat} style={[styles.picker, { color: theme.text }]}>
            {formatOptions.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !topic.trim() && { backgroundColor: colors.light }]}
          onPress={handleSave}
          disabled={!topic.trim()}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.darkest, marginBottom: 20 },
  label: { fontWeight: 'bold', color: colors.darkest, marginBottom: 8 },
  usernameText: { fontSize: 16, marginBottom: 20, color: colors.dark },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: colors.light,
    color: colors.darkest,
  },
  errorText: { color: colors.error, marginBottom: 15 },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: { color: colors.darkest },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default CustomizationPage;

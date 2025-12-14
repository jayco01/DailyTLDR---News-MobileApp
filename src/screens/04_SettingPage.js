import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { SettingsContext } from '../contexts/SettingsContext';
import { colors } from '../theme/colors';

const SettingsPage = () => {
  const { isDarkMode, toggleTheme, isTTSEnabled, toggleTTS, theme } =
    useContext(SettingsContext);

  const switchTrack = {
    false: theme.border,
    true: colors.darkest,
  };
  const switchThumb = colors.white;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>
          Personalize your reading experience
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
              <Icon name="dark-mode" size={20} color={colors.white} />
            </View>

            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.helper, { color: theme.mutedText }]}>
                Reduce brightness for night reading
              </Text>
            </View>
          </View>

          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={switchTrack}
            thumbColor={switchThumb}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* TTS */}
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
              <Icon name="volume-up" size={20} color={colors.white} />
            </View>

            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: theme.text }]}>
                Text-to-Speech
              </Text>
              <Text style={[styles.helper, { color: theme.mutedText }]}>
                Enable audio playback in Home
              </Text>
            </View>
          </View>

          <Switch
            value={isTTSEnabled}
            onValueChange={toggleTTS}
            trackColor={switchTrack}
            thumbColor={switchThumb}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },

  card: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  textBlock: { flex: 1 },
  label: { fontSize: 16, fontWeight: '800' },
  helper: { marginTop: 3, fontSize: 12, fontWeight: '600' },

  divider: {
    height: 1,
    opacity: 0.3,
    marginHorizontal: 14,
  },
});

export default SettingsPage;

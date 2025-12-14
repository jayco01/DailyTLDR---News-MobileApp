import React, { createContext, useState, useEffect, useMemo } from 'react';
import Tts from 'react-native-tts';
import { AppState } from 'react-native';
import { colors } from '../theme/colors';

export const SettingsContext = createContext();
const TTS_RATE = 0.5;
const TTS_PITCH = 1.0;

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    Tts.setDefaultRate(TTS_RATE);
    Tts.setDefaultPitch(TTS_PITCH);

    //Listeners to update state when speech starts/stops
    const startListener = Tts.addEventListener('tts-start', () => setIsSpeaking(true));
    const finishListener = Tts.addEventListener('tts-finish', () => setIsSpeaking(false));
    const cancelListener = Tts.addEventListener('tts-cancel', () => setIsSpeaking(false));

    return () => {
      startListener.remove();
      finishListener.remove();
      cancelListener.remove();
    };
  }, []);

  // Stop audio if app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        stopSpeaking();
      }
    });
    return () => subscription.remove();
  }, []);

  const speak = (text) => {
    if (!isTTSEnabled) return;

    Tts.stop();
    const cleanText = text.replace(/[*#_]/g, ''); // Clean text of markdown for smoother tts reading
    Tts.speak(cleanText);
  };

  const stopSpeaking = () => {
    Tts.stop();
    setIsSpeaking(false);
  };

  const toggleTTS = () => {
    if (isTTSEnabled) stopSpeaking();
    setIsTTSEnabled(prev => !prev);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = useMemo(() => {
    const dark = {
      background: colors.darkest,
      card: colors.dark,
      text: colors.white,
      mutedText: colors.lightest,
      icon: colors.white,
      border: colors.primary,
    };

    const light = {
      background: colors.background,
      card: colors.white,
      text: colors.darkest,
      mutedText: colors.textLight,
      icon: colors.dark,
      border: colors.background,
    };

    return isDarkMode ? dark : light;
  }, [isDarkMode]);

  return (
    <SettingsContext.Provider value={{
      isDarkMode,
      setIsDarkMode,
      toggleTheme,
      theme,
      isTTSEnabled,
      toggleTTS,
      speak,
      stopSpeaking,
      isSpeaking
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

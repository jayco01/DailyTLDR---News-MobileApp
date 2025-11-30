import React, { useContext } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { colors } from './src/theme/colors';

// Screens
import HomePage from './src/screens/01_HomePage';
import WelcomeSetupPage from './src/screens/00_WelcomeSetupPage';
// import CustomizationScreen from './src/screens/03_CustomizationPage';

// Placeholders for your teammates
const BookmarksScreen = () => (
  <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <Text style={{color: colors.dark}}>Bookmarks Page (Coming Soon)</Text>
  </View>
);
const SettingsScreen = () => (
  <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <Text style={{color: colors.dark}}>Settings Page (Coming Soon)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

// Main App Tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'circle';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Bookmarks') iconName = 'bookmark';
          else if (route.name === 'Customize') iconName = 'tune';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      {/*<Tab.Screen name="Customize" component={CustomizationScreen} />*/}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Logic Switcher
const RootNavigator = () => {
  const { user, isNewUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={
        {
          flex:1,
          justifyContent:'center',
          alignItems:'center',
          backgroundColor: colors.background
        }
      }>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {(!user || isNewUser) ? <WelcomeSetupPage /> : <MainTabs />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <RootNavigator />
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
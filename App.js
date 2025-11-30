import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { colors } from './src/theme/colors';

import HomePage from './src/screens/01_HomePage';
// import CustomizationScreen from './src/screens/03_CustomizationPage';
import WelcomeSetupPage from './src/screens/00_WelcomeSetupPage';

// todo: placeholder for future implementation
const BookmarksScreen = () => <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator /></View>;
const SettingsScreen = () => <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator /></View>;

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle:
          {
            paddingBottom: 5,
            height: 60
          },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Bookmarks') iconName = 'collections-bookmark';
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

const RootNavigator = () => {
  const { user, isNewUser, loading } = useContext(AuthContext);

  if (loading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color={colors.primary}/></View>;

  if (!user || isNewUser) return <WelcomeSetupPage />;

  return (
    <NavigationContainer>
      <MainTabs />
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
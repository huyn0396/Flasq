import * as React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeProvider } from "react-native-rapi-ui";

import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import LoadScreen from './LoadScreen';
import SettingsScreen from './SettingsScreen';
import SavedBarsScreen from './SavedBarsScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import DisplayBarScreen from './DisplayBarScreen';
import RegisterScreen from './RegisterScreen';
import ForgetPasswordScreen from './ForgetPasswordScreen';
import { UserContext } from './UserContext';


// Main Navigators
const RootStack = createStackNavigator();     // Root navigation stack
const TabNavigator = createBottomTabNavigator();  // Bottom tab navigator
const HomeStack = createStackNavigator();     // Home screen stack
const ProfileStack = createStackNavigator();  // Profile screen stack

// Stack for Home screens
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="BarDetails" component={DisplayBarScreen} />
    </HomeStack.Navigator>
  );
}

// Stack for Profile and Settings screens
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator for Home, Saved Bars, Notifications, Profile
function MainTabNavigator() {
  return (
    <TabNavigator.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'SavedBars') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false
      })}
    >
      <TabNavigator.Screen name="HomeTab" component={HomeStackNavigator} />
      <TabNavigator.Screen name="SavedBars" component={SavedBarsScreen} />
      <TabNavigator.Screen name="Notifications" component={NotificationsScreen} />
      <TabNavigator.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </TabNavigator.Navigator>
  );
}

// Root Stack Navigator for Initial Load, Login, and Main App
function RootStackNavigator() {
  return (
    <RootStack.Navigator initialRouteName="LoadScreen">
      <RootStack.Screen name="LoadScreen" component={LoadScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="ForgetPassword" component={ForgetPasswordScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="MainApp" component={MainTabNavigator} options={{ headerShown: false }} />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);

  const setProfilePicUrl = (url) => {
    setUser((currentUser) => ({
      ...currentUser,
      profilePicUrl: url
    }));
  };

  return (
    <ThemeProvider theme="light">
      <UserContext.Provider value={{ user, setUser, setProfilePicUrl }}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <NavigationContainer>
          <RootStackNavigator />
        </NavigationContainer>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

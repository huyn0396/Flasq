import * as React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import LoadScreen from './LoadScreen';
import SettingsScreen from '././SettingsScreen';

import { UserContext } from './UserContext';

import SavedBarsScreen from './SavedBarsScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ThemeProvider } from "react-native-rapi-ui";
import DisplayBarScreen from './DisplayBarScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProfileStack = createStackNavigator(); // Create a stack navigator for Profile


function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DisplayBarScreen" component={DisplayBarScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Load">
      <Stack.Screen name="Load" component={LoadScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} /> 

    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Saved Bars') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'ProfileNest' || route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: { display: 'flex' },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={MainStack} options={{ title: '' }} />
      <Tab.Screen name="Saved Bars" component={SavedBarsScreen} options={{ title: '' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: '' }} />
      <Tab.Screen name="ProfileNest" component={ProfileStackScreen}
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        // Prevent default action
                        e.preventDefault();
                        // Navigate to the initial route
                        navigation.navigate('ProfileNest', { screen: 'Profile' });
                    },
                })}/>
    </Tab.Navigator>
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
    <>
      <ThemeProvider theme="light">
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <UserContext.Provider value={{ user, setUser, setProfilePicUrl }}>
          <NavigationContainer>
            <AppStack />
          </NavigationContainer>
        </UserContext.Provider>
      </ThemeProvider>
    </>
  );
}

// BottomTabs.js
import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Dashboard from '../Screens/BottomNavScreens/Dashboard';
import Profile from '../Screens/BottomNavScreens/Profile';
import Settings from '../Screens/BottomNavScreens/Settings';
import { COLORS } from '../../Common/Constants';
import UserProfile from '../Screens/BottomNavScreens/UserProfile';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function DashboardNested() {
  return (

    <HomeStack.Navigator>
      <HomeStack.Screen name="DashboardStack"
        component={Dashboard}
        // options={{ headerShown: false }} 
        options={{
          tabBarLabel: '',
          tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold' },
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          // tabBarBadge: 1,
          // tabBarBadgeStyle: {fontFamily: 'Montserrat-Medium', backgroundColor: 'red'},
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={focused ? 0 : 0} />
          ),
        }} 
        />
      <HomeStack.Screen name="UserProfile"
        component={UserProfile}
        // options={{ headerShown: false }} 
        options={{
          tabBarLabel: 'UserProfile',
          tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold' },
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          // tabBarBadge: 1,
          // tabBarBadgeStyle: {fontFamily: 'Montserrat-Medium', backgroundColor: 'red'},
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={focused ? 30 : 25} />
          ),
        }} />
    </HomeStack.Navigator>

    // <Tab.Navigator>
    //    <Tab.Screen 

    //   />
    //     <Tab.Screen 

    //   />
    // </Tab.Navigator>
  );
}


function BottomTabs() {
  return (
    <Tab.Navigator initialRouteName="Dashboard">
      <Tab.Screen
        name="Dashboard"
        component={DashboardNested}
        // options={{ headerShown: false }} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold' },
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          // tabBarBadge: 1,
          // tabBarBadgeStyle: {fontFamily: 'Montserrat-Medium', backgroundColor: 'red'},
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={focused ? 30 : 25} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold' },
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={focused ? 30 : 25} />
          ),
        }}
      /> */}
      {/* <Tab.Screen 
        name="UserProfile" 
        component={UserProfile} 
        options={{ 
          tabBarLabel: 'User Profile',
          tabBarLabelStyle: {fontFamily: 'Montserrat-SemiBold'},
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={focused ? 30 : 25} />
          ),
        }} 
      /> */}
      {/* <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold' },
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={focused ? 30 : 25} />
          ),
        }}
      /> */}
      {/* <Tab.Screen 
        name="Blank" 
        component={Blank} 
        options={{ 
          tabBarLabel: 'Blank',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="minus" color={color} size={size} />
          ),
        }} 
      /> */}
    </Tab.Navigator>
  );
}

export default BottomTabs;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import LogIn from './src/Presentation/Screens/LogIn';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { COLORS } from './src/Common/Constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/Presentation/Screens/BottomNavScreens/Dashboard';
import Profile from './src/Presentation/Screens/ProfileScreens/Profile';
import AccountSetting from './src/Presentation/Screens/ProfileScreens/AccountSetting';
import BankDetails from './src/Presentation/Screens/ProfileScreens/BankDetails';
// import GeneralSetting from './src/Presentation/Screens/SettingScreens/GeneralSetting';
import CollectionHistory from './src/Presentation/Screens/ProfileScreens/CollectionHistory';
import UserProfile from './src/Presentation/Screens/BottomNavScreens/UserProfile';

// ✅ Error handling
// import { logError } from './src/Common/ErrorLogger';
// import { setJSExceptionHandler } from '@react-native-oh-tpl/react-native-exception-handler';
// import { setNativeExceptionHandler } from 'react-native-exception-handler';

// Disable font scaling
(Text).defaultProps = (Text).defaultProps || {};
(Text).defaultProps.allowFontScaling = false;

(TextInput).defaultProps = (TextInput).defaultProps || {};
(TextInput).defaultProps.allowFontScaling = false;

// Custom theme
const theme = {
  ...DefaultTheme,
  locale: 'en',
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0B69DA',
    primaryContainer: '#5b6593',
    secondaryContainer: '#5b6593',
    outline: "#515a88",
    accent: '#515a88',
    surface: '#424c80',
    backdrop: "rgba(0, 0, 0, 0.4)",
    custom0Container: "red",
    surfaceVariant: COLORS.white,
    onSurfaceVariant: COLORS.primary,
    onSurface: COLORS.primary,
    onPrimaryContainer: 'red',
    onPrimary: COLORS.white,
    text: "green"
  },
};

// ✅ Global JS error handler
// setJSExceptionHandler((error, isFatal) => {
//   logError(error, { type: "JS Exception", isFatal });
// }, true);

// // ✅ Global Native error handler
// setNativeExceptionHandler((errorString) => {
//   logError({ message: errorString }, { type: "Native Exception" });
// });

function Section({ children, title }) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDarkMode ? Colors.white : Colors.black },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? Colors.light : Colors.dark },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const Stack = createNativeStackNavigator();
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <PaperProvider theme={theme}>
            <Stack.Navigator initialRouteName="LogIn">
              <Stack.Screen name="LogIn" component={LogIn} options={{ headerShown: false }} />
              <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
              <Stack.Screen name="AccountSetting" component={AccountSetting} options={{ headerShown: false }} />
              <Stack.Screen name="BankDetails" component={BankDetails} options={{ headerShown: false }} />
              {/* <Stack.Screen name="GeneralSetting" component={GeneralSetting} options={{ headerShown: false }} /> */}
              <Stack.Screen name="CollectionHistory" component={CollectionHistory} options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
              <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false }} />
            </Stack.Navigator>
          </PaperProvider>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

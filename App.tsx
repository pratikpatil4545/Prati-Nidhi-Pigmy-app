/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import LogIn from './src/Presentation/Screens/LogIn';
import { DefaultTheme, PaperProvider, Provider, ThemeProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/Common/Constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/Presentation/Screens/BottomNavScreens/Dashboard';
import BottomTabs from './src/Presentation/Navigations/BottomTabs';
import Profile from './src/Presentation/Screens/BottomNavScreens/Profile';
import AccountSetting from './src/Presentation/Screens/SettingScreens/AccountSetting';
import BankDetails from './src/Presentation/Screens/SettingScreens/BankDetails';
import GeneralSetting from './src/Presentation/Screens/SettingScreens/GeneralSetting';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const fontConfig = {
  customVariant: {
    fontFamily: Platform.select({
      web: 'Roboto, Montserrat-Regular',
      android: 'Roboto, Montserrat-Regular',
      ios: 'System',
      default: 'sans-serif',
    }),
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 18,
    fontSize: 12,
  }
};

const theme = {
  ...DefaultTheme,
  locale: 'en',
  roundness: 5,
  // fonts: configureFonts({config: fontConfig}),
  colors: {
    ...DefaultTheme.colors,
    primary: '#0B69DA',
    primaryContainer:'#5b6593',
    secondaryContainer:'#5b6593',
    outline:"#515a88",
    accent: '#515a88',
    surface: '#424c80',
    backdrop:"rgba(0, 0, 0, 0.4)",
    custom0Container:"red",
    surfaceVariant: COLORS.white,
    onSurfaceVariant:COLORS.primary,
    onSurface:COLORS.primary,
    onPrimaryContainer: 'red',
    onPrimary:COLORS.white,
    text:"green"
    // outline: COLORS.primaryAccent
  },
};


function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
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
      <SafeAreaView style={ { flex: 1 }}>
        {/* <ThemeProvider>
          <PaperProvider theme={theme}>
            <LogIn />
          </PaperProvider>
        </ThemeProvider> */}
        <NavigationContainer>
        <PaperProvider theme={theme}>
          <Stack.Navigator initialRouteName="LogIn">
            <Stack.Screen name="LogIn" component={LogIn} options={{ headerShown: false }}  />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}  />
            <Stack.Screen name="AccountSetting" component={AccountSetting} options={{ headerShown: false }}  />
            <Stack.Screen name="BankDetails" component={BankDetails} options={{ headerShown: false }}  />
            <Stack.Screen name="GeneralSetting" component={GeneralSetting} options={{ headerShown: false }}  />
            {/* <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }}  /> */}
            <Stack.Screen 
              name="BottomTabs" 
              component={BottomTabs} 
              options={{ headerShown: false }} 
            />
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

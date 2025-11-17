import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Image,
  PermissionsAndroid,
  Platform,
  Linking,
  Modal,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimCardsManagerModule from 'react-native-sim-cards-manager';
import { COLORS } from '../../Common/Constants';
import SmsAndroid from 'react-native-get-sms-android';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';

export default function LoginScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [userPassword, setUserPassword] = useState(null);
  const [confirmUserPassword, setConfirmUserPassword] = useState(null);
  const [isPasswordMatched, setIsPasswordMatched] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSetPasswordVisible, setIsSetPasswordVisible] = useState(false);
  const [isMobileEditable, setIsMobileEditable] = useState(true);
  const [isSmsVerifying, setIsSmsVerifying] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [isAndroid15, setIsAndroid15] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const savedNumber = await AsyncStorage.getItem('mobileNumber');
        const savedPassword = await AsyncStorage.getItem('password');

        if (savedNumber && savedPassword) {
          setIsNewUser(false);
          setMobileNumber(savedNumber);
        } else {
          requestPhoneNumber();
          setIsNewUser(true);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    const requestPhoneNumber = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version < 29) {
          const phonePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: 'Phone Permission',
              message: 'This app needs access to your phone number for verification.',
              buttonPositive: 'OK',
            }
          );

          if (phonePermission !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Cannot access phone number.');
            setStatusMessage('');
            return;
          }
        }

        const smsPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to your SMS for verification.',
            buttonPositive: 'OK',
          }
        );

        if (smsPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot access SMS.');
          setStatusMessage('');
          return;
        }

        const receiveSmsPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'Receive SMS Permission',
            message: 'This app needs to receive SMS for verification.',
            buttonPositive: 'OK',
          }
        );

        if (receiveSmsPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot receive SMS.');
          setStatusMessage('');
          return;
        }

        const simCards = await SimCardsManagerModule.getSimCards();

        if (!simCards || simCards.length === 0) {
          Alert.alert(
            'Phone Number Not Available',
            'Phone number could not be fetched from SIM. Please enter manually.',
            [{ text: 'OK', onPress: () => setIsMobileEditable(false) }]
          );
          return;
        }

        if (simCards.length > 1) {
          Alert.alert(
            'Select SIM',
            'Choose a SIM to retrieve the phone number.',
            simCards.map((sim, i) => ({
              text: `SIM ${i + 1}: ${sim.phoneNumber || 'No number'}`,
              onPress: () => {
                if (!sim.phoneNumber) {
                  Alert.alert(
                    'Phone Number Unavailable',
                    'Enter your number manually.',
                    [{ text: 'OK', onPress: () => setIsMobileEditable(false) }]
                  );
                } else {
                  selectSimCard(sim);
                  setStatusMessage('');
                }
              },
            }))
          );
        } else {
          selectSimCard(simCards[0]);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
        Alert.alert(
          'Phone Number Not Available',
          'Phone number could not be fetched from SIM. Please enter manually.',
          [{ text: 'OK', onPress: () => setIsMobileEditable(false) }]
        );
      }
    };

    const selectSimCard = (sim) => {
      let phone = sim.phoneNumber?.replace(/\D/g, '');
      if (phone?.length > 10) phone = phone.slice(-10);
      if (phone?.length === 10) setMobileNumber(phone);
      else Alert.alert('Invalid Number', 'The phone number should be 10 digits.');
    };

    checkExistingUser();
  }, []);

  const requestSmsPermission = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to SMS messages.',
          buttonPositive: 'OK',
        }
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        if (isAndroid15) setIsPermissionModalVisible(true);
        else {
          setStatusMessage('');
          Alert.alert('Permission Denied', 'Enable SMS permission in settings.'
            , [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]);
        }
      }
      return false;
    } catch (error) {
      console.warn(error);
      return false;
    }
  };

  useEffect(() => {
    const androidVersion = Platform.Version;
    setIsAndroid15(androidVersion === 35);
  }, []);

  const handleProceed = async () => {
    let sanitizedNumber = sanitizeIndianMobile(mobileNumber);
    setMobileNumber(sanitizedNumber);
    if (!sanitizedNumber || sanitizedNumber.length !== 10 || sanitizedNumber.isNaN) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    } else {
      setErrorMessage('');
    }
    setIsLoaderVisible(true);
    setIsLoading(true);
    setStatusMessage('Verifying...');

    if (isNewUser) {
      setIsLoading(false);
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        await requestSmsPermission();
        setIsLoaderVisible(false);
        return;
      }
      verifyNewUserSms();
    } else {
      verifyExistingUserSms();
    }
  };

  const verifyExistingUserSms = async () => {
    const smsFilter = {
      box: 'inbox',
      address: '+919373140457',
      bodyRegex: '(.*)PratiNidhi Online System(.*)',
      maxCount: 2,
    };

    SmsAndroid.list(
      JSON.stringify(smsFilter),
      () => setIsSmsVerifying(false),
      async (smsList, count) => {
        const messages = JSON.parse(count);
        const sender = messages[0]?.address;

        if (sender) {
          try {
            const savedPassword = await AsyncStorage.getItem('password');
            const savedNumber = await AsyncStorage.getItem('mobileNumber');
            setIsLoaderVisible(false);

            if (userPassword === savedPassword && savedNumber === mobileNumber) {
              setStatusMessage('');
              setErrorMessage('');
              navigation.navigate('Dashboard');
            } else {
              setStatusMessage('');
              setErrorMessage('Invalid credentials');
            }
          } catch (error) {
            setStatusMessage('');
            setErrorMessage('Error logging in');
          } finally {
            setIsLoading(false);
          }
        } else {
          setStatusMessage('');
          setErrorMessage('No valid SMS found. Please contact administrator.');
          setIsLoaderVisible(false);
          setIsSmsVerifying(false);
        }
      }
    );
  };

  const sanitizeIndianMobile = (input) => {
    let sanitizedNumber = (input || '').replace(/\D/g, '');
    if (sanitizedNumber.startsWith('91') && sanitizedNumber.length === 12) sanitizedNumber = sanitizedNumber.slice(2);
    if (sanitizedNumber.startsWith('0') && sanitizedNumber.length === 11) sanitizedNumber = sanitizedNumber.slice(1);
    return sanitizedNumber;
  };

  const verifyNewUserSms = () => {
    const smsFilter = {
      box: 'inbox',
      address: '+919373140457',
      bodyRegex: '(.*)PratiNidhi Online System(.*)',
      maxCount: 2,
    };

    SmsAndroid.list(
      JSON.stringify(smsFilter),
      () => setIsSmsVerifying(false),
      (smsList, count) => {
        const messages = JSON.parse(count);
        const sender = messages[0]?.address;

        if (sender) {
          const messageBody = messages[0]?.body;
          const regex = /(?:\+91)?\d{10}/;
          const matchedNumber = messageBody.match(regex)?.[0];
          setMobileNumber(sanitizeIndianMobile(mobileNumber));

          if (matchedNumber && matchedNumber === mobileNumber.toString()) {
            setStatusMessage('');
            setErrorMessage('');
            setIsMobileEditable(true);
            setIsSetPasswordVisible(true);
            setIsLoaderVisible(false);
          } else {
            setIsSetPasswordVisible(false);
            setIsLoaderVisible(false);
            setStatusMessage('');
            setErrorMessage('Entered number does not match verified number.');
          }
        } else {
          setStatusMessage('');
          setErrorMessage('No valid SMS found. Please contact administrator.');
          setIsLoaderVisible(false);
        }
      }
    );
  };

  const handleSetPassword = async () => {
    if (userPassword === confirmUserPassword) {
      try {
        await AsyncStorage.setItem('mobileNumber', mobileNumber);
        await AsyncStorage.setItem('password', userPassword);
        setIsSetPasswordVisible(false);
        setIsNewUser(false);
      } catch (error) {
        Alert.alert('Error storing user data');
      }
    } else {
      setIsPasswordMatched(false);
      setErrorMessage('Passwords did not match!');
    }
  };

  return (
    <View style={styles.screen}>
      {!isSetPasswordVisible ? (
        <>
          <Image
            style={styles.logo}
            source={require('../Assets/Images/rupee.png')}
          />
          <View style={styles.container}>
            <Text style={styles.titleText}>{isNewUser ? 'New User' : 'Login'}</Text>
            <TextInput
              label="Mobile Number"
              mode="outlined"
              outlineColor="#8ABCF9"
              value={mobileNumber}
              keyboardType="numeric"
              onChangeText={(number) => { setMobileNumber(number); setErrorMessage('') }}
              style={styles.input}
              theme={{
                colors: { primary: '#3B5998', underlineColor: 'transparent' },
              }}
              left={<TextInput.Icon icon="phone" />}
            />

            {!isNewUser && (
              <TextInput
                label="Password"
                mode="outlined"
                outlineColor="#8ABCF9"
                value={userPassword}
                onChangeText={setUserPassword}
                style={styles.input}
                theme={{
                  colors: { primary: '#3B5998', underlineColor: 'transparent' },
                }}
                secureTextEntry={!isPasswordVisible}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={isPasswordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  />
                }
                autoCapitalize="none"
              />
            )}

            {isLoading && (
              <>
                <ActivityIndicator animating color="#3B5998" />
              </>
            )}

            {!isNewUser && (
              <View style={styles.forgotPasswordContainer}>
                <Text
                  onPress={() =>
                    ToastAndroid.show('Development in progress!', ToastAndroid.SHORT)
                  }
                  style={styles.forgotPasswordText}
                >
                  Forgot Password?
                </Text>
              </View>
            )}
            {errorMessage ? <Text style={{ color: '#c72a2a', alignSelf: 'center' }}>{errorMessage}</Text> : null}
            {statusMessage ? <Text style={{ color: COLORS.primary, alignSelf: 'center' }}>{statusMessage}</Text> : null}
            <View style={styles.buttonWrapper}>
              <Button
                icon="login"
                contentStyle={{ flexDirection: 'row-reverse' }}
                onPress={handleProceed}
                disabled={isLoading}
                style={{ backgroundColor: COLORS.primary }}
                labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                mode="contained"
              >
                {isNewUser ? 'Next' : 'Login'}
              </Button>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <MaterialCommunityIcons4
            onPress={() => {
              setIsNewUser(true);
              setIsSetPasswordVisible(false);
            }}
            style={styles.backIcon}
            name="angle-left"
            color={COLORS.primary}
            size={40}
          />
          <Text style={styles.titleText}>Set Password</Text>
          <TextInput
            label="Enter Password"
            mode="outlined"
            outlineColor="#8ABCF9"
            value={userPassword}
            onChangeText={(number) => { setUserPassword(number); setErrorMessage('') }}
            style={styles.input}
            theme={{
              colors: { primary: '#3B5998', underlineColor: 'transparent' },
            }}
            secureTextEntry={!isPasswordVisible}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            }
            error={!isPasswordMatched && errorMessage}
            autoCapitalize="none"
          />

          <TextInput
            label="Confirm Password"
            mode="outlined"
            outlineColor="#8ABCF9"
            value={confirmUserPassword}
            onChangeText={(number) => { setConfirmUserPassword(number); setErrorMessage('') }}
            style={styles.input}
            theme={{
              colors: { primary: '#3B5998', underlineColor: 'transparent' },
            }}
            secureTextEntry={!isPasswordVisible}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            }
            error={!isPasswordMatched && errorMessage}
            autoCapitalize="none"
          />
          {errorMessage ? <Text style={{ color: '#c72a2a', alignSelf: 'center' }}>{errorMessage}</Text> : null}
          <View style={styles.buttonWrapper}>
            <Button
              icon="chevron-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
              onPress={handleSetPassword}
              disabled={isLoading}
              style={{ backgroundColor: COLORS.primary }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              mode="contained"
            >
              Submit
            </Button>
          </View>
        </View>
      )}

      {isLoaderVisible && (
        <Modal animationType="fade" transparent visible={isLoaderVisible}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="rgba(0, 0, 0, 0.5)"
          />
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </Modal>
      )}

      <Modal
        visible={isPermissionModalVisible}
        onRequestClose={() => setIsPermissionModalVisible(false)}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.permissionModal}>
            <Image
              source={require('../Assets/Images/permission.gif')}
              style={styles.permissionGif}
              resizeMode="contain"
            />
            <Text style={styles.permissionTitle}>Permission Required</Text>
            <Text style={styles.permissionMessage}>
              To allow SMS access on Android 15:{'\n\n'}1. Tap "Open Settings".
              {'\n'}2. Tap the three-dot menu (⋮).
              {'\n'}3. Select "Allow restricted settings".
              {'\n'}4. Try again.
            </Text>

            <View style={styles.permissionButtons}>
              <TouchableOpacity
                onPress={() => setIsPermissionModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openSettings();
                  setIsPermissionModalVisible(false);
                }}
                style={styles.openButton}
              >
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%', height: '100%', backgroundColor: 'white' },
  logo: { width: 100, height: 100, alignSelf: 'center', marginTop: '12%' },
  container: {
    width: '100%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  input: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  buttonWrapper: { width: '100%', padding: 25 },
  titleText: {
    position: 'absolute',
    top: 50,
    fontWeight: 'bold',
    color: '#252525',
    fontSize: 22,
  },
  statusText: { alignSelf: 'center', color: '#333' },
  forgotPasswordContainer: { width: '95%', alignSelf: 'center' },
  forgotPasswordText: {
    color: COLORS.primary,
    alignSelf: 'flex-end',
    textDecorationLine: 'underline',
  },
  backIcon: { position: 'absolute', top: 45, left: 30 },
  loaderOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  permissionModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
  },
  permissionGif: { width: 250, height: 150, marginBottom: 15 },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
    textAlign: 'left',
  },
  permissionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  openButton: {
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

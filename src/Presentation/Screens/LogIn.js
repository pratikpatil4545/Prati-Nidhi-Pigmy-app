import { View, Text, StyleSheet, Alert, ActivityIndicator, ToastAndroid, Image, PermissionsAndroid, Platform, Linking, Modal, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimCardsManagerModule from 'react-native-sim-cards-manager';
import { COLORS } from '../../Common/Constants';
import SmsAndroid from 'react-native-get-sms-android';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';

export default function Login({ navigation }) {

  const [number, setNumber] = useState(null);
  const [newUser, setNewUser] = useState(true);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordMatched, setPasswordMatched] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationText, setVerificationText] = useState('');
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [sentOtp, setSentOtp] = useState(null);
  const [enableMblNo, setEnableMblNo] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [customeLoaderModal, setCustomLoaderModal] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedMobileNumber = await AsyncStorage.getItem('mobileNumber');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedMobileNumber && storedPassword) {
          setNewUser(false);
          setNumber(storedMobileNumber);
        } else {
          fetchPhoneNumber();
          setNewUser(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    const fetchPhoneNumber = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version < 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: 'Phone Permission',
              message: 'This app needs access to your phone number for verification purposes.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Cannot access phone number without permission.');
            return;
          }
        }

        const grantedSms = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to your SMS messages for verification purposes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (grantedSms !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot access SMS messages without permission.');
          return;
        }

        const grantedReceiveSms = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'Receive SMS Permission',
            message: 'This app needs permission to receive SMS for verification purposes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (grantedReceiveSms !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot receive SMS messages without permission.');
          return;
        }

        const simCards = await SimCardsManagerModule.getSimCards({
          title: 'App Permission',
          message: 'Custom message',
          buttonNeutral: 'Not now',
          buttonNegative: 'Not OK',
          buttonPositive: 'OK',
        });

        if (!simCards || simCards.length === 0) {
          // Alert.alert('No SIM card information available');
          Alert.alert(
            'Phone Number Not Available',
            'The phone number could not be fetched from the SIM card. Please enter it manually.',
            [
              { text: 'OK', onPress: () => setEnableMblNo(false) },
            ]
          );
          return;
        }

        // if (simCards.length > 1) {
        //   Alert.alert(
        //     'Select SIM',
        //     'Please choose a SIM card to retrieve the phone number.',
        //     simCards.map((sim, index) => ({
        //       text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
        //       onPress: () => handlePhoneNumberSelection(sim),
        //     })),
        //     { cancelable: true }
        //   );
        // } else {
        //   handlePhoneNumberSelection(simCards[0]);
        // }
        if (simCards.length > 1) {
          Alert.alert(
            'Select SIM',
            'Please choose a SIM card to retrieve the phone number.',
            simCards.map((sim, index) => ({
              text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
              onPress: () => {
                if (!sim.phoneNumber) {
                  // If no phone number is available for the selected SIM, show alert to manually enter number
                  Alert.alert(
                    'Phone Number Unavailable',
                    'No phone number available for this SIM. Please enter your mobile number manually.',
                    [
                      { text: 'OK', onPress: () => setEnableMblNo(false) },
                    ]
                  );
                } else {
                  handlePhoneNumberSelection(sim);
                }
              },
            })),
            { cancelable: true }
          );
        } else {
          handlePhoneNumberSelection(simCards[0]);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
        Alert.alert(
          'Phone Number Not Available',
          'The phone number could not be fetched from the SIM card. Please enter it manually.',
          [
            { text: 'OK', onPress: () => setEnableMblNo(false) },
          ]
        );
      }
    };

    const handlePhoneNumberSelection = (sim) => {
      let phoneNumber = sim.phoneNumber;
      if (phoneNumber) {
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length > 10) phoneNumber = phoneNumber.slice(-10);
        if (phoneNumber.length === 10) {
          setNumber(phoneNumber);
        } else {
          Alert.alert('Invalid Phone Number', 'The phone number should be exactly 10 digits.');
        }
      } else {
        Alert.alert('Phone Number Unavailable', 'Please enter your mobile number manually.');
        setShowSetPassword(true); // Show input for mobile number
      }
    };

    checkAuthentication();
  }, []);


  // useEffect(() => {
  //   const checkAuthentication = async () => {
  //     try {
  //       const storedMobileNumber = await AsyncStorage.getItem('mobileNumber');
  //       const storedPassword = await AsyncStorage.getItem('password');

  //       if (storedMobileNumber && storedPassword) {
  //         setNewUser(false);
  //         setNumber(storedMobileNumber);
  //       } else {
  //         fetchPhoneNumber();
  //         setNewUser(true);
  //       }
  //     } catch (error) {
  //       console.log('Error checking authentication:', error.toString());
  //       Alert.alert('Error checking authentication:');
  //     }
  //   };

  //   const requestAllPermissions = async () => {
  //     try {
  //       // const storagePermissionGranted = await requestStoragePermission();
  //       // if (storagePermissionGranted) {
  //       await fetchPhoneNumber();
  //       // } else {
  //       //   Alert.alert('Permission Required', 'The app needs permissions to function properly.');
  //       // }
  //     } catch (error) {
  //       console.log('Error requesting permissions:', error.toString());
  //       Alert.alert('Error requesting permissions:');
  //     }
  //   };

  //   const fetchPhoneNumber = async () => {
  //     try {
  //       if (Platform.OS === 'android' && Platform.Version < 29) {
  //         const granted = await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  //           {
  //             title: 'Phone Permission',
  //             message: 'This app needs access to your phone number for verification purposes.',
  //             buttonNeutral: 'Ask Me Later',
  //             buttonNegative: 'Cancel',
  //             buttonPositive: 'OK',
  //           }
  //         );

  //         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
  //           Alert.alert('Permission Denied', 'Cannot access phone number without permission.');
  //           return;
  //         }
  //       }

  //       const simCards = await SimCardsManagerModule.getSimCards({
  //         title: 'App Permission',
  //         message: 'Custom message',
  //         buttonNeutral: 'Not now',
  //         buttonNegative: 'Not OK',
  //         buttonPositive: 'OK',
  //       });

  //       if (!simCards || simCards.length === 0) {
  //         Alert.alert('No SIM card information available');
  //         return;
  //       }

  //       if (simCards.length > 1) {
  //         Alert.alert(
  //           'Select SIM',
  //           'Please choose a SIM card to retrieve the phone number.',
  //           simCards.map((sim, index) => ({
  //             text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
  //             onPress: () => handlePhoneNumberSelection(sim),
  //           })),
  //           { cancelable: true }
  //         );
  //       } else {
  //         handlePhoneNumberSelection(simCards[0]);
  //       }
  //     } catch (error) {
  //       console.log('Error fetching phone number:', error.toString());
  //       Alert.alert('Error fetching phone number:');
  //     }
  //   };

  //   const handlePhoneNumberSelection = (sim) => {
  //     let phoneNumber = sim.phoneNumber;
  //     if (phoneNumber) {
  //       phoneNumber = phoneNumber.replace(/\D/g, '');
  //       if (phoneNumber.length > 10) phoneNumber = phoneNumber.slice(-10);
  //       if (phoneNumber.length === 10) {
  //         setNumber(phoneNumber);
  //       } else {
  //         Alert.alert('Invalid Phone Number', 'The phone number should be exactly 10 digits.');
  //       }
  //     } else {
  //       Alert.alert('Phone Number Unavailable');
  //     }
  //   };

  //   checkAuthentication();
  //   requestAllPermissions();
  // }, []);

  const handleNext = async () => {
    // navigation.navigate('BottomTabs');
    setCustomLoaderModal(true);
    setLoading(true);
    setVerificationText('Verifying...');

    if (newUser) {
      setLoading(false);
      getLatestSMS();
      // setVerificationText('Verified');
      // setShowSetPassword(true);

    } else {

      const filter = {
        box: 'inbox',
        // main office number
        address: `+919373140457`,
        // address: `+918080109858`,
        bodyRegex: '(.*)PratiNidhi Online System(.*)',
        maxCount: 2,
      };

      SmsAndroid.list(JSON.stringify(filter), (fail) => {
        console.log(fail);
        setIsVerifying(false);
      },
        async (smsList, count) => {
          let smsArray = JSON.parse(count);
          let fetchedNumber = smsArray[0]?.address;
          console.log("getting msgs", smsArray, fetchedNumber)
          if (fetchedNumber) {

            try {
              const storedPassword = await AsyncStorage.getItem('password');
              const storedNumber = await AsyncStorage.getItem('mobileNumber');
              setCustomLoaderModal(false);

              if (password === storedPassword && storedNumber === number) {
                setVerificationText('Verified');
                // ToastAndroid.show('Authentication Successful!', ToastAndroid.SHORT);
                navigation.navigate('Dashboard');
              } else {
                setVerificationText('Invalid credentials');
                Alert.alert('Warning', 'Invalid Credentials');
              }
            } catch (error) {
              Alert.alert('Error accessing stored password:', error);
              setVerificationText('Error logging in');
              // ToastAndroid.show('Error logging in', ToastAndroid.SHORT);
            } finally {
              setLoading(false);
            }

          } else {
            console.log('No SMS found');
            setVerificationText('No SMS found for verification');
            setLoading(false);
            Alert.alert('Authorization Warning', 'No valid SMS found for verification. Please contact your branch administrator.');
            setIsVerifying(false);
            setCustomLoaderModal(false);
          }
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (password === confirmPassword) {
      try {
        await AsyncStorage.setItem('mobileNumber', number);
        await AsyncStorage.setItem('password', password);
        // ToastAndroid.show('Password has been set successfully!', ToastAndroid.SHORT);
        setShowSetPassword(false);
        setNewUser(false);
      } catch (error) {
        Alert.alert('Error storing user data:');
        console.log('Error storing user data:', error);
        // ToastAndroid.show('Error setting password', ToastAndroid.SHORT);
      }
    } else {
      setPasswordMatched(false);
      Alert.alert('Warning', 'Passwords did not match!');
    }
  };

  // const sendOtp = () => {
  //   setIsVerifying(true); // Set to true to start verification process
  //   // handleSmsPress();
  //   const phoneNumber = `+917887760491`;
  //   const message = `Hello, This is just for verification purpose, You can use the Pigmy App now! 🎉 😊`;

  //   SmsAndroid.autoSend(
  //     phoneNumber,
  //     message,
  //     (fail) => {
  //       console.log('Failed with this error: ' + fail);
  //     },
  //     (success) => {
  //       console.log('SMS sent successfully');
  //     },
  //   );
  // };

  const handleSmsPress = async () => {
    const getNumber = number;
    const phoneNumber = `+91${getNumber}`;
    const message = `Hello, This is just for verification purpose, You can use the Pigmy App now! 🎉 😊`;

    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(smsUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open SMS app.');
      setIsVerifying(false);
    }
  };

  const getLatestSMS = () => {
    const filter = {
      box: 'inbox',
      // main office number
      address: `+919373140457`,
      // address : `+917887760491`,
      // address: `+918080109858`,
      // address: `JM-ICICITcv`,
      // address: `+91${number}`,
      bodyRegex: '(.*)PratiNidhi Online System(.*)',
      // bodyRegex: '(.*)You can use the Pigmy App now!(.*)',
      maxCount: 2,
    };

    SmsAndroid.list(JSON.stringify(filter), (fail) => {
      console.log('failed to get sms',fail);
      setIsVerifying(false);
    },
      (smsList, count) => {
        let smsArray = JSON.parse(count);
        let fetchedNumber = smsArray[0]?.address;
        console.log("getting msgs", count)
        if (fetchedNumber) {

          // if (fetchedNumber === `+91${number}`)

          // Alert.alert(
          //   'Confirm Number',
          //   `Is this your number: ${fetchedNumber}?`,
          //   [
          //     {
          //       text: 'No',
          //       onPress: () => {
          //         console.log('Number not confirmed');
          //         setVerificationText('Number not confirmed');
          //         setIsVerifying(false);
          //       },
          //       style: 'cancel',
          //     },
          //     {
          //       text: 'Yes',
          //       onPress: () => {
          //         if (fetchedNumber === `+91${number}`) {
          //           console.log('Verified');
          //           // setVerificationText('Verified');
          //           // setEnableMblNo(true);
          //           // setShowSetPassword(true);
          //           setVerificationText('Verified');
          //           setShowSetPassword(true);
          //         } else {
          //           console.log('Not verified');
          //           setVerificationText('Not Verified');
          //         }
          //         setIsVerifying(false);
          //       },
          //     },
          //   ]
          // );


          // setVerificationText('Verified');
          // setShowSetPassword(true);

          let smsBody = smsArray[0]?.body;

          const regex = /(?:\+91)?\d{10}/; // Matches a 10-digit number optionally prefixed with +91
          const matchedNumber = smsBody.match(regex)?.[0];;
          if (matchedNumber) {
            console.log("number matched", matchedNumber, number)
            if (matchedNumber === number.toString()) {
              console.log("number is also matched matched", number, matchedNumber)
              console.log('Verified');
              setVerificationText('Verified');
              setEnableMblNo(true);
              setShowSetPassword(true);
              setCustomLoaderModal(false);
            }
            else {
              setShowSetPassword(false);
              setCustomLoaderModal(false);
              console.log("number is not matched matched", number, matchedNumber)
              Alert.alert('Warning', 'The entered number and verified number does not matched. Please check number')
            }
          }
          else {
            console.log("number not matched", matchedNumber)
            setShowSetPassword(false);
              setCustomLoaderModal(false);
              // console.log("number is not matched matched", number, matchedNumber)
              Alert.alert('Warning', 'The entered number and verified number does not matched. Please check number')
          }

        } else {
          console.log('No SMS found');
          setVerificationText('No SMS found');
          Alert.alert('Authorization Warning', 'No valid SMS found for verification. Please contact your branch administrator.');
          setIsVerifying(false);
          setCustomLoaderModal(false);
        }
      }
    );
    // (smsList, count) => {
    //   let smsArray = JSON.parse(count);
    //   let inputedNumber = `+91${number}`;

    //   if (inputedNumber === smsArray[0]?.address) {
    //     console.log('Verified');
    //     setVerificationText('Verified');
    //     setVerificationText('Verified');
    //     setEnableMblNo(true);
    //     setShowSetPassword(true);
    //   } else {
    //     console.log('Not verified');
    //     setVerificationText('Not Verified');
    //   }
    //   console.log('Count: ', smsArray[0]?.address);
    //   console.log('List: ', smsList);
    //   setIsVerifying(false);
    // }
    // );
  };

  return (
    <View style={styles.flex}>
      {!showSetPassword ? (
        <>
          <Image
            style={{ width: 100, height: 100, alignSelf: 'center', marginTop: '12%' }}
            source={require('../Assets/Images/rupee.png')}
          />
          <View style={styles.container}>
            <Text style={styles.loginText}>{newUser ? 'New User' : 'Login'}</Text>
            <TextInput
              label="Mobile Number"
              mode="outlined"
              outlineColor="#8ABCF9"
              value={number}
              keyboardType="numeric"
              onChangeText={(text) => setNumber(text)}
              style={styles.input}
              // disabled
              theme={{
                colors: { primary: '#3B5998', underlineColor: 'transparent' },
              }}
              left={<TextInput.Icon icon="phone" />}
              error={verificationText === 'User not found'}
            />

            {!newUser &&
              <TextInput
                label="Password"
                mode="outlined"
                outlineColor="#8ABCF9"
                value={password}
                onChangeText={(text) => setPassword(text)}
                style={styles.input}
                theme={{
                  colors: { primary: '#3B5998', underlineColor: 'transparent' },
                }}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                autoCapitalize="none"
                error={verificationText === 'User not found'}

              />
            }

            {loading && (
              <>
                <ActivityIndicator animating={true} color="#3B5998" />
                <Text style={styles.verificationText}>{verificationText}</Text>
              </>
            )}

            {!newUser &&
              <View style={{ width: '95%', alignSelf: 'center' }}>
                <Text onPress={() => { ToastAndroid.show('Development is in progress!', ToastAndroid.SHORT) }} style={{ color: COLORS.primary, alignSelf: 'flex-end', textDecorationLine: 'underline' }}>Forgot Password?</Text>
              </View>
            }

            <View style={styles.buttonContainer}>
              <Button icon="login" contentStyle={{ flexDirection: 'row-reverse' }} onPress={handleNext} disabled={loading} style={{ backgroundColor: COLORS.primary }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }} mode="contained">
                {newUser ? 'Next' : 'Login'}
              </Button>
            </View>
          </View>
        </>

      ) : (

        <View style={styles.container}>
          <MaterialCommunityIcons4 onPress={() => { setNewUser(true), setShowSetPassword(false) }} style={{ position: 'absolute', top: 45, left: 30 }} name='angle-left' color={COLORS.primary} size={40} />
          <Text style={styles.loginText}>Set Password</Text>

          <TextInput
            label="Enter Password"
            mode="outlined"
            outlineColor="#8ABCF9"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            theme={{
              colors: { primary: '#3B5998', underlineColor: 'transparent' },
            }}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={!passwordMatched}
            autoCapitalize="none"
          />

          <TextInput
            label="Confirm Password"
            mode="outlined"
            outlineColor="#8ABCF9"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            style={styles.input}
            theme={{
              colors: { primary: '#3B5998', underlineColor: 'transparent' },
            }}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={!passwordMatched}
            autoCapitalize="none"
          />

          <View style={styles.buttonContainer}>
            <Button icon="chevron-right" contentStyle={{ flexDirection: 'row-reverse' }} onPress={handleSubmit} disabled={loading} style={{ backgroundColor: COLORS.primary }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }} mode="contained">
              Submit
            </Button>
          </View>
        </View>
      )}

      {customeLoaderModal &&
        <Modal
          animationType="fade"
          transparent={true}
          visible={customeLoaderModal}
        // onRequestClose={handleCancel}
        >
          <StatusBar
            barStyle={'light-content'}
            backgroundColor={'rgba(0, 0, 0, 0.5)'}
          />
          <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          </View>
        </Modal>
      }
    </View>
  )
}

const styles = StyleSheet.create((
  {
    flex: {
      // flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: 'white'
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      width: '100%',
      height: '90%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 25
    },
    input: {
      width: '100%',
      marginBottom: 20,
      borderRadius: 10,
      backgroundColor: 'white'
    },
    buttonContainer: {
      width: '100%',
      padding: 25
    },
    loginText: {
      position: 'absolute',
      top: 50,
      fontWeight: 'bold',
      color: '#252525',
      fontSize: 22
    }
  }
))
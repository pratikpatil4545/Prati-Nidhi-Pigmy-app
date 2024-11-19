import { View, Text, StyleSheet, Alert, ActivityIndicator, ToastAndroid, Image, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput, Button } from 'react-native-paper';
import { database } from '../../data/database';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimCardsManagerModule from 'react-native-sim-cards-manager';
import { COLORS } from '../../Common/Constants';
import { XMLParser } from 'fast-xml-parser';

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
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedMobileNumber = await AsyncStorage.getItem('mobileNumber');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedMobileNumber && storedPassword) {
          setNewUser(false); // User exists, set them to login mode
          setNumber(storedMobileNumber); // Set the stored phone number
        } else {
          fetchPhoneNumber(); // Call the function to fetch the phone number
          setNewUser(true); // No user found, set them as a new user
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    // const fetchPhoneNumber = async () => {
    //   try {
    //     const simCards = await SimCardsManagerModule.getSimCards({
    //       title: 'App Permission',
    //       message: 'Custom message',
    //       buttonNeutral: 'Not now',
    //       buttonNegative: 'Not OK',
    //       buttonPositive: 'OK',
    //     });

    //     if (simCards && simCards.length > 0) {
    //       let phoneNumber = simCards[0].phoneNumber;

    //       if (phoneNumber) {
    //         // Remove +91 if it is present at the beginning of the phone number
    //         if (phoneNumber.startsWith('+91')) {
    //           phoneNumber = phoneNumber.slice(3);
    //         }
    //         setNumber(phoneNumber);
    //       } else {
    //         console.log('Phone number is not available');
    //       }
    //     } else {
    //       console.log('No SIM card information available');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching phone number:', error);
    //   }
    // };

    const fetchPhoneNumber = async () => {
      try {
        // Check and request permission dynamically
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
    
        // Call to fetch phone number, handle older API versions conditionally
        const simCards = await SimCardsManagerModule.getSimCards({
          title: 'App Permission',
          message: 'Custom message',
          buttonNeutral: 'Not now',
          buttonNegative: 'Not OK',
          buttonPositive: 'OK',
        });
    
        if (!simCards || simCards.length === 0) {
          Alert.alert('No SIM card information available');
          return;
        }
    
        if (simCards.length > 1) {
          Alert.alert(
            'Select SIM',
            'Please choose a SIM card to retrieve the phone number.',
            simCards.map((sim, index) => ({
              text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
              onPress: () => handlePhoneNumberSelection(sim),
            })),
            { cancelable: true }
          );
        } else {
          handlePhoneNumberSelection(simCards[0]);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    };

    // const fetchPhoneNumber = async () => {
    //   try {
    //     if (Platform.OS === 'android' && Platform.Version < 29) {
    //       const granted = await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    //         {
    //           title: 'Phone Permission',
    //           message: 'This app needs access to your phone number for verification purposes.',
    //           buttonNeutral: 'Ask Me Later',
    //           buttonNegative: 'Cancel',
    //           buttonPositive: 'OK',
    //         }
    //       );
    
    //       if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //         Alert.alert('Permission Denied', 'Cannot access phone number without permission.');
    //         return;
    //       }
    //     }
    
    //     SimCardsManagerModule.getSimCardsNative()
    //       .then((simCards) => {
    //         if (!simCards || simCards.length === 0) {
    //           Alert.alert('No SIM card information available');
    //           return;
    //         }
    
    //         if (simCards.length > 1) {
    //           Alert.alert(
    //             'Select SIM',
    //             'Please choose a SIM card to retrieve the phone number.',
    //             simCards.map((sim, index) => ({
    //               text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
    //               onPress: () => handlePhoneNumberSelection(sim),
    //             })),
    //             { cancelable: true }
    //           );
    //         } else {
    //           handlePhoneNumberSelection(simCards[0]);
    //         }
    //       })
    //       .catch((error) => {
    //         console.error('Error fetching phone number:', error);
    //       });
    //   } catch (error) {
    //     console.error('Error fetching phone number:', error);
    //   }
    // };
    
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
        Alert.alert('Phone Number Unavailable');
      }
    };

    // const fetchPhoneNumber = async () => {
    //   try {
    //     if (Platform.OS === 'android') {
    //       const granted = await PermissionsAndroid.requestMultiple([
    //         PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    //         PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    //       ]);
    
    //       if (
    //         granted['android.permission.READ_PHONE_STATE'] !== PermissionsAndroid.RESULTS.GRANTED ||
    //         granted['android.permission.READ_PHONE_NUMBERS'] !== PermissionsAndroid.RESULTS.GRANTED
    //       ) {
    //         console.log('Phone number permissions denied');
    //         return;
    //       }
    //     }
    
    //     const simCards = await SimCardsManagerModule.getSimCards({
    //       title: 'App Permission',
    //       message: 'Custom message',
    //       buttonNeutral: 'Not now',
    //       buttonNegative: 'Not OK',
    //       buttonPositive: 'OK',
    //     });
    
    //     if (simCards && simCards.length > 0 && simCards.some(sim => sim.phoneNumber)) {
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
    //     } else {
    //       promptManualEntry();
    //     }
    //   } catch (error) {
    //     console.error('Error fetching phone number:', error);
    //   }
    // };
    
    // const handlePhoneNumberSelection = (sim) => {
    //   let phoneNumber = sim.phoneNumber;
    //   if (phoneNumber) {
    //     phoneNumber = phoneNumber.replace(/\D/g, '');
    //     if (phoneNumber.length > 10) {
    //       phoneNumber = phoneNumber.slice(-10);
    //     }
    //     if (phoneNumber.length === 10) {
    //       setNumber(phoneNumber);
    //     } else {
    //       console.log('Phone number is not valid (should be exactly 10 digits without symbols or country code)');
    //     }
    //   } else {
    //     promptManualEntry();
    //   }
    // };
    
    const promptManualEntry = () => {
      Alert.prompt(
        'Enter Phone Number',
        'Please enter your 10-digit phone number:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: (input) => {
              const phoneNumber = input.replace(/\D/g, '');
              if (phoneNumber.length === 10) {
                setNumber(phoneNumber);
              } else {
                console.log('Phone number is not valid (should be exactly 10 digits without symbols or country code)');
              }
            }
          }
        ],
        'plain-text',
        '',
        'numeric'
      );
    };


    // const fetchPhoneNumber = async () => {
    //   try {
    //     const simCards = await SimCardsManagerModule.getSimCards({
    //       title: 'App Permission',
    //       message: 'Custom message',
    //       buttonNeutral: 'Not now',
    //       buttonNegative: 'Not OK',
    //       buttonPositive: 'OK',
    //     });
    
    //     if (simCards && simCards.length > 1) {
    //       // Prompt the user to select a SIM card, showing the phone number for each SIM
    //       Alert.alert(
    //         'Select SIM',
    //         'Please choose a SIM card to retrieve the phone number.',
    //         simCards.map((sim, index) => ({
    //           text: `SIM ${index + 1}: ${sim.phoneNumber || 'No number available'}`,
    //           onPress: () => handlePhoneNumberSelection(sim)
    //         })),
    //         { cancelable: true }
    //       );
    //     } else if (simCards && simCards.length === 1) {
    //       // Process the single SIM card directly
    //       handlePhoneNumberSelection(simCards[0]);
    //     } else {
    //       console.log('No SIM card information available');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching phone number:', error);
    //   }
    // };
    
    // const handlePhoneNumberSelection = (sim) => {
    //   let phoneNumber = sim.phoneNumber;
    //   if (phoneNumber) {
    //     phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digit characters
    
    //     if (phoneNumber.length > 10) {
    //       phoneNumber = phoneNumber.slice(-10); // Take the last 10 digits
    //     }
    
    //     if (phoneNumber.length === 10) {
    //       setNumber(phoneNumber);
    //     } else {
    //       console.log('Phone number is not valid (should be exactly 10 digits without symbols or country code)');
    //     }
    //   } else {
    //     console.log('Phone number is not available');
    //   }
    // };


    // const fetchPhoneNumber = async () => {
    //   try {
    //     const simCards = await SimCardsManagerModule.getSimCards({
    //       title: 'App Permission',
    //       message: 'Custom message',
    //       buttonNeutral: 'Not now',
    //       buttonNegative: 'Not OK',
    //       buttonPositive: 'OK',
    //     });

    //     if (simCards && simCards.length > 0) {
    //       let phoneNumber = simCards[0].phoneNumber;
    //       console.log("pjone number is", simCards, phoneNumber)
    //       if (phoneNumber) {
    //         // Remove any non-digit characters
    //         phoneNumber = phoneNumber.replace(/\D/g, '');

    //         // Ensure the phone number is exactly 10 digits
    //         if (phoneNumber.length > 10) {
    //           phoneNumber = phoneNumber.slice(-10); // Take the last 10 digits
    //         }

    //         if (phoneNumber.length === 10) {
    //           setNumber(phoneNumber);
    //         } else {
    //           console.log('Phone number is not valid (should be exactly 10 digits without symbols or country code)');
    //         }
    //       } else {
    //         console.log('Phone number is not available');
    //       }
    //     } else {
    //       console.log('No SIM card information available');
    //     }
    //   } catch (error) {
    //     console.error('Error fetching phone number:', error);
    //   }
    // };

    checkAuthentication();
  }, []);

  const handleNext = async () => {
    // navigation.navigate('BottomTabs');
    setLoading(true);
    setVerificationText('Verifying...');

    if (newUser) {
      // New user flow (sign up)
      // setTimeout(() => {
      //   setLoading(false);
      //   setVerificationText('Verified');
      //   setShowSetPassword(true); // Show password setup screen for new users
      // }, 2000);

      setLoading(false);
      setVerificationText('Verified');
      setShowSetPassword(true); 

      // try {
      //   const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/RequestData_App?MobileNo=${number}`;
      //   const response = await fetch(url, {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/xml',
      //     },
      //   });

      //   const responseText = await response.text();
      //   const parser = new XMLParser();
      //   const jsonResponse = parser.parse(responseText);

      //   const jsonString = jsonResponse.string;
      //   const dataObject = JSON.parse(jsonString);
      //   console.log("responseText:", dataObject.ResonseCode);

      //   if (dataObject.ResonseCode === "0000") {
      //     setLoading(false);
      //     setVerificationText('Verified');
      //     setShowSetPassword(true); 
      //   } else {
      //     setLoading(false);
      //     setVerificationText('Unauthorized');
      //     ToastAndroid.show('Unauthorized user', ToastAndroid.SHORT);
      //   }
      // } catch (error) {
      //   setLoading(false);
      //   setVerificationText('Error fetching data');
      //   console.error('Error fetching data:', error);
      // }

    } else {

      // setTimeout(async () => {
      //   setLoading(false);
      //   try {
      //     const storedPassword = await AsyncStorage.getItem('password');
      //     const storedNumber = await AsyncStorage.getItem('mobileNumber');

      //     if ((password === storedPassword) && (storedNumber === number)) {
      //       // If entered password matches stored password, log in
      //       setVerificationText('Verified');
      //       ToastAndroid.show('Authentication Successful!', ToastAndroid.SHORT);
      //       navigation.navigate('BottomTabs'); // Navigate to main app screen
      //     } else {
      //       // If password doesn't match
      //       setVerificationText('Invalid credentials');
      //       ToastAndroid.show('Invalid Credentials', ToastAndroid.SHORT);
      //     }
      //   } catch (error) {
      //     console.error('Error accessing stored password:', error);
      //     setVerificationText('Error logging in');
      //     ToastAndroid.show('Error logging in', ToastAndroid.SHORT);
      //   }
      // }, 2000);

      try {
        const storedPassword = await AsyncStorage.getItem('password');
        const storedNumber = await AsyncStorage.getItem('mobileNumber');

        if (password === storedPassword && storedNumber === number) {
          // If entered password matches stored password, log in
          setVerificationText('Verified');
          // ToastAndroid.show('Authentication Successful!', ToastAndroid.SHORT);
          navigation.navigate('BottomTabs'); // Navigate to main app screen
        } else {
          // If password doesn't match
          setVerificationText('Invalid credentials');
          Alert.alert('Warning','Invalid Credentials');
        }
      } catch (error) {
        console.error('Error accessing stored password:', error);
        setVerificationText('Error logging in');
        // ToastAndroid.show('Error logging in', ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }

    }
  };

  const handleSubmit = async () => {
    if (password === confirmPassword) {
      try {
        await AsyncStorage.setItem('mobileNumber', number);
        await AsyncStorage.setItem('password', password); // Store password securely (or use encrypted storage)
        // ToastAndroid.show('Password has been set successfully!', ToastAndroid.SHORT);
        setShowSetPassword(false); // Hide the set password UI
        setNewUser(false); // Mark the user as an existing user
      } catch (error) {
        console.error('Error storing user data:', error);
        // ToastAndroid.show('Error setting password', ToastAndroid.SHORT);
      }
    } else {
      setPasswordMatched(false);
      Alert.alert('Warning','Passwords did not match!');
    }
  };

  const handleWhatsAppPress = () => {
    const phoneNumber = '+917887760491';
    const message = 'Hi, I would like to get in touch with you!';

    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;

    Linking.openURL(url);
  };

  return (
    <View style={styles.flex}>
      {!showSetPassword ? (
        <>
          <Image
            style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 20 }}
            source={require('../Assets/Images/automateSystemsLogo.png')}
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
              disabled
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
                <Text onPress={()=>{ToastAndroid.show('Development is in progress!', ToastAndroid.SHORT)}} style={{ color: COLORS.primary, alignSelf: 'flex-end', textDecorationLine: 'underline' }}>Forgot Password?</Text>
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


          {/* {loading && (
            <>
              <ActivityIndicator animating={true} color="#3B5998" />
              <Text style={styles.verificationText}>{verificationText}</Text>
            </>
          )} */}

          <View style={styles.buttonContainer}>
            <Button icon="chevron-right" contentStyle={{ flexDirection: 'row-reverse' }} onPress={handleSubmit} disabled={loading} style={{ backgroundColor: COLORS.primary }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }} mode="contained">
              Submit
            </Button>
          </View>
        </View>

      )}
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
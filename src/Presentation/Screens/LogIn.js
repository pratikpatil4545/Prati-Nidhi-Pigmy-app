import { View, Text, StyleSheet, Alert, ActivityIndicator, ToastAndroid, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput, Button } from 'react-native-paper';
import { database } from '../../data/database';
import { useIsFocused } from '@react-navigation/native';
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
    const fetchData = async () => {
      try {
        const usersCollection = database.collections.get('master_table');
        const records = await usersCollection.query().fetch();
        if (records && records.length > 0) {
          setNewUser(false);
          navigation.navigate('BottomTabs');
        } else {
          setNewUser(true);
        }
        // console.log(records, 'database data');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    setLoading(true);
    setVerificationText('Verifying...');

    if (newUser) {
      setTimeout(() => {
        setLoading(false);
        if (number === '1234567890') {
          setVerificationText('Verified');
          setShowSetPassword(true);
        } else {
          setVerificationText('User not found');
          ToastAndroid.show('User not found', ToastAndroid.SHORT);
        }
      }, 2000);
    }
    else {
      setTimeout(() => {
        setLoading(false);
        if (number === '1234567890' && password === confirmPassword) {
          setVerificationText('Verified');
          ToastAndroid.show('Authentication Successful!', ToastAndroid.SHORT);
          navigation.navigate('BottomTabs');
        } else {
          setVerificationText('User not found');
          ToastAndroid.show('Invalid Credentials', ToastAndroid.SHORT);
        }
      }, 2000);
    }

  };

  const handleSubmit = () => {
    if (password === confirmPassword) {
      setShowSetPassword(false);
      setNewUser(false);
      ToastAndroid.show('Password has been set successfully!', ToastAndroid.SHORT);
    }
    else {
      setPasswordMatched(false);
      ToastAndroid.show('Password did not matched!', ToastAndroid.SHORT);
    }
  }

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

            <View style={styles.buttonContainer}>
              <Button icon="login" contentStyle={{ flexDirection: 'row-reverse' }} onPress={handleNext} disabled={loading} style={{ backgroundColor: "#8ABCF9" }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }} mode="contained">
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
            <Button icon="chevron-right" contentStyle={{ flexDirection: 'row-reverse' }} onPress={handleSubmit} disabled={loading} style={{ backgroundColor: "#8ABCF9" }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }} mode="contained">
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
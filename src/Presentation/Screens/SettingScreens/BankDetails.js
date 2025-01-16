import { View, Text, StyleSheet, Image, StatusBar, Pressable, BackHandler, ScrollView, Alert, PermissionsAndroid, Platform, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SharedPreferences from 'react-native-shared-preferences';

export default function BankDetails({ navigation }) {

    const [branchName, setBranchName] = useState(null);
    const [branchCode, setbranchCode] = useState(null);
    const [ClientName, setClientName] = useState(null);

    useEffect(() => {
        getMasterData();
    }, []);

    const getMasterData = async () => {
        try {
            const [savedData] = await Promise.all([
                AsyncStorage.getItem('dataObject'),
            ]);

            if (savedData) {
                const dataObject = JSON.parse(savedData);
                setBranchName(dataObject?.MstrData?.BrNameE || ''); // Set a fallback value if missing
                setbranchCode(dataObject?.MstrData?.BrCode);
                setClientName(dataObject.MstrData?.ClientName);
            }
        } catch (error) {
            console.log('Failed to fetch data from AsyncStorage:', error.message || error);
        }
    };
 
    // const filePath =
    //     Platform.Version >= 30
    //         ? `${RNFS.ExternalDirectoryPath}/MyAppData.json` // Scoped storage for Android 11+
    //         : `${RNFS.ExternalStorageDirectoryPath}/MyAppData.json`; // Shared storage for Android 8-10

    // const filePath = `${RNFS.DownloadDirectoryPath}/MyAppData.json`; // Public directory to persist data

    // const filePath = RNFS.DownloadDirectoryPath + '/MyAppData.json'; 

    const downloadDir = RNFS.ExternalStorageDirectoryPath; // Access the download directory
    // const filePath = `${downloadDir}/MyAppData.json`; // Replace 'your_file.txt' with your actual file name

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 30) {
                    // Check if MANAGE_EXTERNAL_STORAGE is granted
                    const manageStorageGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
                        {
                            title: 'Manage Storage Permission',
                            message: 'This app requires access to manage all files on your device.',
                        }
                    );

                    if (manageStorageGranted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Manage Storage Permission granted');
                    } else {
                        Alert.alert(
                            'Permission Denied',
                            'Please enable "All Files Access" in your device settings for this app.',
                            [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
                        );
                    }
                } else {
                    // Request WRITE_EXTERNAL_STORAGE for Android 10 and below
                    const writePermission = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission',
                            message: 'This app requires access to your storage to save files.',
                        }
                    );

                    if (writePermission === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Write External Storage Permission granted');
                    } else {
                        Alert.alert(
                            'Permission Denied',
                            'Storage permission is required to save files.',
                            [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
                        );
                    }
                }
            } catch (error) {
                console.error('Permission request error:', error);
                Alert.alert('Error', 'An unexpected error occurred while requesting permissions.');
            }
        }
    };

    // Create and Save File
    const createFile = async () => {
        const data = { key: 'value', anotherKey: 123 }; // Example JSON data
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await RNFS.writeFile(filePath, jsonData, 'utf8');
            Alert.alert('File Created', `File successfully created at: ${filePath}`);
            console.log('File created at:', filePath);
        } catch (error) {
            console.error('Error creating file:', error);
            Alert.alert('Error', 'Could not create the file.');
        }
    };

    // Read File
    const readFile = async () => {
        try {
            const fileExists = await RNFS.exists(filePath);
            if (fileExists) {
                const fileContent = await RNFS.readFile(filePath, 'utf8');

                const fileContents = await RNFS.readFile(filePath, 'utf8'); // Read as UTF-8 encoded string

                console.log('File content:', fileContents);
                // const parsedData = JSON.parse(fileContent);
                // Alert.alert('File Read', `File content: ${JSON.stringify(parsedData)}`);
                // console.log('File content:', parsedData);
            } else {
                Alert.alert('File Not Found', 'No file found at the specified path.');
                console.log('File does not exist.');
            }
        } catch (error) {
            console.error('Error reading file:', error);
            Alert.alert('Error', 'Could not read the file.');
        }
    };

    const [jsonData, setJsonData] = useState({});
    const [inputData, setInputData] = useState('');
  
    // Sample JSON data for storage
    const sampleJson = {
        id: 1,
        name: 'John Doe',
        age: 30,
        hobbies: ['Reading', 'Traveling', 'Coding'],
      };
    
      useEffect(() => {
        // Fetch stored JSON data when the app starts
        SharedPreferences.getItem('userData', (value) => {
          if (value) {
            setJsonData(JSON.parse(value));
          }
        });
      }, []);
    
      const storeJsonData = () => {
        // Convert JSON to string and store it in SharedPreferences
        const jsonString = JSON.stringify(sampleJson);
        SharedPreferences.setItem('userData', jsonString);  // Corrected to two arguments
        Alert.alert('Data stored successfully!');
      };
      const filePath = RNFS.DownloadDirectoryPath + '/MyAppData.json';

      const retrieveJsonData = () => {
        console.log("pressed ")
        // Retrieve the JSON string from external storage and parse it
        RNFS.readFile(filePath, 'utf8')
          .then((data) => {
            console.log( 'Data got',JSON.parse(data))
            setJsonData(JSON.parse(data));
          })
          .catch((error) => {
            Alert.alert('No data found or error reading file', error.message);
          });
      };
    
      const clearData = () => {
        // Clear all data in SharedPreferences
        SharedPreferences.clear(() => {
          setJsonData({});
          Alert.alert('All data cleared');
        });
      };

    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={() => { navigation.navigate("Profile") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: 125, height: 120, alignSelf: 'center', resizeMode: 'contain' }} source={require('../../Assets/Images/rupee.png')} />
                </View>
            </View>
            
            <Text style={[styles.keyName, {marginTop:15, textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>Client Details</Text>

            <View style={{ width: '85%', alignSelf: 'center', marginTop: '10%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15, alignItems: 'center' }}>
                    <MaterialCommunityIcons name='bank' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Client Name: </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none', width: '60%', textAlign: 'jusify' }]}>{ClientName ? ClientName : '-'}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15, alignItems: 'center' }}>
                    <MaterialCommunityIcons name='bank' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Branch Name:  </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none', width: '60%', textAlign: 'jusify' }]}>{branchName ? branchName : '-'}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='city' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Branch Code :  </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none' }]}>{branchCode ? branchCode : '-'}</Text>
                </View>
                <View style={{ width: windowWidth * 0.85, marginTop: 10, alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainView: {
        width: windowWidth * 1,
        height: windowHeight * 1,
        backgroundColor: '#FFFFFF'
    },
    profileView: {
        width: windowWidth * 1,
        height: windowHeight * 0.20,
        // backgroundColor: COLORS.lightGrey,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },
    profileIcon: {
        width: 125,
        height: 125,
        // borderWidth: 1,
        borderRadius: 180,
        overflow: 'hidden',
        padding: 2,
        resizeMode: 'cover',
        // backgroundColor: COLORS.primary,
        elevation: 5,
        position: 'absolute',
        top: windowHeight * 0.04
    },
    curveView: {
        width: windowWidth * 1,
        height: windowHeight * 0.10,
        backgroundColor: COLORS.primaryAccent,
        // position: 'absolute',
        marginBottom: 'auto',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        elevation: 5
    },
    lineView: {
        marginTop: 0,
        width: windowWidth * 0.85,
        height: windowHeight * 0.02,
        alignSelf: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary
    },
    lineText: {
        position: 'absolute',
        top: 3,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Montserrat-Bold',
        color: COLORS.darkGrey,
        alignSelf: 'flex-start',
        fontSize: 18
    },
    profileInfo: {
        marginTop: 10,
        width: windowWidth * 0.85,
        // backgroundColor: 'grey',
        alignSelf: 'center'
    },
    keyName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: COLORS.darkGrey
    },
    keyValue: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: COLORS.primary,
        textDecorationLine: 'underline'
    }
})
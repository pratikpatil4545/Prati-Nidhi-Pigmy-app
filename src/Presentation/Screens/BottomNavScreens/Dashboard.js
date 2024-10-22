import { View, Text, StyleSheet, ToastAndroid, ScrollView, StatusBar, Modal, Pressable, BackHandler, Keyboard, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import { Button, Searchbar } from 'react-native-paper'
import DataCard from '../../Components/DataCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import SearchPopup from '../../Components/SearchPopup';

export default function Dashboard({ navigation }) {

    const [dataAvailable, setDataAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedResults, setSearchedResults] = useState(false);
    const [backPressedOnce, setBackPressedOnce] = useState(false);
    const isFocused = useIsFocused();
    const [mappedMasterData, setMappedMasterData] = useState([]);
    const [NoOfRecords, setNoOfRecords] = useState(null);
    const [isDataValid, setIsDataValid] = useState(true);
    const [LicenseValidUpto, setLicenseValidUpto] = useState('2028-10-13');
    const [LicenseExpired, setLicenseExpired] = useState(false);
    const [ClientName, setClientName] = useState(null);
    const [BranchName, setBranchName] = useState(null);
    const [BranchCode, setBranchCode] = useState(null);
    const [AgentName, setAgentName] = useState(null);
    const [IsActive, setIsActive] = useState(true);
    const [fileCreatedDate, setFileCreatedDate] = useState(null);
    const [noOfDaysAllowed, setNoOfDaysAllowed] = useState(null);
    const [collectionAllowed, setCollectionAllowed] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionTable, setTransactionTable] = useState([]);

    // console.log("collection allowed?", collectionAllowed);

    useEffect(() => {
        const checkLicenseValidity = () => {
            const currentDate = new Date(); // Get current date
            const expiryDate = new Date(LicenseValidUpto); // Parse expiry date from the state
            const timeDiff = expiryDate.getTime() - currentDate.getTime(); // Get the difference in time (milliseconds)
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert time difference to days

            console.log("Days left until expiry:", daysLeft);

            if (daysLeft <= 0) {
                // If the current date is past the expiry date
                Alert.alert('License expired!', 'Your license has expired. Please pay subscription.');
                setLicenseExpired(true);
            } else if (daysLeft <= 15) {
                // If the current date is within 15 days of expiry
                Alert.alert('License Reminder', `Your license is about to expire in ${daysLeft} day(s). Please renew it soon.`);
            } else {
                console.log("License is valid and more than 15 days away from expiry.");
            }
        };

        checkLicenseValidity();

        // Set up a daily check for the reminder
        const interval = setInterval(checkLicenseValidity, 24 * 60 * 60 * 1000); // Check every 24 hours
        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, [LicenseValidUpto]);

    useEffect(() => {
        if (!IsActive) {
            Alert.alert('Account Activation', 'Your account has not active. Please contact your branch.');
            setLicenseExpired(true);
        }
    }, [LicenseValidUpto])

    useEffect(() => {
        // Calculate the end date by adding noOfDaysAllowed to the fileCreatedDate
        const fileDate = new Date(fileCreatedDate); // Convert to Date object
        const endDate = new Date(fileDate);
        endDate.setDate(fileDate.getDate() + parseInt(noOfDaysAllowed)); // Add allowed days

        const currentDate = new Date(); // Get today's date

        // Check if today's date is within the allowed date range
        // console.log("dates checkng",currentDate,'****', fileDate,'****', endDate )
        if (currentDate >= fileDate && currentDate <= endDate) {
            setCollectionAllowed(true); // Collection is allowed
            console.log("alloweded")
        } else {
            console.log("not alloweded")
            setCollectionAllowed(false); // Collection is not allowed
        }
    }, [fileCreatedDate, noOfDaysAllowed]);

    useEffect(() => {
        let len1 = parseInt(mappedMasterData.length);
        let len2 = parseInt(NoOfRecords);
        if (len1 && len2) {
            if (len1 != len2) {
                setIsDataValid(false);
                Alert.alert('Something went wrong while recieving data or data may be currupted please try again!')
            }
            else {
                setIsDataValid(true);
            }
        }
    }, [NoOfRecords, mappedMasterData.length])

    useEffect(() => {
        const handleBackPress = () => {
            if (backPressedOnce && !searchedResults) {
                BackHandler.exitApp();
            } else {
                setBackPressedOnce(true);
                ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                setTimeout(() => {
                    setBackPressedOnce(false);
                }, 2000);
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, [backPressedOnce]);

    const handleGetData = () => {
        setLoading(true);
        ToastAndroid.show('Getting latest data', ToastAndroid.SHORT);
        getFileContent();
    }

    const getFileContent = async () => {
        console.log("Checking for stored data...");
        try {
            // Step 1: Try to get data from AsyncStorage
            const savedData = await AsyncStorage.getItem('dataObject');
          
            
            if (savedData) {
                // Step 2: If data is found in AsyncStorage, use it
                console.log("Using saved data from AsyncStorage");
                const dataObject = JSON.parse(savedData);
    
                // Set state using the saved data
                setMappedMasterData(dataObject.MstrData?.MstrRecs);
                setDataAvailable(true);
                setNoOfRecords(dataObject.MstrData?.NoOfRecords);
                setLicenseValidUpto(dataObject.MstrData?.LicenseValidUpto);
                setClientName(dataObject.MstrData?.ClientName);
                setBranchName(dataObject.MstrData?.BrNameE);
                setBranchCode(dataObject.MstrData?.BrCode);
                setAgentName(dataObject.MstrData?.AgNameE);
                setIsActive(dataObject.MstrData?.IsActive ? true : false);
                setFileCreatedDate(dataObject.MstrData?.FileCreateDate);
                setNoOfDaysAllowed(30); // or set based on dataObject if required
    
                // ToastAndroid.show('Loaded data from local storage', ToastAndroid.SHORT);
    
            } else {
                // Step 3: If no data is found, hit the API
                console.log("No saved data found, making API call...");
                const mobileNumber = await AsyncStorage.getItem('mobileNumber');
    
                if (mobileNumber) {
                    const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/Test_Req?MobileNo=1234567890`;
    
                    const response = await axios.get(url, {
                        headers: {
                            'Content-Type': 'text/xml',
                        },
                    });
    
                    const parser = new XMLParser();
                    const jsonResponse = parser.parse(response.data);
                    const jsonString = jsonResponse.string;
                    const dataObject = JSON.parse(jsonString);
    
                    // Save the dataObject in AsyncStorage for future use
                    await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
    
                    // Set state using the API data
                    setMappedMasterData(dataObject.MstrData?.MstrRecs);
                    setDataAvailable(true);
                    setNoOfRecords(dataObject.MstrData?.NoOfRecords);
                    setLicenseValidUpto(dataObject.MstrData?.LicenseValidUpto);
                    setClientName(dataObject.MstrData?.ClientName);
                    setBranchName(dataObject.MstrData?.BrNameE);
                    setBranchCode(dataObject.MstrData?.BrCode);
                    setAgentName(dataObject.MstrData?.AgNameE);
                    setIsActive(dataObject.MstrData?.IsActive ? true : false);
                    setFileCreatedDate(dataObject.MstrData?.FileCreateDate);
                    setNoOfDaysAllowed(30); // or set based on dataObject if required
    
                    ToastAndroid.show('API call successful and data saved!', ToastAndroid.SHORT);
                } else {
                    console.warn('No mobile number found in AsyncStorage.');
                    ToastAndroid.show('No mobile number found!', ToastAndroid.SHORT);
                }
            }
        } catch (error) {
            console.error('Error occurred:', error);
            ToastAndroid.show('Error occurred!', ToastAndroid.SHORT);
        } finally {
            setLoading(false); // Set loading state to false
        }
    };
    
    useFocusEffect(
        useCallback(() => {
            // Check if 'password' exists in AsyncStorage
            const checkPasswordInStorage = async () => {
                const password = await AsyncStorage.getItem('password');
                if (password) {
                    // If password exists, load data
                    getFileContent();
                } else {
                    // If password does not exist, skip the API call
                    console.log("No password found in AsyncStorage. Skipping data load.");
                }
            };

            checkPasswordInStorage();
        }, []) // Empty dependency array means it only runs when screen is focused
    );

    const renderItem = useCallback(
        ({ item, index }) => (
            <DataCard collectionAllowed={collectionAllowed} searchQuery={searchQuery} key={index} index={index} item={item} />
        ),
        [searchQuery, mappedMasterData]
    );

  useEffect(() => {
    const fetchTransactionTable = async () => {
      try {
        const transactionTableData = await AsyncStorage.getItem('transactionTable');
        if (transactionTableData) {
          const parsedData = JSON.parse(transactionTableData);  // Parse the stored data
          setTransactionTable(parsedData);

          const total = parsedData.reduce((sum, transaction) => {
            return sum + (parseFloat(transaction.collectionAmount) || 0);
          }, 0);

          setTotalAmount(total);
        }
      } catch (error) {
        console.error('Error fetching transaction table from AsyncStorage:', error);
      }
    };

    fetchTransactionTable();
  }, []);

    return (
        <View style={styles.dashView}>
            <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

            {dataAvailable && isDataValid ? (
                <>
                    <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Searchbar
                            placeholder="Search by Name or A/C No"
                            onChangeText={setSearchQuery}
                            // loading={true}
                            value={searchQuery}
                            autoFocus={searchedResults}
                            onIconPress={() => { setSearchedResults(false), setSearchQuery(''), Keyboard.dismiss() }}
                            icon={searchedResults ? 'arrow-left-thin' : 'magnify'}
                            iconColor={COLORS.primary}
                            onPress={() => { setSearchedResults(true) }}
                            elevation={1}
                            style={{
                                width: '80%',
                                alignSelf: 'center',
                                // marginTop: 20,
                                backgroundColor: '#FFFFFF',
                                elevation: 15,
                            }}
                        />
                        <Pressable onPress={() => { navigation.navigate('Profile') }}>
                            <MaterialCommunityIcons2 name='user-circle' style={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    {searchedResults ? (
                        <>
                            <SearchPopup mappedMasterData={mappedMasterData} setSearchedResults={setSearchedResults} searchQuery={searchQuery} />
                        </>
                    ) : (
                        <View style={{ height: windowHeight * 0.80 }}>
                            <View style={[styles.dataInfoView, { width: windowWidth * 0.90, alignSelf: 'center', flexDirection: 'row', height: 50 }]}>
                                <View>
                                    {/* <Text style={styles.text}>Client Name</Text> */}
                                    <Text style={[styles.text, { fontSize: 14, fontFamily: 'Montserrat-Bold' }]}>{ClientName} </Text>
                                </View>
                                <View>
                                    <Text style={styles.text}>Branch</Text>
                                    <Text style={[styles.text, { fontSize: 14, fontFamily: 'Montserrat-Bold' }]}>{BranchName} ({BranchCode}) </Text>
                                </View>
                            </View>

                            <View>
                                <Text style={[styles.text, { marginTop: 10, marginBottom: 0, marginLeft: 20 }]}>Agent Name: <Text style={[styles.text, { fontSize: 14, fontFamily: 'Montserrat-Bold' }]}>{AgentName} </Text></Text>
                            </View>
                            <View style={{ width: windowWidth * 1, height: windowHeight * 0.12, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                <View style={styles.dataInfoView}>
                                    <Text style={styles.text}>Total Receipts </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{NoOfRecords} </Text>
                                </View>
                                <View style={styles.dataInfoView}>
                                    <Text style={styles.text}>Total collected </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>₹{totalAmount}.00</Text>
                                </View>
                            </View>

                            {!collectionAllowed &&
                                <View>
                                    <Text style={{color: '#CC5500', fontSize: 16, alignSelf: 'center', marginTop: 10, marginBottom: 10, fontFamily: 'Montserrat-Bold'}}>The collection window has expired.</Text>
                                </View>
                            }

                            <FlatList
                                data={mappedMasterData}
                                renderItem={renderItem}
                                keyExtractor={(item) => `${item.GLCode}-${item.AccountNo}`} // Concatenate values for a unique key
                                initialNumToRender={10}  // Adjust based on testing
                                maxToRenderPerBatch={10} // Specifies how many items should be rendered at a time
                                windowSize={5}           // Number of items to keep in memory for the window
                                onEndReachedThreshold={0.5} // Load more data when 50% of the content is visible
                                ListEmptyComponent={<Text>No data available</Text>}
                                ListFooterComponent={<ActivityIndicator />} // Loader for when more data is fetched
                            />
                        </View>
                    )}
                </>
            ) : (
                <>
                    <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Searchbar
                            placeholder="Search by Name or A/C No"
                            onChangeText={setSearchQuery}
                            // loading={true}
                            value={searchQuery}
                            autoFocus={searchedResults}
                            onIconPress={() => { setSearchedResults(false), setSearchQuery(''), Keyboard.dismiss() }}
                            icon={searchedResults ? 'arrow-left-thin' : 'magnify'}
                            iconColor={COLORS.primary}
                            onPress={() => { setSearchedResults(true) }}
                            elevation={1}
                            style={{
                                width: '80%',
                                alignSelf: 'center',
                                // marginTop: 20,
                                backgroundColor: '#FFFFFF',
                                elevation: 15,
                            }}
                        />
                        <Pressable onPress={() => { navigation.navigate('Profile') }}>
                            <MaterialCommunityIcons2 name='user-circle' style={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    {!LicenseExpired ? (
                        <View style={styles.notFound}>
                            <MaterialCommunityIcons name='cloud-off-outline' style={{ marginBottom: 20 }} color={COLORS.primary} size={50} />
                            <Text style={styles.text1}>Data not found !</Text>

                            {/* Only show the Get Data button if IsActive is true */}
                            {IsActive && (
                                <View style={styles.getData}>
                                    <Button
                                        loading={loading}
                                        disabled={loading}
                                        labelStyle={{ fontFamily: 'Montserrat-Bold', fontSize: 18 }}
                                        style={{ marginTop: 30, width: '50%' }}
                                        mode="contained"
                                        onPress={handleGetData}
                                    >
                                        Start collection
                                    </Button>
                                </View>
                            )}

                        </View>
                    ) : (
                        <View style={styles.notFound}>
                            <Text style={styles.text1}>Your license has expired. Please pay subscription!</Text>
                        </View>
                    )}
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    dashView: {
        width: windowWidth * 1,
        height: windowHeight * 1,
        backgroundColor: '#FFFFFF'
    },
    text1: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: COLORS.gray
    },
    notFound: {
        width: windowWidth * 0.8,
        height: windowHeight * 0.80,
        // backgroundColor: COLORS.lightGrey,
        alignSelf: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    getData: {
        width: windowWidth * 1,
        height: windowHeight * 0.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: COLORS.primary
    },
    dataInfoView: {
        width: '45%',
        height: 80,
        borderRadius: 10,
        // alignSelf: 'center',
        // marginTop: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#eef2fa',
        elevation: 2
    },
    text: {
        fontFamily: 'Montserrat-SemiBold',
        color: COLORS.gray,
        marginLeft: 10
    },
    lineView: {
        marginTop: 20,
        width: windowWidth * 0.85,
        height: windowHeight * 0.02,
        alignSelf: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary
    },
    lineText: {
        position: 'absolute',
        top: 5,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Montserrat-Bold',
        color: COLORS.gray,
        alignSelf: 'flex-start',
        fontSize: 16
    },
    curveView: {
        width: windowWidth * 1,
        height: windowHeight * 0.18,
        backgroundColor: COLORS.primaryAccent,
        // position: 'absolute',
        marginBottom: 'auto',
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
        elevation: 5
    },
    modalView: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        marginTop: 1,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 20,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    cloudIcon: {
        marginBottom: 20,
    },
})
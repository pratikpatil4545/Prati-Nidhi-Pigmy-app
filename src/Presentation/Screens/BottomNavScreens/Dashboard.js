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
import TransactionCard from '../../Components/TransactionCard';

export default function Dashboard({ navigation, route }) {

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
    const [multipleCollection, setMultipleCollection] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionTable, setTransactionTable] = useState([]);
    const [isAuth, setIsAuth] = useState(true);
    // console.log("collection allowed?", collectionAllowed);
    // const [recentTransactions, setRecentTransactions] = useState(MockData.recentTransactions);

    useEffect(() => {
        if (route.params?.search === true) {
            setSearchedResults(true);
        }
        setSearchQuery('');
    }, [isFocused])

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
        if (!fileCreatedDate || !noOfDaysAllowed) return;

        const fileDate = new Date(fileCreatedDate);
        const endDate = new Date(fileDate);
        endDate.setDate(fileDate.getDate() + parseInt(noOfDaysAllowed));

        const currentDate = new Date();

        if (currentDate >= fileDate && currentDate <= endDate) {
            setCollectionAllowed(true);
        } else {
            setCollectionAllowed(false);
        }
    }, [fileCreatedDate, noOfDaysAllowed]);


    useEffect(() => {
        let len1 = parseInt(mappedMasterData?.length);
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
    }, [NoOfRecords, mappedMasterData?.length])

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
        // setLoading(true);
        ToastAndroid.show('Getting latest data', ToastAndroid.SHORT);
        getFileContent();
        // getApi();
    }

    // const getApi = async() => {
    //     try {
    //         const response = await fetch('http://postman-echo.com/get');
    //         const jsonResponse = await response.json();
    //         Alert.alert('Success API Response Parth sir', JSON.stringify(jsonResponse));
    //       } catch (error) {
    //         Alert.alert('Error, Parth sir', 'Something went wrong');
    //       }
    // }

    const getFileContent = async () => {
        // console.log("Checking for stored data...");
        setLoading(true);
        try {
            const savedData = await AsyncStorage.getItem('dataObject');
            if (savedData) {
                const dataObject = JSON.parse(savedData);
                // console.log("Using saved data from AsyncStorage", dataObject.MstrData?.AllowMultipleColln);
                // setHeadersData
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
                setNoOfDaysAllowed(dataObject.MstrData?.NoOfDaysAllowed);
                // setMultipleCollection(false)
                setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false)

            } else {
                console.log("No saved data found, making API call...");
                const mobileNumber = await AsyncStorage.getItem('mobileNumber');

                if (mobileNumber) {
                    const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/RequestData_App?MobileNo=${mobileNumber}`;
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/xml',
                        },
                    });

                    // Use response.text() to get the response body as a string
                    const responseText = await response.text();

                    const parser = new XMLParser(); // Ensure this is imported correctly
                    const jsonResponse = parser.parse(responseText); // Parse XML response

                    // Assuming the relevant data is inside jsonResponse.string
                    const jsonString = jsonResponse.string;
                    const dataObject = JSON.parse(jsonString);
                    console.log("responseText:", dataObject.ResonseCode);

                    if (dataObject.ResonseCode === '0000') {
                        await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
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
                        setNoOfDaysAllowed(dataObject.MstrData?.NoOfDaysAllowed);
                        // setMultipleCollection(false)
                        setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false)
                        ToastAndroid.show('API call successful and data saved!', ToastAndroid.SHORT);
                    }
                    else {
                        Alert.alert(
                            'Unauthorized User',
                            'This mobile number is not registered.'
                        );
                        setDataAvailable(false);
                        setIsAuth(false);
                    }

                } else {
                    setDataAvailable(false);
                    console.warn('No mobile number found in AsyncStorage.');
                    ToastAndroid.show('No mobile number found!', ToastAndroid.SHORT);
                }
            }
        } catch (error) {
            setDataAvailable(false);
            // Capture error details
            console.error('Error occurred:', error);
            ToastAndroid.show('Error occurred!', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
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
            <DataCard BranchName={BranchName} BranchCode={BranchCode} collectionAllowed={collectionAllowed} multipleCollection={multipleCollection} searchQuery={searchQuery} key={index} index={index} item={item} />
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
                    console.log("No saved data found, making API call...", total);

                    setTotalAmount(total);
                }
            } catch (error) {
                console.error('Error fetching transaction table from AsyncStorage:', error);
            }
        };

        fetchTransactionTable();
    }, [isFocused]);

    const handleCloseCollection = () => {
        if(collectionAllowed === true) {
          Alert.alert('Closing collection', `You have collected ${transactionTable.length} reciepts out of ${NoOfRecords}. and total collected amount is Rs ${totalAmount}.00/-`)
        }
        else if(collectionAllowed == false){
          Alert.alert('Cannot Close collection!', `Collection is not allowed, allowed day's are expired`)
        }
      }

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
                        <Pressable onPress={() => { navigation.navigate('Profile', { count: NoOfRecords, amount: totalAmount, collectionAllowed: collectionAllowed }) }}>
                            <MaterialCommunityIcons2 name='user-circle' style={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    {searchedResults ? (
                        <>
                            <SearchPopup BranchName={BranchName} BranchCode={BranchCode} collectionAllowed={collectionAllowed} multipleCollection={multipleCollection} mappedMasterData={mappedMasterData} setSearchedResults={setSearchedResults} searchQuery={searchQuery} />
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
                                    <Text style={{ color: '#CC5500', fontSize: 16, alignSelf: 'center', marginTop: 10, marginBottom: 10, fontFamily: 'Montserrat-Bold' }}>The collection window has expired.</Text>
                                </View>
                            }

                            {/* <FlatList
                                data={mappedMasterData}
                                renderItem={renderItem}
                                keyExtractor={(item) => `${item.GLCode}-${item.AccountNo}`} // Concatenate values for a unique key
                                initialNumToRender={10}  // Adjust based on testing
                                maxToRenderPerBatch={10} // Specifies how many items should be rendered at a time
                                windowSize={5}           // Number of items to keep in memory for the window
                                onEndReachedThreshold={0.5} // Load more data when 50% of the content is visible
                                ListEmptyComponent={<Text>No data available</Text>}
                                ListFooterComponent={<ActivityIndicator />} // Loader for when more data is fetched
                            /> */}

                            <View style={styles.lineView}>
                                <Text style={styles.lineText}>Recent transactions </Text>
                            </View>

                            {transactionTable && transactionTable.length > 0 &&
                                <View>
                                    <Button icon={'arrow-up'} onPress={handleCloseCollection} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: 30, alignSelf: 'flex-end', marginRight: 20 }} mode="contained">Close collection</Button>
                                </View>
                            }

                            <ScrollView style={{ marginTop: 20, marginBottom: 40 }}>
                                <>
                                    {transactionTable && transactionTable.length > 0 ? (    
                                        transactionTable.map((item, index) => (
                                            <TransactionCard searchQuery={searchQuery} item={item} key={index} index={index} />
                                        ))
                                    ) : (
                                        <Text style={[styles.text1, { margin: 'auto', marginTop: 100 }]}>No transactions yet</Text>
                                    )}
                                </>

                            </ScrollView>
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
                        <Pressable onPress={() => { navigation.navigate('Profile', { count: NoOfRecords, amount: totalAmount, collectionAllowed: collectionAllowed }) }}>
                            <MaterialCommunityIcons2 name='user-circle' styl={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    {!isAuth &&
                        <View>
                            <Button
                                labelStyle={{ fontFamily: 'Montserrat-Bold', fontSize: 14 }}
                                style={{ marginTop: 10, width: '32%', alignSelf: 'flex-end' }}
                                mode="outlined"
                                icon={'logout'}
                                contentStyle={{ flexDirection: 'row-reverse' }}
                            >
                                Logout
                            </Button>
                        </View>
                    }
                    {!LicenseExpired ? (
                        <>
                            {loading ? (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                </View>
                            ) : (
                                <View style={styles.notFound}>
                                    <MaterialCommunityIcons name='cloud-off-outline' style={{ marginBottom: 20 }} color={COLORS.primary} size={50} />
                                    <Text style={styles.text1}>Data not found!</Text>

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
                            )}
                        </>

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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
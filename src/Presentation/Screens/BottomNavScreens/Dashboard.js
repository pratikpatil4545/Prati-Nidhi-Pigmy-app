import { View, Text, StyleSheet, ToastAndroid, ScrollView, StatusBar, Modal, Pressable, BackHandler, Keyboard, TouchableOpacity, ActivityIndicator, FlatList, Alert, Linking } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import { Button, Searchbar, TextInput } from 'react-native-paper'
import DataCard from '../../Components/DataCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/MaterialIcons';
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
    const [headerLastAccNo, setHeaderLastAccNo] = useState(null);
    const [NoOfRecords, setNoOfRecords] = useState(null);
    const [isDataValid, setIsDataValid] = useState(true);
    const [LicenseValidUpto, setLicenseValidUpto] = useState('2028-10-13');
    const [LicenseExpired, setLicenseExpired] = useState(false);
    const [ClientName, setClientName] = useState(null);
    const [BranchName, setBranchName] = useState(null);
    const [BranchCode, setBranchCode] = useState(null);
    const [AgentName, setAgentName] = useState(null);
    const [IsActive, setIsActive] = useState(true);
    const [AllowNewUser, setAllowNewUser] = useState(true);
    const [fileCreatedDate, setFileCreatedDate] = useState(null);
    const [noOfDaysAllowed, setNoOfDaysAllowed] = useState(null);
    const [InputFileType, setInputFileType] = useState(null);
    const [ClientID, setClientId] = useState(null);
    const [BrCode, setBrCode] = useState(null);
    const [AgCode, setAgCode] = useState(null);
    const [BrAgCode, setBrAgCode] = useState(null);
    const [FileCreateDate, setFileCreateDate] = useState(null);
    const [GlLastAcc, setGlLastAcc] = useState(null);
    const [collectionAllowed, setCollectionAllowed] = useState(true);
    const [multipleCollection, setMultipleCollection] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionTable, setTransactionTable] = useState([]);
    const [isAuth, setIsAuth] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState(null);
    const [name, setName] = useState(null);
    const [mobileNumber, setmobileNumber] = useState(null);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    // console.log("states checking", dataAvailable, isDataValid, isFirstLogin)

    // console.log("Last acc number?", (parseInt(GlLastAcc[0]) + 1));
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
                // console.log("License is valid and more than 15 days away from expiry.");
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

    const handleGetData = async () => {
        // setLoading(true);
        ToastAndroid.show('Getting latest data', ToastAndroid.SHORT);
        getFileContent();
        await AsyncStorage.setItem('firstLoginComplete', 'true');
        setIsFirstLogin(false);
        // getApi();
    }

    const getFileContent = async () => {
        setLoading(true);
        try {
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

                const responseText = await response.text();

                const parser = new XMLParser();
                const jsonResponse = parser.parse(responseText);

                const jsonString = jsonResponse.string;
                const dataObject = JSON.parse(jsonString);
                console.log("responseText:", dataObject.MstrData?.FileCreateDate);

                if (dataObject.ResonseCode === '0000') {
                    await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
                    setMappedMasterData(dataObject.MstrData?.MstrRecs);
                    setHeaderLastAccNo(dataObject.MstrData?.HdrLastAcNo);
                    setDataAvailable(true);
                    setNoOfRecords(dataObject.MstrData?.NoOfRecords);
                    setLicenseValidUpto(dataObject.MstrData?.LicenseValidUpto);
                    setClientName(dataObject.MstrData?.ClientName);
                    setBranchName(dataObject.MstrData?.BrNameE);
                    setBranchCode(dataObject.MstrData?.BrCode);
                    setAgentName(dataObject.MstrData?.AgNameE);
                    setIsActive(dataObject.MstrData?.IsActive ? true : false);
                    setAllowNewUser((dataObject.MstrData?.NewAcOpenAllowed === 'True') ? true : false);
                    setFileCreatedDate(dataObject.MstrData?.FileCreateDate);
                    setNoOfDaysAllowed(dataObject.MstrData?.NoOfDaysAllowed);
                    setClientId(dataObject.MstrData?.ClientID);
                    setAgCode(dataObject.MstrData?.AgCode);
                    setBrCode(dataObject.MstrData?.BrCode);
                    setBrAgCode(dataObject.MstrData?.BrAgCode);
                    setFileCreateDate(dataObject.MstrData?.FileCreateDate);
                    setInputFileType(dataObject.MstrData?.InputFileType);
                    setGlLastAcc(dataObject.MstrData?.GLLastAc);
                    // setMultipleCollection(false)
                    setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false)
                    // ToastAndroid.show('API call successful and data saved!', ToastAndroid.SHORT);
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
                // }
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

    useEffect(() => {
        const checkFirstLogin = async () => {
            const firstLoginComplete = await AsyncStorage.getItem('firstLoginComplete');
            if (!firstLoginComplete) {
                setIsFirstLogin(true);  // Show "Start collection" button
            } else {
                getFileContent();  // Automatically load data if not first login
            }
        };
        checkFirstLogin();
    }, []);

    // useFocusEffect(
    //     useCallback(() => {
    //         // Check if 'password' exists in AsyncStorage
    //         const checkPasswordInStorage = async () => {
    //             const password = await AsyncStorage.getItem('password');
    //             if (password) {
    //                 // If password exists, load data
    //                 // getFileContent();
    //             } else {
    //                 // If password does not exist, skip the API call
    //                 console.log("No password found in AsyncStorage. Skipping data load.");
    //             }
    //         };

    //         checkPasswordInStorage();
    //     }, []) // Empty dependency array means it only runs when screen is focused
    // );

    const fetchTransactionTable = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionTable');
            if (transactionTableData) {
                const parsedData = JSON.parse(transactionTableData);  // Parse the stored data
                setTransactionTable(parsedData);

                const total = parsedData.reduce((sum, transaction) => {
                    return sum + (parseFloat(transaction.Collection) || 0);
                }, 0);
                // console.log("No saved data found, making API call...", total);

                setTotalAmount(total);
            }
        } catch (error) {
            console.error('Error fetching transaction table from AsyncStorage:', error);
        }
    };

    useEffect(() => {
        fetchTransactionTable();
    }, [isFocused]);

    const handleCloseCollection = async () => {
        setButtonLoading(true);
        if (collectionAllowed === false) {
            Alert.alert('Cannot Close collection!', `Collection is not allowed, allowed day's are expired`);
            setButtonLoading(false);
            return;
        }

        Alert.alert(
            'Close Collection',
            'Do you really want to close the collection?',
            [
                { text: 'Cancel', style: 'cancel', onPress: () => setButtonLoading(false) },
                {
                    text: 'Yes',
                    onPress: async () => {
                        const mobileNumber = await AsyncStorage.getItem('mobileNumber');

                        if (mobileNumber) {
                            const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/ConfirmData_FromApp?MobileNo=${mobileNumber}&Fdate=${FileCreateDate}`;
                            const response = await fetch(url, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/xml',
                                },
                            });
                            const responseText = await response.text();
                            const parser = new XMLParser();
                            const jsonResponse = parser.parse(responseText);
                            const jsonString = jsonResponse.string;
                            const dataObject = JSON.parse(jsonString);
                            const responseString = dataObject.ResponseString;
                            const numberAfterHyphen = responseString.split('-')[1]?.trim();

                            console.log("Number after hyphen:", numberAfterHyphen, transactionTable.length);
                            let tempCount = parseInt(transactionTable.length);
                            if (parseInt(numberAfterHyphen) != parseInt(tempCount)) {
                                Alert.alert('Cannot Close collection!', `You have collected ${transactionTable.length} reciepts out of ${NoOfRecords}. and total collected amount is Rs ${totalAmount}.00/-`)
                                setButtonLoading(false);
                            }

                            else {

                                const agentmobileNumber = await AsyncStorage.getItem('mobileNumber');

                                if (agentmobileNumber) {

                                    const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/CloseCollection_FromApp`;
                                    let tempCount = parseInt(transactionTable.length);
                                    try {
                                        const response = await fetch(url, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                            },
                                            body: new URLSearchParams({
                                                MobileNo: agentmobileNumber,
                                                Fdate: FileCreateDate,
                                                NoofRecs: parseInt(tempCount)
                                            }).toString(),
                                        });

                                        const responseText = await response.text();
                                        const parser = new XMLParser();
                                        const jsonResponse = parser.parse(responseText);
                                        const jsonString = jsonResponse.string;
                                        const dataObject = JSON.parse(jsonString);
                                        const responseString = dataObject.ResonseCode;

                                        // let transactionHistoryTable = await AsyncStorage.getItem('transactionHistoryTable');
                                        // console.log('checkng transacrion history', transactionHistoryTable)
                                        // transactionHistoryTable = transactionHistoryTable ? JSON.parse(transactionHistoryTable) : [];
                                        // let transactionTable = await AsyncStorage.getItem('transactionTable');
                                        // transactionTable = transactionTable ? JSON.parse(transactionTable) : [];
                                        // transactionTable.forEach(transaction => {
                                        //     transactionHistoryTable.push(transaction);
                                        // });
                                        // console.log('checkng transacrion history after mapping; ', transactionTable)

                                        if (responseString === '0000') {
                                            ToastAndroid.show("Successfully closed Collections", ToastAndroid.LONG)
                                            // await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(transactionTable));

                                            // let transactionHistoryTable = await AsyncStorage.getItem('transactionHistoryTable');
                                            // transactionHistoryTable = transactionHistoryTable ? JSON.parse(transactionHistoryTable) : [];
                                            // transactionHistoryTable.push(transactionTable);
                                            // await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(transactionHistoryTable));
                                            // await AsyncStorage.removeItem('transactionTable');

                                            let transactionHistoryTable = await AsyncStorage.getItem('transactionHistoryTable');
                                            transactionHistoryTable = transactionHistoryTable ? JSON.parse(transactionHistoryTable) : [];
                                            let transactionTable = await AsyncStorage.getItem('transactionTable');
                                            transactionTable = transactionTable ? JSON.parse(transactionTable) : [];
                                            transactionTable.forEach(transaction => {
                                                transactionHistoryTable.push(transaction);
                                            });

                                            await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(transactionHistoryTable));
                                            await AsyncStorage.removeItem('transactionTable');
                                            // setLoading(true);
                                            setTransactionTable([]);
                                            setTotalAmount(0);
                                            fetchTransactionTable();
                                            setButtonLoading(false);
                                            setDataAvailable(false);
                                            // setIsDataValid(false);
                                        }
                                        else {
                                            setButtonLoading(false);
                                            ToastAndroid.show("error while closing Collections", ToastAndroid.LONG)
                                        }
                                        console.log("Response closed collection:", responseString);
                                    } catch (error) {
                                        setButtonLoading(false);
                                        ToastAndroid.show("Failed to close Collections. Please try again", ToastAndroid.LONG)
                                        console.error("Error during API call:", error);
                                    } finally {
                                        setButtonLoading(false);
                                        fetchTransactionTable();
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        setModalVisible(false);
    };
    let transactionCount = 1;

    const generateReceiptNo = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const count = String(transactionCount).padStart(4, '0');

        transactionCount++; // Increment for the next transaction

        return `${day}${month}${year}${count}`;
    };

    const formatDateTime1 = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const handleSubmit = async () => {
        let newAccNo;
        setModalVisible2(true);


        try {
            let transactionTable = await AsyncStorage.getItem('transactionTable');
            transactionTable = transactionTable ? JSON.parse(transactionTable) : [];

            const newAccounts = transactionTable.filter(item => item.IsitNew === 'True');

            if (newAccounts.length > 0) {
                const maxAccountNo = Math.max(...newAccounts.map(item => parseInt(item.AccountNo, 10)));
                newAccNo = maxAccountNo + 1;
            } else {
                if (InputFileType === '1' || InputFileType === '3') {
                    newAccNo = parseInt(headerLastAccNo, 10) + 1;
                }
                else if (InputFileType === '2') {
                    let glAcc = parseInt(GlLastAcc[0]);
                    if (glAcc === 999999) {
                        if (newAccounts.length > 0) {
                            const maxAccountNo = Math.max(...newAccounts.map(item => parseInt(item.AccountNo, 10)));
                            newAccNo = maxAccountNo + 1;
                        }
                        else {
                            newAccNo = 1;
                        }
                    }
                    else {
                        if (newAccounts.length > 0) {
                            const maxAccountNo = Math.max(...newAccounts.map(item => parseInt(item.AccountNo, 10)));
                            newAccNo = maxAccountNo + 1;
                        }
                        else {
                            newAccNo = glAcc + 1;
                        }
                    }
                }
            }

            setHeaderLastAccNo(newAccNo);

            const receiptNo = generateReceiptNo();

            const transactionData = {
                // receiptNo: receiptNo,
                GLCode: '0',
                AccountNo: newAccNo.toString(),
                EnglishName: name,
                OpeningBal: '0',
                Collection: amount.toString(),
                ClosingBal: amount.toString(),
                CollDateTime: formatDateTime1(new Date()),
                IsAmtAdd: "1",
                IsitNew: 'True',
                MobileNo: mobileNumber
            };

            const newArray = {
                ClientID: ClientID,
                BrCode: BrCode,
                AgCode: AgCode,
                BrAgCode: BrAgCode,
                FileCreateDate: FileCreateDate,
                InputFileType: InputFileType,
                NoOfRecords: '1',
                CollectionData: [
                    transactionData
                ]
            };

            console.log("new user array", transactionData);
            const agentmobileNumber = await AsyncStorage.getItem('mobileNumber');

            if (agentmobileNumber) {
                const newArrayString = JSON.stringify(newArray);

                const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp`;

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
                    });

                    const responseData = await response.text();
                    console.log("Response:", responseData);
                } catch (error) {
                    console.error("Error during API call:", error);
                }
            }

            transactionTable.push(transactionData);
            await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));
            // setModalVisible(false);
            // setName(null);
            // setmobileNumber(null);
            // setAmount(null);
            setModalVisible2(true);
            fetchTransactionTable();

        } catch (error) {
            console.error("Error while processing transaction:", error);
            Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
        }
    };

    const addNewUser = () => {
        setModalVisible(true);
    }

    const handleCancel2 = () => {
        setModalVisible2(false);
    };

    const formatDateTime = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const year = String(date.getFullYear()).slice(-2); // Last two digits of the year
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 24-hour to 12-hour format
        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    };

    const handleWhatsAppPress = async () => {
        const savedData = await AsyncStorage.getItem('dataObject');
        const dataObject = JSON.parse(savedData);

        // Define the message and phone number
        const getNumber = mobileNumber;
        const phoneNumber = `+91${getNumber}`; // Replace with the actual phone number (with country code)
        const message = `Hi, the amount has been successfully collected. Here is your receipt:
    
    Name: *${name}*
    Account No.: *${headerLastAccNo}*
    Opening Balance: *0.00*
    Amount Collected: *${amount}.00*
    Closing Balance: *${amount}.00*
    Agent Name: *${dataObject.MstrData?.AgNameE}*
    Collected date and time: ${formatDateTime(new Date())}`;


        // Create the WhatsApp URL with the correct format
        const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;

        Linking.openURL(url);

    };

    const handleSmsPress = async () => {
        const savedData = await AsyncStorage.getItem('dataObject');
        const dataObject = JSON.parse(savedData);

        const getNumber = mobileNumber;
        const phoneNumber = `+91${getNumber}`;
        const message = `Hi, the amount has been successfully collected. Here is your receipt:
      
      Name: ${name}
      Account No.: ${headerLastAccNo}
      Opening Balance: 0.00
      Amount Collected: ${amount}.00
      Closing Balance: ${amount}.00
      Agent Name: ${dataObject.MstrData?.AgNameE}
      Collected date and time: ${formatDateTime(new Date())}`;

        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        try {
            await Linking.openURL(smsUrl);
        } catch (error) {
            Alert.alert("Error", "Unable to open SMS app.");
        }
    };

    const handleSubmit2 = () => {
        setModalVisible(false);
        setModalVisible2(false);
    }

    return (
        <View style={styles.dashView}>
            <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

            {dataAvailable && !isFirstLogin && isDataValid ? (
                <>
                    <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Searchbar
                            placeholder="Search by Name or A/C No"
                            onChangeText={setSearchQuery}
                            // loading={true}
                            value={searchQuery}
                            disabled
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
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{transactionTable.length} </Text>
                                </View>
                                <View style={styles.dataInfoView}>
                                    <Text style={styles.text}>Total collected </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>₹{totalAmount}.00</Text>
                                </View>
                            </View>

                            {AllowNewUser &&
                                <View>
                                    <Button icon={'plus'} onPress={addNewUser} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: 5, marginBottom: -5, alignSelf: 'flex-end', marginRight: 20 }} mode="contained">Add new user</Button>
                                </View>
                            }

                            {!collectionAllowed &&
                                <View>
                                    <Text style={{ color: '#CC5500', fontSize: 16, alignSelf: 'center', marginTop: 10, marginBottom: 10, fontFamily: 'Montserrat-Bold' }}>The collection window has expired.</Text>
                                </View>
                            }

                            <View style={styles.lineView}>
                                <Text style={styles.lineText}>Recent transactions </Text>
                            </View>

                            {/* {transactionTable && transactionTable.length > 0 && */}
                            <View>
                                <Button icon={'arrow-up'} loading={buttonLoading} disabled={buttonLoading} onPress={handleCloseCollection} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: 30, alignSelf: 'flex-end', marginRight: 20 }} mode="contained">Close collection</Button>
                            </View>
                            {/*  } */}

                            <ScrollView style={{ marginTop: 20, marginBottom: 40 }}>
                                <>
                                    {transactionTable && transactionTable?.length > 0 ? (
                                        transactionTable
                                            ?.sort((a, b) => {
                                                const dateA = new Date(a.CollDateTime); // Convert to Date object
                                                const dateB = new Date(b.CollDateTime); // Convert to Date object
                                                return dateB - dateA; // Sort from latest (newer) to oldest (older)
                                            })
                                            ?.map((item, index) => (
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
                    {/* <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
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
                    </View> */}

                    {/* {!isAuth &&
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
                    } */}
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
                                                style={{ marginTop: 30, width: '80%' }}
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <StatusBar
                    barStyle={'light-content'}
                    backgroundColor={'rgba(0, 0, 0, 0.5)'}
                />
                <View style={styles.modalContainer}>
                    <View style={styles.modalView11}>
                        <Text style={styles.text}>New account Collection </Text>
                        <TextInput
                            label="Enter customer name"
                            mode='outlined'
                            outlineColor='#8ABCF9'
                            autoFocus={true}
                            // ref={textInputRef} 
                            value={name}
                            // keyboardType='numeric'
                            onChangeText={text => setName(text)}
                            style={{ width: "100%", marginBottom: 10, fontSize: 18, marginTop: 10, backgroundColor: COLORS.white }}
                            outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
                            contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
                        />
                        <TextInput
                            label="Enter mobile number"
                            mode='outlined'
                            outlineColor='#8ABCF9'
                            // autoFocus={true}
                            // ref={textInputRef} 
                            value={mobileNumber}
                            keyboardType='numeric'
                            onChangeText={text => setmobileNumber(text)}
                            style={{ width: "100%", marginBottom: 10, fontSize: 18, marginTop: 10, backgroundColor: COLORS.white }}
                            outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
                            contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
                        />

                        <TextInput
                            label="Enter amount"
                            mode='outlined'
                            outlineColor='#8ABCF9'
                            // autoFocus={true}
                            // ref={textInputRef} 
                            value={amount}
                            keyboardType='numeric'
                            onChangeText={text => setAmount(text)}
                            style={{ width: "100%", marginBottom: 10, fontSize: 18, marginTop: 10, backgroundColor: COLORS.white }}
                            outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
                            contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
                        />
                        <View style={styles.buttonContainer}>
                            <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit} >Submit</Button>
                            <Button style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleCancel} >Cancel</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible2}
                onRequestClose={handleCancel2}
            >
                <StatusBar
                    barStyle={'light-content'}
                    backgroundColor={'rgba(0, 0, 0, 0.5)'}
                />
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <View style={{
                        width: '90%',
                        padding: 30,
                        paddingBottom: 50,
                        paddingTop: 30,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        alignItems: 'center',
                    }}>
                        <MaterialCommunityIcons3 name='cloud-done' color={COLORS.primary} size={100} />
                        <View style={{
                            width: windowWidth * 0.85,
                            // height: 120,
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginTop: 20,
                            paddingTop: 10,
                            paddingBottom: 10,
                            // justifyContent: 'center',
                            // alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            backgroundColor: '#eef2fa',
                            elevation: 1
                        }}>
                            <View style={styles.left}>
                                <Text style={styles.text1}>Name : </Text>
                                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{name}</Text>
                                <Text style={styles.text1}>Account Number : </Text>
                                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{headerLastAccNo}</Text>
                                <Text style={styles.text1}>Opeing Balance : </Text>
                                <Text style={[styles.text1, { marginHorizontal: 25 }]}>0.00</Text>
                                <Text style={styles.text1}>Amount Collected : </Text>
                                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{amount}.00</Text>
                                <Text style={styles.text1}>Closing Balance : </Text>
                                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{amount}.00</Text>
                            </View>
                        </View>

                        <View style={[styles.buttonContainer, { marginTop: 30 }]}>
                            <Button
                                style={styles.modalButton}
                                mode="contained"
                                labelStyle={styles.buttonLabel}
                                onPress={handleSubmit2}
                            >
                                Close
                            </Button>
                            <Button
                                icon={'printer'}
                                style={styles.modalButton}
                                mode="outlined"
                                labelStyle={styles.buttonLabel}
                                onPress={() => { Alert.alert("Printing") }}
                            >
                                Print
                            </Button>
                        </View>

                        <View style={[styles.buttonContainer, { marginTop: 10, justifyContent: 'space-evenly' }]}>
                            {/* <Button
                style={styles.modalButton}
                mode="contained"
                labelStyle={styles.buttonLabel}
                onPress={handleNext}
              >
                Next
              </Button> */}
                            <MaterialCommunityIcons
                                onPress={handleWhatsAppPress}
                                style={styles.whatsappIcon}
                                name='whatsapp'
                                color={COLORS.white}
                                size={35}
                            />
                            <MaterialCommunityIcons
                                onPress={handleSmsPress}
                                style={styles.smsIcon}
                                name='android-messages'
                                color={COLORS.white}
                                size={35}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView11: {
        width: '90%',
        padding: 30,
        paddingBottom: 50,
        paddingTop: 30,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 5,
        borderColor: COLORS.primaryAccent,
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
    buttonLabel: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
    },
    whatsappIcon: {
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: '#25D366',
        borderRadius: 15,
        padding: 5,
    },
    smsIcon: {
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        padding: 5,
    }
})
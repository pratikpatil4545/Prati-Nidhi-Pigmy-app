import { View, Text, StyleSheet, ToastAndroid, ScrollView, StatusBar, Modal, Pressable, BackHandler, Keyboard, TouchableOpacity, ActivityIndicator, FlatList, Alert, Linking, Platform, PermissionsAndroid } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import { Button, Searchbar, TextInput } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { XMLParser } from 'fast-xml-parser';
import SearchPopup from '../../Components/SearchPopup';
import TransactionCard from '../../Components/TransactionCard';
import NetInfo from '@react-native-community/netinfo';
import { Buffer } from 'buffer';

export default function Dashboard({ navigation, route }) {

    const [dataAvailable, setDataAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedResults, setSearchedResults] = useState(false);
    const [backPressedOnce, setBackPressedOnce] = useState(false);
    const isFocused = useIsFocused();
    const [mappedMasterData, setMappedMasterData] = useState([]);
    const [headerLastAccNo, setHeaderLastAccNo] = useState(null);
    const [newAccCreated, setnewAccCreated] = useState(null);
    const [NoOfRecords, setNoOfRecords] = useState(null);
    const [isDataValid, setIsDataValid] = useState(true);
    const [LicenseValidUpto, setLicenseValidUpto] = useState(null);
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
    const [GLCode, setGLCode] = useState(null);
    const [pendingCount, setpendingCount] = useState(null);
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
    const [isConnected, setConnected] = useState(true);
    const [maxAmountLimit, setMaxAmountLimit] = useState(null);

    useEffect(() => {
        if (route.params?.search === true) {
            setSearchedResults(true);
        }
        setSearchQuery('');
    }, [isFocused])

    useEffect(() => {
        if (!fileCreatedDate || !noOfDaysAllowed) return;

        const fileDate = new Date(fileCreatedDate);
        const endDate = new Date(fileDate);
        endDate.setDate(fileDate.getDate() + parseInt(noOfDaysAllowed));

        const currentDate = new Date();
        if (currentDate >= fileDate && currentDate < endDate) {
            setCollectionAllowed(true);
        } else {
            setCollectionAllowed(false);
        }
    }, [fileCreatedDate, noOfDaysAllowed]);

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

    useEffect(() => {
        const checkFirstLogin = async () => {
            const firstLoginComplete = await AsyncStorage.getItem('firstLoginComplete');
            if (firstLoginComplete === 'true') {
                getFileContent();
            }
            else {
                setIsFirstLogin(true);
            }
        };
        checkFirstLogin();
    }, []);

    const handleGetData = async () => {
        getFileContent();
    }

    const getFileContent = async () => {
        setLoading(true);
        const firstLoginComplete = await AsyncStorage.getItem('firstLoginComplete');
        console.log("firstLoginComplete", firstLoginComplete)
        if ((firstLoginComplete === 'false') || (!firstLoginComplete)) {

            try {
                const mobileNumber = await AsyncStorage.getItem('mobileNumber');

                if (mobileNumber) {
                    const url = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/RequestData_App?MobileNo=${mobileNumber}`;
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

                    if (dataObject.ResonseCode === '0000') {
                        await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));

                        const licenseExpiryDate = dataObject.MstrData?.LicenseValidUpto;
                        setLicenseValidUpto(licenseExpiryDate);
                        const currentDate = new Date();
                        const expiryDate = new Date(licenseExpiryDate);
                        const timeDiff = expiryDate.getTime() - currentDate.getTime();
                        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        if (daysLeft < 0) {
                            Alert.alert('License expired!', 'Your license has expired. Please pay subscription.');
                        }

                        if (daysLeft <= 15 && daysLeft >= 0) {
                            Alert.alert('License Reminder', `Your license is about to expire in ${daysLeft} day(s). Please renew it soon.`);
                        }

                        let len1 = parseInt(dataObject.MstrData?.MstrRecs?.length);
                        let len2 = parseInt(dataObject.MstrData?.NoOfRecords);
                        if (len1 && len2) {
                            if (len1 != len2) {
                                setIsDataValid(false);
                                Alert.alert('Error', 'Something went wrong while recieving data or data may be currupted please try again!')
                                return;
                            }
                        }

                        setLicenseExpired(false);
                        setMappedMasterData(dataObject.MstrData?.MstrRecs);
                        setHeaderLastAccNo(dataObject.MstrData?.HdrLastAcNo);
                        setDataAvailable(true);
                        setNoOfRecords(dataObject.MstrData?.NoOfRecords);
                        // setLicenseValidUpto('2024-12-31');
                        // setLicenseValidUpto(dataObject.MstrData?.LicenseValidUpto);
                        await AsyncStorage.setItem('LicenseValidUpto', (dataObject.MstrData?.LicenseValidUpto).toString());
                        setClientName(dataObject.MstrData?.ClientName);
                        setBranchName(dataObject.MstrData?.BrNameE);
                        setBranchCode(dataObject.MstrData?.BrCode);
                        setAgentName(dataObject.MstrData?.AgNameE);
                        setIsActive(dataObject.MstrData?.IsActive ? true : false);
                        // setIsActive(false);
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
                        setGLCode(dataObject.MstrData?.GLCode);
                        setMaxAmountLimit(dataObject.MstrData?.AmountLimit);
                        // setMultipleCollection(false)
                        setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false);
                        setSearchedResults(true);
                        await AsyncStorage.setItem('firstLoginComplete', 'true');
                        setIsFirstLogin(false);
                    }
                    else {
                        // if (dataObject.ResonseCode != '0000') {
                        Alert.alert(
                            'Error:',/*  */
                            `Response Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`
                        );
                        // }
                        setDataAvailable(false);
                        setIsAuth(false);
                    }

                } else {
                    setDataAvailable(false);
                    if (!isConnected) {
                        Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
                    }
                    await AsyncStorage.removeItem('firstLoginComplete');
                }
            } catch (error) {
                setDataAvailable(false);
                Alert.alert('Error occurred:', error.message);
                await AsyncStorage.removeItem('firstLoginComplete');

                if (!isConnected) {
                    Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
                }
            } finally {
                setLoading(false);
            }
        }

        else if (firstLoginComplete === 'true') {
            try {
                const savedData = await AsyncStorage.getItem('dataObject');

                if (savedData) {
                    const dataObject = JSON.parse(savedData);
                    if (dataObject.ResonseCode === '0000') {
                        await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
                        const licenseExpiryDate = dataObject.MstrData?.LicenseValidUpto;
                        setLicenseValidUpto(licenseExpiryDate);
                        const currentDate = new Date();
                        const expiryDate = new Date(licenseExpiryDate);
                        const timeDiff = expiryDate.getTime() - currentDate.getTime();
                        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        console.log("days left when api called", daysLeft)
                        if (daysLeft < 0) {
                            Alert.alert('License expired!', 'Your license has expired. Please pay subscription.');
                        }

                        if (daysLeft <= 15 && daysLeft >= 0) {
                            Alert.alert('License Reminder', `Your license is about to expire in ${daysLeft} day(s). Please renew it soon.`);
                        }

                        setLicenseExpired(false);
                        setMappedMasterData(dataObject.MstrData?.MstrRecs);
                        setHeaderLastAccNo(dataObject.MstrData?.HdrLastAcNo);
                        setDataAvailable(true);
                        setNoOfRecords(dataObject.MstrData?.NoOfRecords);
                        await AsyncStorage.setItem('LicenseValidUpto', (dataObject.MstrData?.LicenseValidUpto).toString());
                        setClientName(dataObject.MstrData?.ClientName);
                        setBranchName(dataObject.MstrData?.BrNameE);
                        setBranchCode(dataObject.MstrData?.BrCode);
                        setAgentName(dataObject.MstrData?.AgNameE);
                        // console.log("is active??", dataObject.MstrData?.IsActive)
                        setIsActive(dataObject.MstrData?.IsActive ? true : false);
                        // setIsActive(false);
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
                        setGLCode(dataObject.MstrData?.GLCode);
                        setMaxAmountLimit(dataObject.MstrData?.AmountLimit);
                        // setMultipleCollection(false)
                        setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false);
                        setSearchedResults(true);
                    }
                    else {
                        if (dataObject.ResonseCode != '0000') {
                            Alert.alert(
                                'Error:',
                                `Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`
                            );
                        }
                        setDataAvailable(false);
                        setIsAuth(false);
                        if (!isConnected) {
                            Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
                        }
                    }

                } else {
                    setDataAvailable(false);
                    if (!isConnected) {
                        Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
                    }
                    await AsyncStorage.removeItem('firstLoginComplete');

                    console.warn('No mobile number found in AsyncStorage.');
                }
            } catch (error) {
                setDataAvailable(false);
                Alert.alert('Error occurred:', error.message);
                await AsyncStorage.removeItem('firstLoginComplete');
                if (!isConnected) {
                    Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        let unsubscribe
        let currentState

        unsubscribe = NetInfo.addEventListener(state => {
            if (currentState !== state.isConnected) {
                currentState = state.isConnected
                console.log("Is connected?", currentState);
                setConnected(currentState);
                if (currentState === true) {
                    sendDataInBackground()
                }
            }
        });

        return () => {
            console.log("unsubscribe");

            if (unsubscribe)
                unsubscribe();
        };
    }, []);

    const sendDataInBackground = async (ClientID, BrCode, AgCode, BrAgCode, FileCreateDate, InputFileType) => {
        const transactionTableData = await AsyncStorage.getItem('transactionTable');
        const parsedData = JSON.parse(transactionTableData) || [];
        const pendingTransactions = parsedData.filter((item) => item.pending === true);
        const savedData = await AsyncStorage.getItem('dataObject');
        const dataObject = JSON.parse(savedData);

        if (!isConnected || pendingTransactions.length === 0) {
            return;
        }

        const transactionsWithoutPending = pendingTransactions.map(({ pending, ...rest }) => rest);
        const newArray = {
            ClientID: dataObject.MstrData?.ClientID,
            BrCode: dataObject.MstrData?.BrCode,
            AgCode: dataObject.MstrData?.AgCode,
            BrAgCode: dataObject.MstrData?.BrAgCode,
            FileCreateDate: dataObject.MstrData?.FileCreateDate,
            InputFileType: dataObject.MstrData?.InputFileType,
            NoOfRecords: pendingTransactions.length.toString(),
            CollectionData: transactionsWithoutPending,
        };

        try {
            const response = await fetch(
                `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({ DataFromApp: JSON.stringify(newArray) }).toString(),
                }
            );

            const responseText = await response.text();

            try {
                const parser = new XMLParser();
                const jsonResponse = parser.parse(responseText);
                const jsonString = jsonResponse.string;
                const dataObject = JSON.parse(jsonString);
                const responseString = dataObject.ResonseCode;
                if (responseString === '0000') {
                    const updatedTransactionTable = parsedData.map((item) => {
                        if (item.pending) {
                            const { pending, ...rest } = item;
                            return rest;
                        }
                        return item;
                    });

                    await AsyncStorage.setItem('transactionTable', JSON.stringify(updatedTransactionTable));
                    fetchTransactionTable();
                    console.log("Updated transaction table stored successfully.");
                } else {
                    Alert.alert(
                        'Error:',
                        `Response Code : ${responseString}, ${dataObject.ResponseString}`
                    );
                }
            } catch (parseError) {
                console.log("Error parsing response as JSON:", parseError, "Response text:", responseText);
                Alert.alert("Error", `Failed to upload offline reciepts : ${responseText}`);
            }
        } catch (error) {
            console.log("Error during API call:", error);
            Alert.alert("Error", `Unexpected error during API call: ${error.message}`);
        }
    };

    const fetchTransactionTable = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionTable');
            if (transactionTableData) {
                const parsedData = JSON.parse(transactionTableData);
                setTransactionTable(parsedData);
                const pendingTransactions = parsedData.filter((item) => item.pending === true);
                setpendingCount(pendingTransactions.length);
                const total = parsedData.reduce((sum, transaction) => {
                    return sum + (parseFloat(transaction.Collection) || 0);
                }, 0);
                setTotalAmount(total);
            }
        } catch (error) {
            Alert.alert('Error fetching transaction table from Local storage:', error.message);
        }
    };

    useEffect(() => {
        fetchTransactionTable();
    }, [isFocused]);

    const handleCloseCollection = async () => {
        setButtonLoading(true);

        if (!isConnected) {
            Alert.alert('Cannot Close collection!', `You are offline, please connect to the Internet and try again.`);
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

                            const closeCollectionUrl = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/CloseCollection_FromApp`;
                            const dummyCloseCycleUrl = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/Dummy_CloseCycle`;
                            // let tempCount = 25;
                            let tempCount = parseInt(transactionTable.length);
                            // console.log("transacion count", tempCount)
                            try {
                                const closeCollectionResponse = await fetch(closeCollectionUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        MobileNo: mobileNumber,
                                        Fdate: FileCreateDate,
                                        NoofRecs: tempCount,
                                    }).toString(),
                                });

                                const closeCollectionText = await closeCollectionResponse.text();
                                const parser = new XMLParser();
                                const closeCollectionJson = parser.parse(closeCollectionText);
                                const closeCollectionData = JSON.parse(closeCollectionJson.string);
                                const closeCollectionResponseCode = closeCollectionData.ResonseCode;

                                if (closeCollectionResponseCode === '0000') {
                                    const dummyCloseCycleResponse = await fetch(dummyCloseCycleUrl, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: new URLSearchParams({
                                            MobileNo: mobileNumber,
                                            Fdate: FileCreateDate,
                                            NoofRecs: tempCount,
                                        }).toString(),
                                    });

                                    const dummyCloseCycleText = await dummyCloseCycleResponse.text();
                                    const dummyCloseCycleJson = parser.parse(dummyCloseCycleText);
                                    const dummyCloseCycleData = JSON.parse(dummyCloseCycleJson.string);
                                    const dummyCloseCycleResponseCode = dummyCloseCycleData.ResonseCode;

                                    if (dummyCloseCycleResponseCode !== '0000') {
                                        throw new Error(
                                            `DummyCloseCycle Error: Code ${dummyCloseCycleResponseCode}, ${dummyCloseCycleData.ResponseString}`
                                        );
                                    }

                                    Alert.alert("Success", "Successfully closed Collections");

                                    let transactionHistoryTable = await AsyncStorage.getItem('transactionHistoryTable');
                                    transactionHistoryTable = transactionHistoryTable ? JSON.parse(transactionHistoryTable) : [];
                                    let transactionTableData = await AsyncStorage.getItem('transactionTable');
                                    transactionTableData = transactionTableData ? JSON.parse(transactionTableData) : [];
                                    transactionTableData.forEach(transaction => {
                                        transactionHistoryTable.push(transaction);
                                    });

                                    await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(transactionHistoryTable));
                                    await AsyncStorage.removeItem('transactionTable');
                                    setTransactionTable([]);
                                    fetchTransactionTable();
                                    setDataAvailable(false);
                                    setMaxAmountLimit(null);
                                    setNoOfDaysAllowed(null);
                                    setTotalAmount(null);
                                    setpendingCount(0)
                                    await AsyncStorage.setItem('firstLoginComplete', 'false');
                                }
                                else {
                                    Alert.alert('Error', ` Response Code - ${closeCollectionResponseCode} - ${closeCollectionData?.ResponseString} `)
                                }

                            } catch (error) {
                                Alert.alert('Error', error.message);
                            } finally {
                                setButtonLoading(false);
                                fetchTransactionTable();
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

        transactionCount++;

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

    const [collectionDate, setCollectionDate] = useState(null);

    const handleSubmit = async () => {
        let newAccNo;
        const mobileValidation = () => {
            if (!mobileNumber) {
                Alert.alert('Warning', `Please enter customer's Mobile Number`);
                return false;
            }
            if (mobileNumber.length !== 10 || /\D/.test(mobileNumber)) {
                Alert.alert('Warning', `Please enter a valid 10-digit mobile number`);
                return false;
            }
            return true;
        };

        if (!amount) {
            Alert.alert('Warning', `Please enter collection amount!`);
            return;
        }

        if (!name) {
            Alert.alert('Warning', `Please enter customer name!`);
            return;
        }

        if (!mobileValidation()) {
            return;
        }

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
            setnewAccCreated(newAccNo.toString());
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

            const message = `
            Name: ${name}
Account Number: ${newAccNo}
Opeing Balance: 0.00
Amount Collected: ₹${new Intl.NumberFormat('en-IN').format(amount)}
Total Account Balance: ₹${new Intl.NumberFormat('en-IN').format(amount)}
          `;

            Alert.alert(
                'Please Confirm Collection',
                message.trim(),
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Confirm', onPress: async () => {
                            if (isConnected) {
                                const agentmobileNumber = await AsyncStorage.getItem('mobileNumber');

                                if (agentmobileNumber) {
                                    const newArrayString = JSON.stringify(newArray);

                                    const url = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp?DataFromApp=${newArrayString.toString()}`;

                                    try {
                                        const response = await fetch(url, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                            },
                                            body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
                                        });

                                        // const responseData = await response.text();
                                        const responseText = await response.text();
                                        const parser = new XMLParser();
                                        const jsonResponse = parser.parse(responseText);
                                        const jsonString = jsonResponse.string;
                                        const responseObject = JSON.parse(jsonString);
                                        const rawResponseString = responseObject.ResponseString;
                                        const jsonStartIndex = rawResponseString.indexOf('{');
                                        const cleanedResponseString = rawResponseString.substring(jsonStartIndex);
                                        const dataObject = JSON.parse(cleanedResponseString);
                                        try {
                                            const collectionData = dataObject.CollectionData;
                                            if (collectionData && collectionData.length > 0) {
                                                const collDateTime = collectionData[0].CollDateTime;
                                                // console.log("CollDateTime:", collDateTime);
                                                setCollectionDate(collDateTime);
                                            } else {
                                                console.log("No collection data found.");
                                            }
                                        }
                                        catch (error) {
                                            if (dataObject.ResonseCode != '0000') {
                                                Alert.alert(
                                                    'Error:',
                                                    `Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`
                                                );
                                            }
                                            Alert.alert("Error parsing the response:", error.message);
                                        }
                                        transactionTable.push(transactionData);
                                        await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));
                                        setModalVisible2(true);
                                        fetchTransactionTable();
                                    } catch (error) {
                                        Alert.alert("Error during API call:", error.message);
                                    }
                                }
                            }
                            else {
                                const updatedTransactionData = {
                                    ...transactionData,
                                    pending: !isConnected
                                };
                                const currentTransactions = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
                                await AsyncStorage.setItem('transactionTable', JSON.stringify([...currentTransactions, updatedTransactionData]));
                                setModalVisible2(true);
                                fetchTransactionTable();
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
        }

    };

    const addNewUser = () => {
        setModalVisible(true);
    }

    const handleCancel2 = () => {
        setModalVisible2(false);
    };

    const handleWhatsAppPress = async () => {

        const formatDateTime = (date) => {
            const padZero = (num) => (num < 10 ? `0${num}` : num);
            const year = date.getFullYear();
            const month = padZero(date.getMonth() + 1);
            const day = padZero(date.getDate());
            const hours = padZero(date.getHours());
            const minutes = padZero(date.getMinutes());
            const seconds = padZero(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
        const clId = ClientID;
        const Brid = BrCode;
        const Agid = AgCode;
        const glcod = '0';
        const acno = newAccCreated;
        const ColldateTime = formatDateTime(new Date());
        const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
        const ruid = Buffer.from(ruidString).toString('base64');
        const encodedDateTime = collectionDate.replace(' ', '%20');
        const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;

        const getNumber = mobileNumber;
        const phoneNumber = `+91${getNumber}`;
        const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;

        const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;

        Linking.openURL(url);
    };

    const handleSmsPress = async () => {
        const formatDateTime = (date) => {
            const padZero = (num) => (num < 10 ? `0${num}` : num);
            const year = date.getFullYear();
            const month = padZero(date.getMonth() + 1);
            const day = padZero(date.getDate());
            const hours = padZero(date.getHours());
            const minutes = padZero(date.getMinutes());
            const seconds = padZero(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const clId = ClientID;
        const Brid = BrCode;
        const Agid = AgCode;
        const glcod = '0';
        const acno = newAccCreated;
        const ColldateTime = formatDateTime(new Date());
        const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
        const ruid = Buffer.from(ruidString).toString('base64');
        const encodedDateTime = collectionDate.replace(' ', '%20');
        //   console.log("data for sms messages ",  `${clId},${Brid},${Agid},${glcod},${acno}`)
        const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;

        const getNumber = mobileNumber;
        const phoneNumber = `+91${getNumber}`; // Replace with the actual phone number (with country code)
        const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;

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
        setName(null);
        setmobileNumber(null);
        setAmount(null);
    }

    return (
        <View style={styles.dashView}>
            <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

            <>
                {(dataAvailable || collectionAllowed) &&
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
                        {(!dataAvailable) && (
                            <View style={{
                                position: 'absolute',
                                width: '80%',
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                alignSelf: 'center',
                                borderRadius: 10,
                            }} />
                        )}
                    </View>
                }
                {searchedResults ? (
                    <>
                        <SearchPopup maxAmountLimit={maxAmountLimit} BranchName={BranchName} BranchCode={BranchCode} collectionAllowed={collectionAllowed} multipleCollection={multipleCollection} mappedMasterData={mappedMasterData} setSearchedResults={setSearchedResults} searchQuery={searchQuery} />
                    </>
                ) : (
                    <View style={{ height: windowHeight * 0.85 }}>
                        <View
                            style={{
                                width: windowWidth * 0.90,
                                alignSelf: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                height: 'auto',
                                overflow: 'hidden',
                                backgroundColor: '#eef2fa',
                                borderRadius: 10,
                                elevation: 2,
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={[styles.text, { fontSize: 14, fontFamily: 'Montserrat-Bold', marginLeft: 0 }]}>
                                    {ClientName ? ClientName : '-'}
                                </Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.text}>Branch</Text>
                                <Text style={[styles.text, { fontSize: 14, fontFamily: 'Montserrat-Bold' }]}>
                                    {BranchName ? BranchName : "-"} {BranchCode ? `(${BranchCode})` : ''}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 15, width: windowWidth * 1, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <View style={[styles.dataInfoView, { width: windowWidth * 0.90, alignSelf: 'center', flexDirection: 'row', height: 'auto', overflow: 'hidden' }]}>
                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text, { marginLeft: 0 }]}>Total collected receipts </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{transactionTable ? transactionTable.length : '-'} </Text>
                                </View>
                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text]}>Allowed days</Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{noOfDaysAllowed ? noOfDaysAllowed : '0'} </Text>
                                </View>
                            </View>
                            <View style={[styles.dataInfoView, { marginTop: 15, width: windowWidth * 0.90, alignSelf: 'center', flexDirection: 'row', height: 'auto', overflow: 'hidden' }]}>

                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text]}>Total collected amount </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{totalAmount ? `₹${new Intl.NumberFormat('en-IN').format(totalAmount)}` : '0'}</Text>
                                </View>
                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text]}>Amount limit</Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{maxAmountLimit ? `₹${new Intl.NumberFormat('en-IN').format(maxAmountLimit)}` : '0'}</Text>
                                </View>

                            </View>

                            <View style={[styles.dataInfoView, { marginTop: 15, width: windowWidth * 0.90, alignSelf: 'center', flexDirection: 'row', height: 'auto', overflow: 'hidden' }]}>
                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text]}>Not Sent to server</Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{pendingCount ? pendingCount : '0'} </Text>
                                </View>
                            </View>
                        </View>

                        {!collectionAllowed &&
                            <View>
                                <Text style={{ color: '#CC5500', fontSize: 16, alignSelf: 'center', marginTop: 10, marginBottom: 10, fontFamily: 'Montserrat-Bold' }}>The allowed days for collection have expired.</Text>
                            </View>
                        }

                        <View style={{ width: '95%', alignSelf: 'center', display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>

                            {loading ? (
                                <ActivityIndicator size={30} color={COLORS.primary} style={{ margin: 'auto', marginTop: '8%' }} />
                            ) : (
                                <Button
                                    icon={'play'}
                                    // loading={loading}
                                    disabled={loading || dataAvailable || !IsActive}
                                    onPress={handleGetData}
                                    labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }}
                                    style={{ marginTop: '8%', minWidth: windowWidth * 0.45 }}
                                    mode="contained"
                                >
                                    Get Data
                                </Button>
                            )}
                            {buttonLoading ? (
                                <ActivityIndicator size={30} color={COLORS.primary} style={{ margin: 'auto', marginTop: '8%' }} />
                            ) : (
                                <Button icon={'arrow-up'} loading={buttonLoading} disabled={buttonLoading || !dataAvailable || isFirstLogin} onPress={handleCloseCollection} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: '8%', minWidth: windowWidth * 0.45 }} mode="contained">Close collection</Button>
                            )}
                        </View>

                        {!LicenseExpired ? (
                            <>
                                <View style={styles.lineView}>
                                    <Text style={styles.lineText}>Recent transactions </Text>
                                </View>

                                <ScrollView style={{ marginTop: 20, marginBottom: windowHeight * 0.002 }}>
                                    <>
                                        {transactionTable && transactionTable?.length > 0 ? (
                                            transactionTable
                                                ?.sort((a, b) => {
                                                    const dateA = new Date(a.CollDateTime);
                                                    const dateB = new Date(b.CollDateTime);
                                                    return dateB - dateA;
                                                })
                                                ?.map((item, index) => (
                                                    <TransactionCard InputFileType={InputFileType} searchQuery={searchQuery} item={item} key={index} index={index} />
                                                ))
                                        ) : (
                                            <Text style={[styles.text1, { margin: 'auto', marginTop: 100 }]}>No transactions yet</Text>
                                        )}
                                    </>
                                </ScrollView>
                            </>
                        ) : (
                            <View style={styles.notFound}>
                                <Text style={styles.text1}>Your license has expired. Please pay subscription!</Text>
                            </View>
                        )}

                    </View>
                )}
            </>

            {/* <Modal
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
                        <Text style={styles.text}>New account collection </Text>
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
                            width: '100%',
                            // height: 120,
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginTop: 20,
                            paddingTop: 10,
                            paddingBottom: 10,
                            display: 'flex',
                            flexDirection: 'row',
                            backgroundColor: '#eef2fa',
                            elevation: 1
                        }}>
                            <View style={styles.left}>
                                <Text style={[styles.text1, { fontSize: 16, color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Name : </Text>
                                <Text style={[styles.text1, { fontSize: 16, fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{name}</Text>
                                <Text style={[styles.text1, { fontSize: 16, color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number : </Text>
                                <Text style={[styles.text1, { fontSize: 16, fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>0{newAccCreated}</Text>
                                <Text style={[styles.text1, { fontSize: 16, color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Opeing Balance : </Text>
                                <Text style={[styles.text1, { fontSize: 16, fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>0.00</Text>
                                <Text style={[styles.text1, { fontSize: 16, color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Amount Collected : </Text>
                                <Text style={[styles.text1, { fontSize: 16, fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{new Intl.NumberFormat('en-IN').format(amount)}</Text>
                                <Text style={[styles.text1, { fontSize: 16, color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Closing Balance : </Text>
                                <Text style={[styles.text1, { fontSize: 16, fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{new Intl.NumberFormat('en-IN').format(amount)}</Text>
                            </View>
                        </View>

                        <View style={[styles.buttonContainer, { marginTop: 30 }]}>

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

                            <MaterialCommunityIcons
                                onPress={handleWhatsAppPress}
                                style={styles.whatsappIcon}
                                name='whatsapp'
                                color={COLORS.white}
                                size={35}
                            />
                            <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>
                            <MaterialCommunityIcons
                                onPress={handleSmsPress}
                                style={styles.smsIcon}
                                name='android-messages'
                                color={COLORS.white}
                                size={35}
                            />
                            <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>

                            <Button
                                style={{ marginHorizontal: 0, marginVertical: 10, borderColor: COLORS.primaryAccent }}
                                mode="contained"
                                labelStyle={styles.buttonLabel}
                                onPress={handleSubmit2}
                            >
                                No Receipt
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal> */}
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
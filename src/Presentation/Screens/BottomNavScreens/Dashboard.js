import { View, Text, StyleSheet, ToastAndroid, ScrollView, StatusBar, Modal, Pressable, BackHandler, Keyboard, TouchableOpacity, ActivityIndicator, FlatList, Alert, Linking, Platform, PermissionsAndroid } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import { Button, Searchbar, TextInput } from 'react-native-paper'
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { XMLParser } from 'fast-xml-parser';
import SearchPopup from '../../Components/SearchPopup';
import TransactionCard from '../../Components/TransactionCard';
import NetInfo from '@react-native-community/netinfo';

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
    const [syncLoading, setSyncLoading] = useState(false);

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
            const savedData = await AsyncStorage.getItem('dataObject');
            // console.log("old local data chaeck", savedData)
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
                console.log("try block executed")
                if (mobileNumber) {
                    const url = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/RequestData_App?MobileNo=${mobileNumber}`;

                    const response = await fetchWithTimeout(
                        url,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/xml',
                            },
                        },
                        15000 // ⏳ timeout in ms
                    );

                    const responseText = await response.text();
                    const parser = new XMLParser();
                    const jsonResponse = parser.parse(responseText);
                    const jsonString = jsonResponse.string;
                    const dataObject = JSON.parse(jsonString);
                    // console.log("tdataObject.ResonseCode", dataObject, dataObject.MstrData?.FileCreateDate)

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

                        if (len1 != len2) {
                            console.log("length checking 3", len1, len2)
                            setIsDataValid(false);
                            Alert.alert('Error', 'Something went wrong while recieving data or data may be currupted please try again! or contact the main branch.')
                            return;
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
                        setGLCode(dataObject.MstrData?.GLCode);
                        setMaxAmountLimit(dataObject.MstrData?.AmountLimit);
                        setMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false);
                        setSearchedResults(true);
                        await AsyncStorage.setItem('firstLoginComplete', 'true');
                        setIsFirstLogin(false);
                    }
                    else {
                        Alert.alert(
                            'Error:',
                            `Response Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`
                        );
                        console.log("error block", dataObject.ResonseCode, dataObject.ResponseString)
                        setDataAvailable(false);
                        setIsAuth(false);
                    }
                } else {
                    setDataAvailable(false);
                    await AsyncStorage.removeItem('firstLoginComplete');
                }
            } catch (error) {
                setDataAvailable(false);
                Alert.alert('Error:', `Error: ${error.message}`);
                console.log('Error occurred:', error.message)
                await AsyncStorage.removeItem('firstLoginComplete');
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
                }
            } catch (error) {
                setDataAvailable(false);
                Alert.alert('Error occurred:', error.message);
                console.log('Error occurred:', error)
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
        let unsubscribe;
        let currentState;

        unsubscribe = NetInfo.addEventListener(state => {

            const isOnline = state.isInternetReachable != null ? state.isInternetReachable : false;

            if (currentState !== isOnline) {
                currentState = isOnline;
                console.log("Online status?", currentState);
                setConnected(currentState);
                if (currentState === true) {
                    sendDataInBackground();
                }
            }
        });

        return () => {
            console.log("unsubscribe");
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const sendDataInBackground = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionTable');
            const parsedData = JSON.parse(transactionTableData) || [];
            const pendingTransactions = parsedData.filter(item => item.pending === true);

            if (!isConnected || pendingTransactions.length === 0) return;

            const savedData = await AsyncStorage.getItem('dataObject');
            const dataObject = JSON.parse(savedData);

            const payload = {
                ClientID: dataObject?.MstrData?.ClientID,
                BrCode: dataObject?.MstrData?.BrCode,
                AgCode: dataObject?.MstrData?.AgCode,
                BrAgCode: dataObject?.MstrData?.BrAgCode,
                FileCreateDate: dataObject?.MstrData?.FileCreateDate,
                InputFileType: dataObject?.MstrData?.InputFileType,
                NoOfRecords: pendingTransactions.length.toString(),
                CollectionData: pendingTransactions.map(({ pending, ...rest }) => rest),
            };

            console.log("Sending pending data:", payload);

            // const response = await fetch(
            //     'https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp',
            //     {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            //         body: new URLSearchParams({ DataFromApp: JSON.stringify(payload) }).toString(),
            //     }
            // );

            const response = await fetchWithTimeout(
                'https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ DataFromApp: JSON.stringify(payload) }).toString(),
                },
                15000
            );

            const responseText = await response.text();
            const parser = new XMLParser();
            const parsedXML = parser.parse(responseText);
            const resultJson = JSON.parse(parsedXML.string);
            const responseCode = resultJson?.ResonseCode;

            if (responseCode === '0000') {
                const updatedTransactionTable = parsedData.map(item => {
                    if (item.pending) {
                        const { pending, ...rest } = item;
                        return rest;
                    }
                    return item;
                });

                await AsyncStorage.setItem('transactionTable', JSON.stringify(updatedTransactionTable));
                fetchTransactionTable();
                console.log("Pending transactions uploaded and cleared.");
            } else {
                Alert.alert(
                    'Upload Failed',
                    `Response Code: ${responseCode}, Message: ${resultJson?.ResponseString || 'Unknown error'}`
                );
            }
        } catch (error) {
            console.log("Background upload error:", error);
            Alert.alert("Upload Error", `Something went wrong: ${error.message}`);
        }
    };

    const fetchWithTimeout = (url, options, timeout = 15000) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), timeout)
            ),
        ]);
    };

    const handleSyncData = async () => {
        setSyncLoading(true);
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionTable');
            const parsedData = JSON.parse(transactionTableData) || [];
            const savedData = await AsyncStorage.getItem('dataObject');
            const dataObject = JSON.parse(savedData);
            const cleanData = parsedData.map(({ pending, ...rest }) => rest);

            const chunkArray = (arr, size) => {
                const result = [];
                for (let i = 0; i < arr.length; i += size) {
                    result.push(arr.slice(i, i + size));
                }
                return result;
            };

            const chunkSize = 5;
            const chunks = chunkArray(cleanData, chunkSize);

            for (let i = 0; i < chunks.length; i++) {
                const batch = chunks[i];
                const payload = {
                    ClientID: dataObject?.MstrData?.ClientID,
                    BrCode: dataObject?.MstrData?.BrCode,
                    AgCode: dataObject?.MstrData?.AgCode,
                    BrAgCode: dataObject?.MstrData?.BrAgCode,
                    FileCreateDate: dataObject?.MstrData?.FileCreateDate,
                    InputFileType: dataObject?.MstrData?.InputFileType,
                    NoOfRecords: batch.length.toString(),
                    CollectionData: batch,
                };

                console.log(`Syncing batch ${i + 1} of ${chunks.length}:`, payload);

                const response = await fetchWithTimeout(
                    'https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ DataFromApp: JSON.stringify(payload) }).toString(),
                    },
                    15000 // 15 sec timeout
                );

                const responseText = await response.text();
                const parser = new XMLParser();
                const parsedXML = parser.parse(responseText);
                const resultJson = JSON.parse(parsedXML.string);
                const responseCode = resultJson?.ResonseCode;

                console.log("Response from batch sync:", resultJson);

                if (responseCode !== '0000') {
                    Alert.alert(
                        'Sync Failed',
                        `Code: ${responseCode}, Message: ${resultJson?.ResponseString || 'Unknown error'}`
                    );
                    setSyncLoading(false);
                    return;
                }
            }

            setSyncLoading(false);
            Alert.alert('Success', 'All data synced successfully.');
            const updatedTransactionTable = parsedData.map(item => {
                if (item.pending) {
                    const { pending, ...rest } = item;
                    return rest;
                }
                return item;
            });

            await AsyncStorage.setItem('transactionTable', JSON.stringify(updatedTransactionTable));
            fetchTransactionTable();
            console.log("All transactions synced successfully (pending flag removed).");
        } catch (error) {
            setSyncLoading(false);
            console.log("Sync error:", error);
            Alert.alert("Error", `Error: ${error.message}`);
        }
    };

    const fetchTransactionTable = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionTable');
            if (transactionTableData) {
                const parsedData = JSON.parse(transactionTableData);
                // console.log("transactions latest checking now", parsedData)

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

        // if (!isConnected) {
        //     Alert.alert('Cannot Close collection!', `You are offline, please connect to the Internet and try again.`);
        //     setButtonLoading(false);
        //     return;
        // }

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
                            // let tempCount = 8;
                            let tempCount = parseInt(transactionTable.length);
                            try {

                                const closeCollectionResponse = await fetchWithTimeout(closeCollectionUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: new URLSearchParams({
                                        MobileNo: mobileNumber,
                                        Fdate: FileCreateDate,
                                        NoofRecs: tempCount,
                                    }).toString(),
                                }, 15000);

                                const closeCollectionText = await closeCollectionResponse.text();
                                const parser = new XMLParser();
                                const closeCollectionJson = parser.parse(closeCollectionText);
                                const closeCollectionData = JSON.parse(closeCollectionJson.string);
                                const closeCollectionResponseCode = closeCollectionData.ResonseCode;

                                if (closeCollectionResponseCode === '0000') {
                                    const dummyCloseCycleResponse = await fetchWithTimeout(dummyCloseCycleUrl, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: new URLSearchParams({
                                            MobileNo: mobileNumber,
                                            Fdate: FileCreateDate,
                                            NoofRecs: tempCount,
                                        }).toString(),
                                    }, 15000);

                                    const dummyCloseCycleText = await dummyCloseCycleResponse.text();
                                    const dummyCloseCycleJson = parser.parse(dummyCloseCycleText);
                                    const dummyCloseCycleData = JSON.parse(dummyCloseCycleJson.string);
                                    const dummyCloseCycleResponseCode = dummyCloseCycleData.ResonseCode;

                                    if (dummyCloseCycleResponseCode === '0000') {
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

                                        const remainingData = await AsyncStorage.getItem('transactionTable');
                                        if (remainingData) {
                                            await AsyncStorage.removeItem('transactionTable');
                                            setTransactionTable([]);
                                        }
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
                                        throw new Error(
                                            `DummyCloseCycle Error: Code ${dummyCloseCycleResponseCode}, ${dummyCloseCycleData.ResponseString}`
                                        );
                                    }
                                }
                                else {
                                    Alert.alert('Error', ` Response Code - ${closeCollectionResponseCode} - ${closeCollectionData?.ResponseString} `)
                                }
                            } catch (error) {
                                Alert.alert('Error', `Error: ${error.message}`);
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
                                <View style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text, { marginLeft: 0 }]}>Total receipt</Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{transactionTable ? transactionTable.length : '-'} </Text>
                                </View>
                                <View style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[styles.text]}>Pending</Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{pendingCount ? pendingCount : '0'} </Text>
                                    {/* <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{noOfDaysAllowed ? noOfDaysAllowed : '0'} </Text> */}
                                </View>
                                <View style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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

                            <View style={{ width: '100%', marginTop: 15, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <View style={{ width: '50%', alignSelf: 'flex-start' }}>
                                    <View style={{ width: '90%', backgroundColor: '#eef2fa', elevation: 2, alignSelf: 'flex-end', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={[styles.text]}>File Created Date</Text>
                                        <Text style={[styles.text, { fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>{fileCreatedDate ? fileCreatedDate : '-'} </Text>
                                    </View>
                                </View>
                                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Button
                                        icon={'cloud-sync-outline'}
                                        loading={syncLoading}
                                        disabled={syncLoading || buttonLoading || loading || isFirstLogin || !IsActive || transactionTable?.length === 0}
                                        onPress={handleSyncData}
                                        labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }}
                                        style={{ width: windowWidth * 0.40 }}
                                        mode="contained"
                                    >
                                        Sync
                                    </Button>
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
                                    disabled={loading || dataAvailable || !IsActive || syncLoading}
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
                                <Button icon={'arrow-up'} loading={buttonLoading} disabled={syncLoading || buttonLoading || !dataAvailable || isFirstLogin} onPress={handleCloseCollection} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: '8%', minWidth: windowWidth * 0.45 }} mode="contained">Close collection</Button>
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
        marginLeft: 10,
        fontSize: 14
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
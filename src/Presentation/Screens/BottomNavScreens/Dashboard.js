import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  BackHandler,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants';
import { Button, Searchbar } from 'react-native-paper';
import UserIcon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { XMLParser } from 'fast-xml-parser';
import SearchPopup from '../../Components/SearchPopup';
import TransactionCard from '../../Components/TransactionCard';
import NetInfo from '@react-native-community/netinfo';

export default function DashboardScreen({ navigation, route }) {
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const isFocused = useIsFocused();

  const [masterRecords, setMasterRecords] = useState([]);
  const [headerLastAccountNo, setHeaderLastAccountNo] = useState(null);
  const [recordCount, setRecordCount] = useState(null);
  const [isDataConsistent, setIsDataConsistent] = useState(true);

  const [licenseValidUpto, setLicenseValidUpto] = useState(null);
  const [licenseExpired, setLicenseExpired] = useState(false);

  const [clientName, setClientName] = useState(null);
  const [branchName, setBranchName] = useState(null);
  const [branchCode, setBranchCode] = useState(null);
  const [agentName, setAgentName] = useState(null);

  const [isActiveAccount, setIsActiveAccount] = useState(true);
  const [allowNewAccount, setAllowNewAccount] = useState(true);

  const [fileCreateDate, setFileCreateDate] = useState(null);
  const [allowedDays, setAllowedDays] = useState(null);
  const [inputFileType, setInputFileType] = useState(null);

  const [clientId, setClientId] = useState(null);
  const [branchCodeFromData, setBranchCodeFromData] = useState(null);
  const [agentCode, setAgentCode] = useState(null);
  const [branchAgentCode, setBranchAgentCode] = useState(null);

  const [glLastAccount, setGlLastAccount] = useState(null);
  const [glCode, setGlCode] = useState(null);

  const [pendingCount, setPendingCount] = useState(0);
  const [allowCollection, setAllowCollection] = useState(true);
  const [allowMultipleCollection, setAllowMultipleCollection] = useState(false);

  const [totalCollectedAmount, setTotalCollectedAmount] = useState(0);
  const [transactionTable, setTransactionTable] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [closeButtonLoading, setCloseButtonLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [amountLimit, setAmountLimit] = useState(null);

  useEffect(() => {
    if (route.params?.search === true) {
      setIsSearchActive(true);
    }
    setSearchText('');
  }, [isFocused, route?.params]);

  useEffect(() => {
    if (!fileCreateDate || !allowedDays) return;
    const start = new Date(fileCreateDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(allowedDays));
    const now = new Date();
    if (now >= start && now < end) {
      setAllowCollection(true);
    } else {
      setAllowCollection(false);
    }
  }, [fileCreateDate, allowedDays]);

  useEffect(() => {
    const backAction = () => {
      if (backPressedOnce && !isSearchActive) {
        BackHandler.exitApp();
      } else {
        setBackPressedOnce(true);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setTimeout(() => {
          setBackPressedOnce(false);
        }, 2000);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [backPressedOnce, isSearchActive]);

  useEffect(() => {
    const checkSavedLogin = async () => {
      const firstLoginComplete = await AsyncStorage.getItem('firstLoginComplete');
      if (firstLoginComplete === 'true') {
        loadServerData();
      } else {
        setIsFirstLogin(true);
      }
    };
    checkSavedLogin();
  }, []);

  const handleGetData = async () => {
    loadServerData();
  };

  const loadServerData = async () => {
    setLoading(true);
    const firstLoginComplete = await AsyncStorage.getItem('firstLoginComplete');

    if (firstLoginComplete !== 'true') {
      try {
        const mobileNo = await AsyncStorage.getItem('mobileNumber');
        if (!mobileNo) {
          setHasData(false);
          await AsyncStorage.removeItem('firstLoginComplete');
          setLoading(false);
          return;
        }

        const url = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/RequestData_App?MobileNo=${mobileNo}`;

        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/xml' },
          },
          15000
        );

        const responseText = await response.text();
        const parser = new XMLParser();
        const parsed = parser.parse(responseText);
        const jsonString = parsed.string;
        const dataObject = JSON.parse(jsonString);

        if (dataObject.ResonseCode === '0000') {
          try {
            await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
          } catch (err) {
            console.warn('Storage Error', 'Failed to store transaction locally.');
            Alert.alert('Error', 'Failed to save data. Please try again.');
            setLoading(false);
            return;
          }

          const expiry = dataObject.MstrData?.LicenseValidUpto;
          setLicenseValidUpto(expiry);
          const now = new Date();
          const expiryDate = new Date(expiry);
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

          if (daysLeft < 0) {
            Alert.alert('License expired!', 'Your license has expired. Please pay subscription.');
          }

          if (daysLeft <= 15 && daysLeft >= 0) {
            Alert.alert('License Reminder', `Your license is about to expire in ${daysLeft} day(s). Please renew it soon.`);
          }

          const lenRecords = parseInt(dataObject.MstrData?.MstrRecs?.length);
          const declaredCount = parseInt(dataObject.MstrData?.NoOfRecords);

          if (lenRecords !== declaredCount) {
            // setIsDataConsistent(false);
            Alert.alert('Error', 'Something went wrong while receiving data or data may be corrupted. Please try again or contact main branch.');
            setLoading(false);
            return;
          }

          setLicenseExpired(false);
          setMasterRecords(dataObject.MstrData?.MstrRecs);
          setHeaderLastAccountNo(dataObject.MstrData?.HdrLastAcNo);
          setHasData(true);
          setRecordCount(dataObject.MstrData?.NoOfRecords);
          await AsyncStorage.setItem('LicenseValidUpto', (dataObject.MstrData?.LicenseValidUpto).toString());
          setClientName(dataObject.MstrData?.ClientName);
          setBranchName(dataObject.MstrData?.BrNameE);
          setBranchCode(dataObject.MstrData?.BrCode);
          setAgentName(dataObject.MstrData?.AgNameE);
          // setIsActiveAccount(false);
          setIsActiveAccount(dataObject.MstrData?.IsActive ? true : false);
          setAllowNewAccount((dataObject.MstrData?.NewAcOpenAllowed === 'True') ? true : false);
          setFileCreateDate(dataObject.MstrData?.FileCreateDate);
          setAllowedDays(dataObject.MstrData?.NoOfDaysAllowed);
          setClientId(dataObject.MstrData?.ClientID);
          setAgentCode(dataObject.MstrData?.AgCode);
          setBranchCodeFromData(dataObject.MstrData?.BrCode);
          setBranchAgentCode(dataObject.MstrData?.BrAgCode);
          setInputFileType(dataObject.MstrData?.InputFileType);
          setGlLastAccount(dataObject.MstrData?.GLLastAc);
          setGlCode(dataObject.MstrData?.GLCode);
          setAmountLimit(dataObject.MstrData?.AmountLimit);
          setAllowMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false);
          setIsSearchActive(true);
          await AsyncStorage.setItem('firstLoginComplete', 'true');
          setIsFirstLogin(false);
        } else {
          Alert.alert('Error:', `Response Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`);
          setHasData(false);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setHasData(false);
        Alert.alert('Error:', `Error: ${error.message}`);
        await AsyncStorage.removeItem('firstLoginComplete');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const savedData = await AsyncStorage.getItem('dataObject');
        if (!savedData) {
          setHasData(false);
          await AsyncStorage.removeItem('firstLoginComplete');
          if (!isConnected) {
            Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
          }
          setLoading(false);
          return;
        }

        const dataObject = JSON.parse(savedData);
        if (dataObject.ResonseCode === '0000') {
          try {
            await AsyncStorage.setItem('dataObject', JSON.stringify(dataObject));
          } catch (err) {
            console.warn('Storage Error', 'Failed to store transaction locally.');
            Alert.alert('Error', 'Failed to save data. Please try again.');
            setLoading(false);
            return;
          }
          const expiry = dataObject.MstrData?.LicenseValidUpto;
          setLicenseValidUpto(expiry);
          const now = new Date();
          const expiryDate = new Date(expiry);
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

          if (daysLeft < 0) {
            Alert.alert('License expired!', 'Your license has expired. Please pay subscription.');
          }

          if (daysLeft <= 15 && daysLeft >= 0) {
            Alert.alert('License Reminder', `Your license is about to expire in ${daysLeft} day(s). Please renew it soon.`);
          }

          setLicenseExpired(false);
          setMasterRecords(dataObject.MstrData?.MstrRecs);
          setHeaderLastAccountNo(dataObject.MstrData?.HdrLastAcNo);
          setHasData(true);
          setRecordCount(dataObject.MstrData?.NoOfRecords);
          await AsyncStorage.setItem('LicenseValidUpto', (dataObject.MstrData?.LicenseValidUpto).toString());
          setClientName(dataObject.MstrData?.ClientName);
          setBranchName(dataObject.MstrData?.BrNameE);
          setBranchCode(dataObject.MstrData?.BrCode);
          setAgentName(dataObject.MstrData?.AgNameE);
          // setIsActiveAccount(false);
          setIsActiveAccount(dataObject.MstrData?.IsActive ? true : false);
          setAllowNewAccount((dataObject.MstrData?.NewAcOpenAllowed === 'True') ? true : false);
          setFileCreateDate(dataObject.MstrData?.FileCreateDate);
          setAllowedDays(dataObject.MstrData?.NoOfDaysAllowed);
          setClientId(dataObject.MstrData?.ClientID);
          setAgentCode(dataObject.MstrData?.AgCode);
          setBranchCodeFromData(dataObject.MstrData?.BrCode);
          setBranchAgentCode(dataObject.MstrData?.BrAgCode);
          setInputFileType(dataObject.MstrData?.InputFileType);
          setGlLastAccount(dataObject.MstrData?.GLLastAc);
          setGlCode(dataObject.MstrData?.GLCode);
          setAmountLimit(dataObject.MstrData?.AmountLimit);
          setAllowMultipleCollection((dataObject.MstrData?.AllowMultipleColln === 'True') ? true : false);
          setIsSearchActive(true);
        } else {
          if (dataObject.ResonseCode !== '0000') {
            Alert.alert('Error:', `Code : ${dataObject.ResonseCode}, ${dataObject.ResponseString}`);
          }
          setHasData(false);
          setIsAuthenticated(false);
          if (!isConnected) {
            Alert.alert('Failed getting data!', 'Please check your internet connection and try again.');
          }
        }
      } catch (error) {
        setHasData(false);
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
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isInternetReachable != null ? state.isInternetReachable : false;
      setIsConnected(online);
      if (online) sendPendingTransactions();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const sendPendingTransactions = async () => {
    try {
      const raw = await AsyncStorage.getItem('transactionTable');
      const parsed = JSON.parse(raw) || [];
      const pending = parsed.filter((t) => t.pending === true);
      if (!isConnected || pending.length === 0) return;

      const savedData = await AsyncStorage.getItem('dataObject');
      const dataObject = JSON.parse(savedData);

      const payload = {
        ClientID: dataObject?.MstrData?.ClientID,
        BrCode: dataObject?.MstrData?.BrCode,
        AgCode: dataObject?.MstrData?.AgCode,
        BrAgCode: dataObject?.MstrData?.BrAgCode,
        FileCreateDate: dataObject?.MstrData?.FileCreateDate,
        InputFileType: dataObject?.MstrData?.InputFileType,
        NoOfRecords: pending.length.toString(),
        CollectionData: pending.map(({ pending, ...rest }) => rest),
      };

      const response = await fetchWithTimeout(
        'https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ DataFromApp: JSON.stringify(payload) }).toString(),
        },
        15000
      );

      const text = await response.text();
      const parser = new XMLParser();
      const parsedXML = parser.parse(text);
      const result = JSON.parse(parsedXML.string);
      const code = result?.ResonseCode;

      if (code === '0000') {
        const updated = parsed.map((item) => (item.pending ? (() => {
          const { pending, ...rest } = item;
          return rest;
        })() : item));

        try {
          await AsyncStorage.setItem('transactionTable', JSON.stringify(updated));
        } catch (err) {
          console.warn('Storage Error', 'Failed to store transaction locally.');
          Alert.alert('Error', 'Failed to save data. Please try again.');
          return;
        }
        await refreshTransactionTable();
      } else {
        Alert.alert('Upload Failed', `Response Code: ${code}, Message: ${result?.ResponseString || 'Unknown error'}`);
      }
    } catch (error) {
      Alert.alert('Upload Error', `Something went wrong: ${error.message}`);
    }
  };

  const fetchWithTimeout = (url, options, timeout = 15000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout)),
    ]);
  };

  const handleSyncData = async () => {
    setSyncLoading(true);
    try {
      const raw = await AsyncStorage.getItem('transactionTable');
      const parsed = JSON.parse(raw) || [];
      const savedData = await AsyncStorage.getItem('dataObject');
      const dataObject = JSON.parse(savedData);

      const cleaned = parsed.map(({ pending, ...rest }) => rest);
      const chunkArray = (arr, size) => {
        const res = [];
        for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
        return res;
      };

      const chunks = chunkArray(cleaned, 5);

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

        const response = await fetchWithTimeout(
          'https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ DataFromApp: JSON.stringify(payload) }).toString(),
          },
          15000
        );

        const text = await response.text();
        const parser = new XMLParser();
        const parsedXML = parser.parse(text);
        const result = JSON.parse(parsedXML.string);
        const code = result?.ResonseCode;

        if (code !== '0000') {
          Alert.alert('Sync Failed', `Code: ${code}, Message: ${result?.ResponseString || 'Unknown error'}`);
          setSyncLoading(false);
          return;
        }
      }

      setSyncLoading(false);
      ToastAndroid.show('All data synced successfully.', ToastAndroid.SHORT)
      const updatedTransactionTable = parsed.map((item) => (item.pending ? (() => {
        const { pending, ...rest } = item;
        return rest;
      })() : item));
      try {
        await AsyncStorage.setItem('transactionTable', JSON.stringify(updatedTransactionTable));
      } catch (err) {
        console.warn('Storage Error', 'Failed to store transaction locally.');
        Alert.alert('Error', 'Failed to save data. Please try again.');
        setSyncLoading(false);
        return;
      }
      await refreshTransactionTable();
    } catch (error) {
      setSyncLoading(false);
      Alert.alert('Error', `Error: ${error.message}`);
    }
  };

  const refreshTransactionTable = async () => {
    try {
      const raw = await AsyncStorage.getItem('transactionTable');
      if (!raw) {
        setTransactionTable([]);
        setPendingCount(0);
        setTotalCollectedAmount(0);
        return;
      }
      const parsed = JSON.parse(raw);
      setTransactionTable(parsed);
      const pending = parsed.filter((p) => p.pending === true);
      setPendingCount(pending.length);
      const total = parsed.reduce((sum, t) => sum + (parseFloat(t.Collection) || 0), 0);
      setTotalCollectedAmount(total);
    } catch (error) {
      Alert.alert('Error fetching transaction table from Local storage:', error.message);
    }
  };

  useEffect(() => {
    refreshTransactionTable();
  }, [isFocused]);

  const handleCloseCollection = async () => {
    setCloseButtonLoading(true);

    Alert.alert(
      'Close Collection',
      'Do you really want to close the collection?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setCloseButtonLoading(false) },
        {
          text: 'Yes',
          onPress: async () => {
            const mobileNo = await AsyncStorage.getItem('mobileNumber');
            if (!mobileNo) {
              setCloseButtonLoading(false);
              return;
            }

            const closeUrl = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/CloseCollection_FromApp`;
            const dummyUrl = `https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/Dummy_CloseCycle`;
            const tempCount = parseInt(transactionTable.length);

            try {
              const closeResponse = await fetchWithTimeout(
                closeUrl,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({
                    MobileNo: mobileNo,
                    Fdate: fileCreateDate,
                    NoofRecs: tempCount,
                  }).toString(),
                },
                15000
              );

              const closeText = await closeResponse.text();
              const parser = new XMLParser();
              const closeParsed = parser.parse(closeText);
              const closeData = JSON.parse(closeParsed.string);
              const closeCode = closeData.ResonseCode;

              if (closeCode === '0000') {
                const dummyResponse = await fetchWithTimeout(
                  dummyUrl,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                      MobileNo: mobileNo,
                      Fdate: fileCreateDate,
                      NoofRecs: tempCount,
                    }).toString(),
                  },
                  15000
                );

                const dummyText = await dummyResponse.text();
                const dummyParsed = parser.parse(dummyText);
                const dummyData = JSON.parse(dummyParsed.string);
                const dummyCode = dummyData.ResonseCode;

                if (dummyCode === '0000') {
                  Alert.alert('Success', 'Successfully closed Collections');
                  let history = await AsyncStorage.getItem('transactionHistoryTable');
                  history = history ? JSON.parse(history) : [];
                  let table = await AsyncStorage.getItem('transactionTable');
                  table = table ? JSON.parse(table) : [];
                  table.forEach((t) => history.push(t));
                  try {
                    await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(history));
                  } catch (err) {
                    console.warn('Storage Error', 'Failed to store transaction locally.');
                    Alert.alert('Error', 'Failed to save data. Please try again.');
                    setCloseButtonLoading(false);
                    return;
                  }
                  await AsyncStorage.removeItem('transactionTable');
                  setTransactionTable([]);
                  await refreshTransactionTable();
                  setHasData(false);
                  setAmountLimit(null);
                  setAllowedDays(null);
                  setTotalCollectedAmount(null);
                  setPendingCount(0);
                  await AsyncStorage.setItem('firstLoginComplete', 'false');
                } else {
                  throw new Error(`DummyCloseCycle Error: Code ${dummyCode}, ${dummyData.ResponseString}`);
                }
              } else {
                Alert.alert('Error', ` Response Code - ${closeCode} - ${closeData?.ResponseString} `);
                setCloseButtonLoading(false);
              }
            } catch (error) {
              Alert.alert('Error', `Error: ${error.message}`);
              setCloseButtonLoading(false);
            } finally {
              setCloseButtonLoading(false);
              await refreshTransactionTable();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.dashView}>
      <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

      <>
        {(hasData || allowCollection) && (
          <View style={styles.headerRow}>
            <Searchbar
              placeholder="Search by Name or A/C No"
              onChangeText={setSearchText}
              value={searchText}
              autoFocus={isSearchActive}
              onIconPress={() => {
                setIsSearchActive(false);
                setSearchText('');
                Keyboard.dismiss();
              }}
              icon={isSearchActive ? 'arrow-left-thin' : 'magnify'}
              iconColor={COLORS.primary}
              onPress={() => setIsSearchActive(true)}
              elevation={1}
              style={styles.searchbarStyle}
            />
            <Pressable onPress={() => navigation.navigate('Profile', { count: recordCount, amount: totalCollectedAmount, collectionAllowed: allowCollection })}>
              <UserIcon name="user-circle" style={{ elevation: 5 }} color={COLORS.primary} size={45} />
            </Pressable>
            {!hasData && <View style={styles.overlayBlocked} />}
          </View>
        )}

        {isSearchActive ? (
          <SearchPopup
            maxAmountLimit={amountLimit}
            BranchName={branchName}
            BranchCode={branchCode}
            collectionAllowed={allowCollection}
            multipleCollection={allowMultipleCollection}
            mappedMasterData={masterRecords}
            setSearchedResults={setIsSearchActive}
            searchQuery={searchText}
          />
        ) : (
          <View style={{ height: windowHeight * 0.85 }}>
            <View style={styles.infoHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.labelText, { fontSize: 14, fontFamily: 'Montserrat-Bold', marginLeft: 0 }]}>
                  {clientName ? clientName : '-'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.labelText}>Branch</Text>
                <Text style={[styles.labelText, { fontSize: 14, fontFamily: 'Montserrat-Bold' }]}>
                  {branchName ? branchName : '-'} {branchCode ? `(${branchCode})` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.summaryContainer}>
              <View style={[styles.dataInfoView, { width: windowWidth * 0.90 }]}>
                <View style={styles.dataBlock}>
                  <Text style={[styles.labelText, { marginLeft: 0 }]}>Total receipt</Text>
                  <Text style={[styles.labelText, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{transactionTable ? transactionTable.length : '-'}</Text>
                </View>
                <View style={styles.dataBlock}>
                  <Text style={styles.labelText}>Pending</Text>
                  <Text style={[styles.labelText, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{pendingCount ? pendingCount : '0'}</Text>
                </View>
                <View style={styles.dataBlock}>
                  <Text style={styles.labelText}>Allowed days</Text>
                  <Text style={[styles.labelText, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{allowedDays ? allowedDays : '0'}</Text>
                </View>
              </View>

              <View style={[styles.dataInfoView, { marginTop: 15, width: windowWidth * 0.90 }]}>
                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.labelText}>Total collected amount</Text>
                  <Text style={[styles.labelText, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{totalCollectedAmount ? `₹${new Intl.NumberFormat('en-IN').format(totalCollectedAmount)}` : '0'}</Text>
                </View>
                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.labelText}>Amount limit</Text>
                  <Text style={[styles.labelText, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{amountLimit ? `₹${new Intl.NumberFormat('en-IN').format(amountLimit)}` : '0'}</Text>
                </View>
              </View>

              <View style={styles.fileDateAndSync}>
                <View style={{ width: '50%', alignSelf: 'flex-start' }}>
                  <View style={styles.fileDateBox}>
                    <Text style={styles.labelText}>File created date</Text>
                    <Text style={[styles.labelText, { fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>{fileCreateDate ? fileCreateDate : '-'}</Text>
                  </View>
                </View>

                <View style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    icon="cloud-sync-outline"
                    loading={syncLoading}
                    disabled={syncLoading || closeButtonLoading || loading || isFirstLogin || !isActiveAccount || transactionTable?.length === 0}
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

            {!allowCollection && (
              <View>
                <Text style={{ color: '#c72a2a', fontSize: 16, alignSelf: 'center', marginTop: 10, marginBottom: 10, fontFamily: 'Montserrat-Bold' }}>
                  The allowed days for collection have expired.
                </Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              {loading ? (
                <ActivityIndicator size={30} color={COLORS.primary} style={{ marginTop: '8%' }} />
              ) : (
                <Button
                  icon="play"
                  disabled={loading || hasData || !isActiveAccount || syncLoading}
                  onPress={handleGetData}
                  labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }}
                  style={{ marginTop: '8%', minWidth: windowWidth * 0.45, justifyContent: 'center', alignItems: 'center' }}
                  mode="contained"
                >
                  Get data
                </Button>
              )}

              {closeButtonLoading ? (
                <ActivityIndicator size={30} color={COLORS.primary} style={{ marginTop: '8%' }} />
              ) : (
                <Button
                  icon="arrow-up"
                  loading={closeButtonLoading}
                  disabled={syncLoading || closeButtonLoading || !hasData || isFirstLogin}
                  onPress={handleCloseCollection}
                  labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }}
                  style={{ marginTop: '8%', minWidth: windowWidth * 0.45 }}
                  mode="contained"
                >
                  Close collection
                </Button>
              )}
            </View>

            {!licenseExpired ? (
              <>
                <View style={styles.lineView}>
                  <Text style={styles.lineText}>Recent transactions </Text>
                </View>

                <ScrollView style={{ marginTop: 20, marginBottom: windowHeight * 0.002 }}>
                  {transactionTable && transactionTable.length > 0 ? (
                    transactionTable
                      .sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime))
                      .map((item, index) => (
                        <TransactionCard InputFileType={inputFileType} searchQuery={searchText} item={item} key={index} index={index} />
                      ))
                  ) : (
                    <>
                      {(!isActiveAccount) ? (
                        <Text style={[styles.text1, { marginTop: 100, textAlign: 'center', fontSize: 15 }]}>Your account is not Active, Please contact administrator</Text>
                      ) : (
                        <Text style={[styles.text1, { marginTop: 100, textAlign: 'center' }]}>No transactions yet</Text>
                      )}
                    </>
                  )}
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
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dashView: { width: windowWidth, height: windowHeight, backgroundColor: '#FFFFFF' },
  text1: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: COLORS.gray },
  notFound: { width: windowWidth * 0.8, height: windowHeight * 0.8, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  headerRow: { width: windowWidth, height: windowHeight * 0.1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  searchbarStyle: { width: '80%', alignSelf: 'center', backgroundColor: '#FFFFFF', elevation: 15 },
  overlayBlocked: { position: 'absolute', width: '80%', height: '100%', backgroundColor: 'rgba(255,255,255,0.6)', alignSelf: 'center', borderRadius: 10 },
  infoHeader: { width: windowWidth * 0.9, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef2fa', borderRadius: 10, elevation: 2, padding: 8 },
  summaryContainer: { marginTop: 15, width: windowWidth, alignItems: 'center', justifyContent: 'space-evenly' },
  dataInfoView: { width: '45%', height: 80, borderRadius: 10, justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#eef2fa', elevation: 2, flexDirection: 'row' },
  dataBlock: { width: '30%', alignItems: 'center', justifyContent: 'center' },
  labelText: { fontFamily: 'Montserrat-SemiBold', color: COLORS.gray, marginLeft: 10, fontSize: 14, textAlign: 'center' },
  lineView: { marginTop: 20, width: windowWidth * 0.85, height: windowHeight * 0.02, alignSelf: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  lineText: { position: 'absolute', top: 5, backgroundColor: '#FFFFFF', fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'flex-start', fontSize: 16 },
  fileDateAndSync: { width: windowWidth * 0.9, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  fileDateBox: { width: '100%', backgroundColor: '#eef2fa', elevation: 2, alignSelf: 'flex-end', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 },
  actionsRow: { width: '95%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  curveView: { width: windowWidth, height: windowHeight * 0.18, backgroundColor: COLORS.primaryAccent, marginBottom: 'auto', borderBottomLeftRadius: 100, borderBottomRightRadius: 100, elevation: 5 },
  modalView: { flex: 1, backgroundColor: 'white', padding: 20, marginTop: 1, borderRadius: 10, elevation: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView11: { width: '90%', padding: 30, paddingBottom: 50, paddingTop: 30, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, marginHorizontal: 5, marginVertical: 5, borderColor: COLORS.primaryAccent },
  modalTitle: { fontSize: 20, fontFamily: 'Montserrat-Bold', marginBottom: 20 },
  noResultsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
  cloudIcon: { marginBottom: 20 },
  buttonLabel: { fontSize: 16, fontFamily: 'Montserrat-Bold' },
  whatsappIcon: { marginHorizontal: 5, marginVertical: 5, backgroundColor: '#25D366', borderRadius: 15, padding: 5 },
  smsIcon: { marginHorizontal: 5, marginVertical: 5, backgroundColor: COLORS.primary, borderRadius: 15, padding: 5 },
});

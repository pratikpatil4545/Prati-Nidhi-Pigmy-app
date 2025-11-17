import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Pressable,
  ScrollView,
  Modal,
  BackHandler,
  Linking,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants';
import IconFA6 from 'react-native-vector-icons/FontAwesome6';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, TextInput } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { XMLParser } from 'fast-xml-parser';
import { Buffer } from 'buffer';

export default function UserProfileScreen({ route, navigation }) {
  const passedItem = route.params?.item || {};
  const [accountItem, setAccountItem] = useState(passedItem);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
  const [isReceiptModalVisible, setReceiptModalVisible] = useState(false);
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState(null);
  const [updatedOpeningBalance, setUpdatedOpeningBalance] = useState(null);
  const [openingBalanceForPopup, setOpeningBalanceForPopup] = useState(null);
  const [calculatedClosingBalance, setCalculatedClosingBalance] = useState(null);
  const isFocused = useIsFocused();
  const [hasCollectedToday, setHasCollectedToday] = useState(false);
  const [localTransactionTable, setLocalTransactionTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  const [branchCode, setBranchCode] = useState(null);
  const [agentCode, setAgentCode] = useState(null);
  const [branchAgentCode, setBranchAgentCode] = useState(null);
  const [fileCreateDate, setFileCreateDate] = useState(null);
  const [inputFileType, setInputFileType] = useState(null);
  const [clearedOnFocus, setClearedOnFocus] = useState(false);
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLicenseExpired, setIsLicenseExpired] = useState(false);
  const [lastCollectionDateTime, setLastCollectionDateTime] = useState(null);

  useEffect(() => {
    let unsubscribe;
    let prevState;
    unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isInternetReachable != null ? state.isInternetReachable : false;
      if (prevState !== online) {
        prevState = online;
        setIsOnline(online);
        if (!online) {
          notifyOffline();
        }
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const notifyOffline = () => {
    console.log('Internet Connection You are offline. Some features may not be available.');
  };

  useEffect(() => {
    const incomingMobile = route.params?.mobileNumber?.toString();
    const itemMobile = route.params?.item?.Mobile1;
    if ((itemMobile === '0' || !itemMobile) && !incomingMobile) {
      setShowMobileInput(true);
    } else {
      setShowMobileInput(false);
      setMobileNumber(incomingMobile ? incomingMobile : itemMobile);
    }
  }, [route.params?.item, route.params?.mobileNumber]);

  useEffect(() => {
    const currentBalance = parseFloat(accountItem.ThisMthBal) || 0;
    const enteredAmount = parseFloat(collectionAmount) || 0;
    if (accountItem.IsAmtToBeAdded === 'False' && currentBalance < enteredAmount) {
      const diff = enteredAmount - currentBalance;
      setCollectionAmount(diff.toString());
    } else if (accountItem.IsAmtToBeAdded === 'False' && updatedOpeningBalance === 0) {
      setCollectionAmount(null);
      setHasCollectedToday(true);
    } else {
      setCollectionAmount(accountItem.DailyAmt);
    }
  }, [accountItem, isCollectionModalVisible]);

  useEffect(() => {
    const filteredTx = (localTransactionTable || []).filter(
      (txn) => txn.AccountNo === accountItem.AccountNo && txn.GLCode === accountItem.GLCode
    );
    setUpdatedOpeningBalance(route.params?.openingBalance ?? 0);
    const todayTxExists = filteredTx?.some((txn) => {
      const datePart = txn.CollDateTime?.split(' ')[0];
      const [year, month, day] = datePart?.split('-') || [];
      const fullYear = year && year.length === 2 ? `20${year}` : year;
      const txnDateISO = `${fullYear}-${month}-${day}`;
      const todayISO = new Date().toISOString().split('T')[0];
      return txnDateISO === todayISO && txn.AccountNo === accountItem.AccountNo && txn.GLCode === accountItem.GLCode;
    });

    if (todayTxExists) {
      setHasCollectedToday(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setHasCollectedToday(false);
    }
  }, [localTransactionTable, accountItem, route.params?.openingBalance]);

  useEffect(() => {
    const verifyLicense = async () => {
      try {
        const licenseDate = await AsyncStorage.getItem('LicenseValidUpto');
        const expiry = new Date(licenseDate);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
        setIsLicenseExpired(diffDays < 0);
      } catch (err) {
        console.error('Error checking license validity:', err);
        Alert.alert('Error', 'Failed to check license validity. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    verifyLicense();
  }, []);

  const formatDateTimeForUrl = (date) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleWhatsAppPress = async () => {
    const clId = clientId;
    const br = branchCode;
    const ag = agentCode;
    const gl = accountItem.GLCode;
    const ac = accountItem.AccountNo;
    const ruidString = `${clId},${br},${ag},${gl},${ac}`;
    const ruid = Buffer.from(ruidString).toString('base64');
    const encodedDateTime = lastCollectionDateTime?.replace(' ', '%20') ?? formatDateTimeForUrl(new Date()).replace(' ', '%20');
    const receiptUrl = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;
    const targetNumber = showMobileInput ? mobileNumber : (mobileNumber ? mobileNumber : parseInt(route.params?.item?.Mobile1 || ''));
    const phoneNumber = `+91${targetNumber}`;
    const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${receiptUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;
    Linking.openURL(url);
    postSubmitCleanup();
  };

  const handleSmsPress = async () => {
    const clId = clientId;
    const br = branchCode;
    const ag = agentCode;
    const gl = accountItem.GLCode;
    const ac = accountItem.AccountNo;
    const colDateTime = formatDateTimeForUrl(new Date());
    const ruidString = `${clId},${br},${ag},${gl},${ac}`;
    const ruid = Buffer.from(ruidString).toString('base64');
    // const encodedDateTime = colDateTime.replace(' ', '%20');
    const encodedDateTime = lastCollectionDateTime?.replace(' ', '%20') ?? formatDateTimeForUrl(new Date()).replace(' ', '%20');
    const receiptUrl = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;
    const targetNumber = showMobileInput ? mobileNumber : (mobileNumber ? mobileNumber : parseInt(route.params?.item?.Mobile1 || ''));
    const phoneNumber = `+91${targetNumber}`;
    const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${receiptUrl}`;
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(smsUrl);
      postSubmitCleanup();
    } catch (err) {
      Alert.alert('Error', 'Unable to open SMS app.');
    }
  };

  const loadLocalStorageData = async () => {
    try {
      const localTxRaw = await AsyncStorage.getItem('transactionTable');
      const masterRaw = await AsyncStorage.getItem('dataObject');
      const master = masterRaw ? JSON.parse(masterRaw) : {};
      setClientId(master?.MstrData?.ClientID);
      setAgentCode(master?.MstrData?.AgCode);
      setBranchCode(master?.MstrData?.BrCode);
      setBranchAgentCode(master?.MstrData?.BrAgCode);
      setFileCreateDate(master?.MstrData?.FileCreateDate);
      setInputFileType(master?.MstrData?.InputFileType);
      if (localTxRaw) {
        setLocalTransactionTable(JSON.parse(localTxRaw));
      }
    } catch (err) {
      Alert.alert('Failed to fetch data from Local Storage', err.message);
    }
  };

  useEffect(() => {
    loadLocalStorageData();
  }, [isFocused]);

  const openCollectionModal = () => {
    setCollectionModalVisible(true);
  };

  const closeCollectionModal = () => {
    setSubmitButtonLoading(false);
    setCollectionModalVisible(false);
  };

  const formatDateTimeString = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mm = `${date.getMinutes()}`.padStart(2, '0');
    const ss = `${date.getSeconds()}`.padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  };

  const validateMobile = () => {
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

  const validateAmount = () => {
    const OneShotLmt = accountItem.OneShotLmt;
    const MaxBalance = accountItem.MaxBalance;
    const ThisMthBal = accountItem.ThisMthBal;
    const DailyAmt = accountItem.DailyAmt;
    const MaxInstal = accountItem.MaxInstal;
    const IsAmtToBeAdded = accountItem.IsAmtToBeAdded;
    const currentBalance = parseFloat(ThisMthBal) || 0;
    const amountValue = parseFloat(collectionAmount) || 0;
    let updatedBalance;
    if (IsAmtToBeAdded === 'True') {
      updatedBalance = currentBalance + amountValue;
    } else {
      updatedBalance = currentBalance - amountValue;
    }
    const checks = [
      { condition: IsAmtToBeAdded === 'False' && currentBalance < amountValue, message: 'Amount more than balance cannot be accepted.' },
      { condition: OneShotLmt != 0 && amountValue > parseInt(OneShotLmt), message: 'Amount exceeds one shot limit.' },
      { condition: MaxBalance != 0 && updatedBalance > parseInt(MaxBalance), message: 'Amount exceeds maximum balance.' },
      { condition: MaxInstal != 0 && DailyAmt != 0 && (amountValue % parseInt(DailyAmt)) !== 0, message: `Amount should be exact multiple of ${DailyAmt}.` },
      { condition: MaxInstal != 0 && DailyAmt != 0 && (amountValue / parseInt(DailyAmt)) > parseInt(MaxInstal), message: `Maximum ${MaxInstal} installments can be accepted.` },
      { condition: amountValue <= 0, message: 'Please enter a valid amount.' },
    ];
    for (const { condition, message } of checks) {
      if (condition) {
        Alert.alert('Warning', message);
        return false;
      }
    }
    return true;
  };

  const calculatePendingSumForAccount = async (accountNo) => {
    try {
      const raw = await AsyncStorage.getItem('transactionTable');
      const table = JSON.parse(raw) || [];
      const sum = table
        .filter((entry) => entry.AccountNo === accountNo)
        .map((e) => parseFloat(e.Collection) || 0)
        .reduce((acc, v) => acc + v, 0);
      return sum;
    } catch (err) {
      Alert.alert('Error calculating collection sum:', err.message);
      return 0;
    }
  };

  const prepareTransactionContext = async (GLCode, AccountNo, ThisMthBal, IsAmtToBeAdded) => {
    try {
      const raw = await AsyncStorage.getItem('transactionTable');
      const table = JSON.parse(raw) || [];
      const related = table.filter((t) => t.AccountNo === AccountNo && t.GLCode === GLCode).sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime));
      const totalExisting = table.reduce((s, t) => s + (parseFloat(t.Collection) || 0), 0);
      const totalCheck = parseFloat(totalExisting) + parseFloat(collectionAmount || 0);
      const maxAllowed = parseInt(route.params?.maxAmountLimit || '0');
      if (totalCheck > maxAllowed) {
        Alert.alert('Collection Limit Reached', 'You cannot collect more than the maximum allowed amount.');
        return null;
      }
      const pendingSum = await calculatePendingSumForAccount(AccountNo);
      let openingBalance = parseFloat(ThisMthBal || 0);
      let closingBalance;
      if (IsAmtToBeAdded === 'True') {
        if (parseFloat(pendingSum) === 0) {
          closingBalance = openingBalance + parseFloat(collectionAmount || 0);
        } else {
          openingBalance += parseFloat(pendingSum);
          closingBalance = openingBalance + parseFloat(collectionAmount || 0);
        }
      } else if (IsAmtToBeAdded === 'False' && openingBalance >= parseFloat(collectionAmount || 0)) {
        openingBalance -= parseFloat(pendingSum);
        closingBalance = openingBalance - parseFloat(collectionAmount || 0);
      } else {
        Alert.alert('Insufficient Balance', `Available balance: ${openingBalance}. Collection amount: ${collectionAmount}.`);
        return null;
      }
      return { openingBalance, table, closingBalance };
    } catch (err) {
      Alert.alert('Transaction Error', 'An error occurred while fetching transaction data.');
      return null;
    }
  };

  const postToServerAndStore = async (transactionRecord, payloadString, online) => {
    setSubmitButtonLoading(false);
    try {
      const current = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
      if (transactionRecord) {
        await AsyncStorage.setItem('transactionTable', JSON.stringify([...current, transactionRecord]));
      }
      else {
        console.warn('Storage Error', 'Failed to store transaction locally.');
        Alert.alert('Error', 'Failed to save data. Please try again.')
        closeCollectionModal();
        setLoaderVisible(false);
        return;
      }
    } catch (err) {
      console.warn('Storage Error', 'Failed to store transaction locally.');
      Alert.alert('Error', 'Failed to save data. Please try again.')
      closeCollectionModal();
      setLoaderVisible(false);
      return;
    }

    try {
      const response = await fetch(`https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp?DataFromApp=${payloadString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ DataFromApp: payloadString }).toString(),
      });
      const resText = await response.text();
      const parser = new XMLParser();
      const parsedXml = parser.parse(resText);
      const resObj = JSON.parse(parsedXml.string);
      const rawResp = resObj.ResponseString || '';
      if (resObj.ResonseCode === '0000') {
        const sentRecord = JSON.parse(payloadString);
        const currentStorage = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
        const matched = currentStorage.filter((it) =>
          it.pending === true &&
          it.accountNo === sentRecord.accountNo &&
          it.collDateTime === sentRecord.collDateTime
        );
        if (matched.length > 0) {
          matched[0].pending = false;
          // await AsyncStorage.setItem('transactionTable', JSON.stringify(currentStorage));

          try {
            await AsyncStorage.setItem('transactionTable', JSON.stringify(currentStorage));
          } catch (err) {
            console.warn('Storage Error', 'Failed to store transaction locally.');
            Alert.alert('Error', 'Failed to save data. Please try again.')
            closeCollectionModal();
            setLoaderVisible(false);
            return;
          }
        }
        const jsonStart = rawResp.indexOf('{');
        const cleaned = rawResp.substring(jsonStart);
        const parsedResponseJson = JSON.parse(cleaned);
        const collData = parsedResponseJson.CollectionData;
        if (collData && collData.length > 0) {
          const collDateTime = collData[0].CollDateTime;
          setLastCollectionDateTime(collDateTime);
          setHasCollectedToday(true);
          setReceiptModalVisible(true);
          setLoaderVisible(false);
        } else {
          Alert.alert('No collection date found.');
          setLoaderVisible(false);
        }
      } else {
        Alert.alert('Error:', `Response Code : ${resObj.ResonseCode}, ${resObj.ResponseString}`);
        setLoaderVisible(false);
      }
    } catch (err) {
      setHasCollectedToday(true);
      setReceiptModalVisible(true);
      setLoaderVisible(false);
    }
  };

  const handleSubmitCollection = async () => {
    setSubmitButtonLoading(true);
    const {
      OneShotLmt,
      MaxBalance,
      ThisMthBal,
      DailyAmt,
      MaxInstal,
      IsAmtToBeAdded,
      GLCode,
      AccountNo,
      EnglishName,
    } = accountItem;

    if (!validateMobile() || !validateAmount()) {
      setSubmitButtonLoading(false);
      return;
    }

    const txContext = await prepareTransactionContext(GLCode, AccountNo, ThisMthBal, IsAmtToBeAdded);
    if (!txContext) {
      setSubmitButtonLoading(false);
      return;
    }

    const { openingBalance, table, closingBalance } = txContext;
    const transactionRecord = {
      GLCode,
      AccountNo,
      EnglishName,
      OpeningBal: openingBalance.toString(),
      Collection: (collectionAmount || '').toString(),
      ClosingBal: closingBalance.toString(),
      CollDateTime: formatDateTimeString(new Date()),
      IsitNew: 'false',
      IsAmtAdd: IsAmtToBeAdded === 'True' ? '1' : '0',
      MobileNo: showMobileInput ? mobileNumber : (route.params?.item?.Mobile1 !== '0' ? parseInt(route.params?.item?.Mobile1) : mobileNumber),
    };

    const payloadObject = {
      ClientID: clientId,
      BrCode: branchCode,
      AgCode: agentCode,
      BrAgCode: branchAgentCode,
      InputFileType: inputFileType,
      FileCreateDate: fileCreateDate,
      NoOfRecords: '1',
      CollectionData: [transactionRecord],
    };

    if (payloadObject.CollectionData && payloadObject.CollectionData.length > 0) {
      setLastCollectionDateTime(payloadObject.CollectionData[0].CollDateTime);
    }

    const confirmMessage = `
Name: ${EnglishName}
Account Number: ${AccountNo}
Opeing Balance: ${(openingBalance || openingBalance === 0) ? `₹${new Intl.NumberFormat('en-IN').format(openingBalance)}` : ThisMthBal}
Amount Collected: ₹${collectionAmount}
Total Account Balance: ${closingBalance ? `₹${new Intl.NumberFormat('en-IN').format(closingBalance)}` : 0}
`.trim();

    Alert.alert('Please Confirm Collection', confirmMessage, [
      { text: 'Cancel', style: 'cancel', onPress: () => { setSubmitButtonLoading(false); } },
      {
        text: 'Confirm',
        onPress: async () => {
          setLoaderVisible(true);
          setCalculatedClosingBalance(closingBalance);
          setUpdatedOpeningBalance(closingBalance);
          setOpeningBalanceForPopup(openingBalance);
          const storeRecord = {
            ...transactionRecord,
            pending: true,
          };
          await postToServerAndStore(storeRecord, JSON.stringify(payloadObject), isOnline);
          setSubmitButtonLoading(false);
        },
      },
    ]);
  };

  const postSubmitCleanup = () => {
    setCollectionModalVisible(false);
    setReceiptModalVisible(false);
    loadLocalStorageData();
    navigation.navigate('Dashboard', { refreshData: true });
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFocused, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

      <View style={styles.header}>
        <IconFA6 name="angle-left" color={COLORS.primaryAccent} size={40} onPress={() => navigation.navigate('Dashboard')} />
        <View style={styles.titleSpace} />
        <View style={styles.headerIcon}>
          <Image source={require('../../Assets/Images/rupee.png')} style={styles.headerIconImage} />
        </View>
      </View>

      <View style={styles.infoCard}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.infoLeft}>
            <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Name :</Text>
            <Text style={[styles.infoText, { fontFamily: 'Montserrat-Bold', marginHorizontal: 25, fontSize: 18 }]}>{accountItem.EnglishName ?? ''}</Text>

            <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number :</Text>
            <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{accountItem.AccountNo}</Text>

            {/* <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Name :</Text>
            <Text style={[styles.infoText,{ fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25}]}>{accountItem.EnglishName}</Text> */}

            <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Branch :</Text>
            <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{route.params?.BranchName} ({route.params?.BranchCode})</Text>

            <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Opening Balance :</Text>
            <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{(updatedOpeningBalance || updatedOpeningBalance === 0) ? `₹${new Intl.NumberFormat('en-IN').format(updatedOpeningBalance)}` : accountItem.ThisMthBal}</Text>

            {parseInt(accountItem.LastMthBal) !== 0 && <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Last Month Balance :</Text>}
            {parseInt(accountItem.LastMthBal) !== 0 && <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{accountItem.LastMthBal}.00</Text>}

            {parseInt(accountItem.LienAmt) !== 0 && <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Lien Amount :</Text>}
            {parseInt(accountItem.LienAmt) !== 0 && <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{new Intl.NumberFormat('en-IN').format(accountItem.LienAmt)}</Text>}

            <Text style={[styles.labelPrimary, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>A/C Opened date. :</Text>
            <Text style={[styles.infoText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{accountItem.AccOpenDt}</Text>
          </View>
        )}
      </View>

      <View style={{ width: '95%', alignSelf: 'center' }}>
        {(route.params?.collectionAllowed === 'true' || Boolean(route.params?.collectionAllowed)) && (route.params?.multipleCollection || !hasCollectedToday) ? (
          <>
            {isLicenseExpired ? (
              <View>
                <Text style={[styles.infoText, { marginTop: '10%', alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>License expired! Your license has expired. Please pay subscription.</Text>
              </View>
            ) : (
              <Button
                style={styles.collectButton}
                icon="plus"
                labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }}
                mode="contained"
                onPress={openCollectionModal}
                contentStyle={{ flexDirection: 'row', width: '100%' }}
              >
                <Text style={{ color: COLORS.white }}>Collection</Text>
              </Button>
            )}
          </>
        ) : (
          <View style={styles.centeredNotice}>
            {(route.params?.collectionAllowed === 'false' || route.params?.collectionAllowed === false) ? (
              <Text style={[styles.infoText, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>The allowed days for collection have expired.</Text>
            ) : (!route.params?.multipleCollection || hasCollectedToday) ? (
              <Text style={[styles.infoText, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>Collection already done for today.</Text>
            ) : null}
          </View>
        )}
      </View>

      <Modal animationType="slide" transparent visible={isCollectionModalVisible} onRequestClose={closeCollectionModal}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Today's Collection</Text>
            {showMobileInput && (
              <View style={{ width: '100%' }}>
                <TextInput
                  label="Enter mobile number"
                  mode="outlined"
                  outlineColor="#8ABCF9"
                  value={mobileNumber}
                  keyboardType="numeric"
                  onChangeText={setMobileNumber}
                  style={styles.inputFull}
                  outlineStyle={styles.inputOutline}
                  contentStyle={{ fontFamily: 'Montserrat-SemiBold' }}
                />
              </View>
            )}

            <TextInput
              label="Enter amount"
              mode="outlined"
              outlineColor="#8ABCF9"
              value={collectionAmount}
              keyboardType="numeric"
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '');
                setCollectionAmount(filtered);
              }}
              onFocus={() => {
                if (!clearedOnFocus) {
                  setCollectionAmount('');
                  setClearedOnFocus(true);
                }
              }}
              style={styles.inputFull}
              outlineStyle={styles.inputOutline}
              contentStyle={{ fontFamily: 'Montserrat-SemiBold' }}
            />

            <View style={styles.modalButtons}>
              <Button style={{ width: '48%' }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} loading={submitButtonLoading} disabled={submitButtonLoading} onPress={handleSubmitCollection}>Submit</Button>
              <Button style={{ width: '48%' }} mode="outlined" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={closeCollectionModal}>Cancel</Button>
            </View>
          </View>
        </View>
      </Modal>

      {isLoaderVisible && (
        <Modal animationType="fade" transparent visible={isLoaderVisible}>
          <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isReceiptModalVisible}
      >
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'rgba(0, 0, 0, 0.5)'}
        />
        <View style={styles.modalContainer}>

          <View style={styles.modalView}>
            <IconMaterial onPress={() => { setReceiptModalVisible(false), setCollectionModalVisible(false) }} name='close' color={COLORS.primary} style={{ position: "absolute", top: 15, right: 15 }} size={30} />
            <IconMaterial name='cloud-done' color={COLORS.primary} style={{ elevation: 5 }} size={100} />
            <View style={[styles.dataInfoView, { width: '100%' }]}>
              <View style={styles.left}>
                <Text style={[styles.modalText, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Name : </Text>
                <Text style={[styles.modalText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{accountItem.EnglishName}</Text>
                <Text style={[styles.modalText, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number : </Text>
                <Text style={[styles.modalText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{accountItem.AccountNo}</Text>
                <Text style={[styles.modalText, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Old Account Balance : </Text>
                <Text style={[styles.modalText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{(openingBalanceForPopup || openingBalanceForPopup === 0) ? `₹${new Intl.NumberFormat('en-IN').format(openingBalanceForPopup)}` : accountItem.ThisMthBal}</Text>
                <Text style={[styles.modalText, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Amount Collected : </Text>
                <Text style={[styles.modalText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{collectionAmount}</Text>
                <Text style={[styles.modalText, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Total Account Balance : </Text>
                <Text style={[styles.modalText, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{calculatedClosingBalance ? `₹${new Intl.NumberFormat('en-IN').format(calculatedClosingBalance)}` : 0}</Text>
              </View>
            </View>

            <View style={[styles.buttonContainer, { marginTop: 10, justifyContent: 'space-evenly' }]}>
              <IconMC
                onPress={handleWhatsAppPress}
                style={styles.whatsappIcon}
                name='whatsapp'
                color={COLORS.white}
                size={35}
              />
              <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>
              <IconMC
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
                onPress={postSubmitCleanup}
              >
                No Receipt
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: windowWidth, height: windowHeight, backgroundColor: '#FFFFFF' },
  header: { width: windowWidth, height: windowHeight * 0.15, backgroundColor: COLORS.white, elevation: 5, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 20 },
  titleSpace: { flex: 1 },
  headerIcon: { width: 70, height: 70, marginRight: 10, borderRadius: 35, overflow: 'hidden', borderColor: COLORS.lightGrey },
  headerIconImage: { width: 70, height: 70, resizeMode: 'contain' },
  infoCard: { width: windowWidth * 0.85, borderRadius: 10, alignSelf: 'center', marginTop: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', backgroundColor: '#eef2fa', elevation: 1 },
  infoLeft: { flex: 1 },
  labelPrimary: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginVertical: 3,
    marginHorizontal: 15,
    color: COLORS.gray,
    alignSelf: 'flex-start'
  },
  infoText: { fontFamily: 'Montserrat-Regular', fontSize: 14, marginVertical: 3, marginHorizontal: 15, color: COLORS.gray, alignSelf: 'flex-start' },
  modalText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginVertical: 3,
    marginHorizontal: 15,
    color: COLORS.gray,
    alignSelf: 'flex-start'
  },
  collectButton: { width: '80%', height: 55, alignSelf: 'center', marginTop: 20, justifyContent: 'center' },
  centeredNotice: { width: '95%', alignSelf: 'center', height: windowHeight * 0.09, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    padding: 30,
    paddingBottom: 50,
    paddingTop: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBox: { width: '90%', padding: 30, paddingBottom: 50, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: COLORS.darkGrey },
  inputFull: { width: '100%', marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white },
  inputOutline: { borderRadius: 15, fontSize: 18 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  dataInfoView: {
    width: windowWidth * 0.85,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#eef2fa',
    elevation: 1
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  successIcon: {
    marginTop: 10,
    marginBottom: 10,
    elevation: 4,
  },
  modalHeading: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  receiptInfoSection: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
    flexShrink: 1,
  },
  receiptLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 5,
  },
  receiptValue: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: COLORS.darkGrey,
    marginBottom: 5,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  separator: {
    alignSelf: 'center',
    fontSize: 26,
    color: '#999',
  },
  whatsappIcon: {
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: '#25D366',
    borderRadius: 15,
    padding: 5,
    elevation: 5,
  },
  noReceipt: {
    backgroundColor: '#e1ebfa',
    elevation: 2,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  smsIcon: {
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 5,
    elevation: 5,
  },
  buttonLabel: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

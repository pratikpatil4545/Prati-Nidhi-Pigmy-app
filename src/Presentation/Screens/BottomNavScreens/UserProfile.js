import { View, Text, StyleSheet, Image, StatusBar, Pressable, ScrollView, Modal, BackHandler, Linking, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, TextInput } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { XMLParser } from 'fast-xml-parser';
import { Buffer } from 'buffer';

export default function UserProfile({ route, navigation }) {

  const { index } = route.params;
  // console.log("routes",route.params)
  const [item, setItem] = useState(route.params.item);
  const [mobileInputVisible, setmobileInputVisible] = useState(false);
  const [mobileNumber, setmobileNumber] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [amount, setAmount] = useState(null);
  const [isTodayCollected, setisTodayCollected] = useState(true);
  const [updatedBalances, setupdatedBalance] = useState(null);
  const [openingBalinPop, setOpeningBalinPop] = useState(null);
  const [newBalance, setNewBalance] = useState(null);
  const isFocused = useIsFocused();
  const today = new Date().toLocaleDateString();
  const [collectionMadeToday, setCollectionMadeToday] = useState(false);
  const [transactionTableData, setTransactionTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ClientID, setClientId] = useState(null);
  const [BrCode, setBrCode] = useState(null);
  const [AgCode, setAgCode] = useState(null);
  const [BrAgCode, setBrAgCode] = useState(null);
  const [FileCreateDate, setFileCreateDate] = useState(null);
  const [InputFileType, setInputFileType] = useState(null);
  const [hasCleared, setHasCleared] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isConnected, setConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected);
      console.log("networks state", state)
      if (!state.isConnected) {
        showAlert();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showAlert = () => {
    console.log('Internet Connection You are offline. Some features may not be available.');
  };

  useEffect(() => {
    if (route.params.item.Mobile1 === '0' || !route.params.item.Mobile1) {
      setmobileInputVisible(true);
    }
    else {
      setmobileInputVisible(false);
      setmobileNumber(route.params.item.Mobile1)
    }
  }, [route.params.item])

  useEffect(() => {
    let currentBalance = parseFloat(item.ThisMthBal) || 0;
    let amountValue = parseFloat(amount) || 0;

    if (item.IsAmtToBeAdded === 'False' && currentBalance < amountValue) {
      let temp = parseFloat(amountValue) - parseFloat(currentBalance);
      setAmount(temp.toString());
    } else if (item.IsAmtToBeAdded === 'False' && updatedBalances === 0) {
      setAmount(null);
      setCollectionMadeToday(true);
    } else {
      setAmount(item.DailyAmt);
    }
  }, [item, modalVisible]);

  useEffect(() => {
    // setLoading(true);
    const filteredTransactions = transactionTableData?.filter((transaction) =>
      transaction.AccountNo === item.AccountNo && transaction.GLCode === item.GLCode
    );
    // let temp = filteredTransactions[0];
    // if (filteredTransactions && filteredTransactions.length > 0) {
    //   const latestTransaction = filteredTransactions[filteredTransactions.length - 1];
    //   console.log("updated balance", latestTransaction)

    //   setupdatedBalance(latestTransaction?.OpeningBal);
    //   setLoading(false);

    // } else {
    //   setLoading(false);

    //   setupdatedBalance(null);
    // }
    setupdatedBalance(route.params?.openingBalance ? route.params.openingBalance : 0);
    // console.log("filtered data", transactionTableData);
    const lastTransactionToday = transactionTableData?.some((transaction) => {
      let item = route.params?.item;
      const [day, month, year] = transaction.CollDateTime?.split(' ')[0]?.split('-');
      const fullYear = year.length === 2 ? `20${year}` : year;
      const collectionDate = new Date(`${fullYear}-${month}-${day}`);

      return collectionDate.toLocaleDateString() === today
        && transaction.accNo === item.AccountNo
        && transaction.glCode === item.GLCode;
    });

    if (lastTransactionToday) {
      setCollectionMadeToday(true);
      setLoading(false);
    } else {
      setLoading(false);

      // console.log("false");
      setCollectionMadeToday(false);
    }
  }, [transactionTableData]);

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
    const glcod = item.GLCode;
    const acno = item.AccountNo;
    const ColldateTime = formatDateTime(new Date());
    const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
    const ruid = Buffer.from(ruidString).toString('base64');
    const encodedDateTime = collectionDate.replace(' ', '%20');
    console.log("time new", encodedDateTime)

    const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;

    console.log(encodedURL);
    const getNumber = mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1);
    const phoneNumber = `+91${getNumber}`;
    const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;
    Linking.openURL(url);

    handleSubmit2();
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
    const glcod = item.GLCode;
    const acno = item.AccountNo;
    const ColldateTime = formatDateTime(new Date());
    const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
    const ruid = Buffer.from(ruidString).toString('base64');
    const encodedDateTime = collectionDate.replace(' ', '%20');
    console.log("time new", encodedDateTime)

    const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;

    console.log(encodedURL);
    const getNumber = mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1);
    const phoneNumber = `+91${getNumber}`;
    const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;

    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(smsUrl);
      handleSubmit2();
    } catch (error) {
      Alert.alert("Error", "Unable to open SMS app.");
    }
  };

  const checkAsyncStorageForData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('transactionTable');

      const savedMasterData = await AsyncStorage.getItem('dataObject');
      const dataObject = JSON.parse(savedMasterData);

      setClientId(dataObject.MstrData?.ClientID);
      setAgCode(dataObject.MstrData?.AgCode);
      setBrCode(dataObject.MstrData?.BrCode);
      setBrAgCode(dataObject.MstrData?.BrAgCode);
      setFileCreateDate(dataObject.MstrData?.FileCreateDate);
      setInputFileType(dataObject.MstrData?.InputFileType);


      if (savedData) {
        const dataObject = JSON.parse(savedData);
        // let data = JSON.parse(storedData); // Ensure JSON parsing
        // console.log("data for refresh", dataObject)
        setTransactionTableData(dataObject);
        // setItem(data[index]);
        // data.forEach(transaction => {
        //   // console.log("9th index value:", transaction[9]);
        //   setCurrentBalance(transaction.M_Field5);
        // });
      }
    } catch (e) {
      console.error('Failed to fetch data from AsyncStorage', e);
    }
  };

  useEffect(() => {
    checkAsyncStorageForData();
  }, [isFocused]);

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleCancel2 = () => {
    setModalVisible2(false);
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
  };

  const [collectionDate, setCollectionDate] = useState(null);

  const handleSubmit = async () => {
    setButtonLoading(true);
    const { OneShotLmt, MaxBalance, ThisMthBal, DailyAmt, MaxInstal, IsAmtToBeAdded, GLCode, AccountNo, EnglishName } = item;

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

    const amountValidation = () => {
      const currentBalance = parseFloat(ThisMthBal) || 0;
      const amountValue = parseFloat(amount) || 0;
      const updatedBalance = currentBalance + amountValue;
      const conditions = [
        { condition: OneShotLmt != 0 && amountValue >= parseInt(OneShotLmt), message: 'Amount exceeds one shot limit.' },
        { condition: MaxBalance != 0 && updatedBalance >= parseInt(MaxBalance), message: 'Amount exceeds maximum balance.' },
        { condition: MaxInstal != 0 && DailyAmt != 0 && amountValue != parseInt(DailyAmt), message: 'Amount is not equal to daily amount.' },
        { condition: MaxInstal != 0 && DailyAmt != 0 && (amountValue % parseInt(DailyAmt) !== 0 || amountValue > parseInt(MaxInstal)), message: `Amount must be a multiple of ${DailyAmt} and not exceed ${MaxInstal}.` },
        { condition: updatedBalance === 0 && IsAmtToBeAdded === 'False', message: `Opening balance is '0'; cannot take further collection.` },
        { condition: amountValue <= 0, message: 'Please enter a valid amount.' }
      ];

      for (const { condition, message } of conditions) {
        if (condition) {
          Alert.alert('Warning', message);
          return false;
        }
      }
      return true;
    };

    const calculateCollectionSum = async (accountNo) => {
      try {
        let transactionTable = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];

        const totalCollectionSum = transactionTable
          .filter(entry => entry.AccountNo === accountNo)
          .map(entry => parseFloat(entry.Collection) || 0)
          .reduce((sum, collection) => sum + collection, 0);

        return totalCollectionSum;
      } catch (error) {
        console.error("Error calculating collection sum:", error);
        return 0;
      }
    };

    const transactionTableData = await AsyncStorage.getItem('transactionTable');
    // console.log("transacrion table data,",transactionTableData)
    // if (transactionTableData) {
    //     const parsedData = JSON.parse(transactionTableData);  // Parse the stored data
    //     setTransactionTable(parsedData);
    //     const pendingTransactions = parsedData.filter((item) => item.pending === true);
    //     setpendingCount(pendingTransactions.length);
    //     const total = parsedData.reduce((sum, transaction) => {
    //         return sum + (parseFloat(transaction.Collection) || 0);
    //     }, 0);
    //     // console.log("No saved data found, making API call...", total);

    //     setTotalAmount(total);
    // }

    const fetchTransactionData = async () => {
      try {
        let transactionTable = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
        const filteredTransactions = transactionTable.filter(
          (entry) => entry.AccountNo === AccountNo && entry.GLCode === GLCode
        ).sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime));

        const total = transactionTable.reduce((sum, transaction) => {
          return sum + (parseFloat(transaction.Collection) || 0);
        }, 0);

        console.log("checkuing total collected amount", total)

        let totalCheck = parseFloat(total) + parseFloat(amount);

        if (totalCheck > route.params.item?.maxAmountLimit) {
          Alert.alert(
            "Warning",
            "The maximum collection limit has been reached. No further amounts can be collected."
          );
          return;
        }

        // let totalSum;

        // calculateCollectionSum(AccountNo).then((totalCollectionSum) => {
        //   console.log("Total Collection Sum:", totalCollectionSum);
        //   const totalSum = totalCollectionSum > 0 ? totalCollectionSum : parseInt(amount);
        //   console.log("Final Total Sum:", totalSum);
        // });

        let totalSum = 0;
        const totalCollectionSum = await calculateCollectionSum(AccountNo);
        totalSum = totalSum + totalCollectionSum;
        console.log("Total Collection Sum:", totalCollectionSum);
        console.log("Final Total Sum:", totalSum);

        const latestTransaction = filteredTransactions[0];
        // let openingBalance = parseFloat(latestTransaction?.OpeningBal || ThisMthBal || 0);
        let openingBalance = parseFloat(ThisMthBal || 0);
        let closingBalance;
        // console.log("amount to be added checking old values", latestTransaction, closingBalance);
        if (IsAmtToBeAdded === 'True') {
          if (parseFloat(totalSum) === 0) {
            // openingBalance += parseFloat(amount);
            closingBalance = openingBalance + parseFloat(amount);
          }
          else {
            openingBalance += parseFloat(totalSum);
            closingBalance = openingBalance + parseFloat(amount);
            console.log("amount to be added true", openingBalance, totalSum, closingBalance);
          }
        } else if (openingBalance >= parseFloat(amount)) {
          closingBalance = openingBalance - parseFloat(amount);
          openingBalance -= parseFloat(totalSum);
          // console.log("amount to be added false openbal less than amount", openingBalance, closingBalance);

        } else {
          Alert.alert('Error', 'Insufficient balance.');
          return null;
        }
        return { openingBalance, transactionTable, closingBalance };
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        return null;
      }
    };

    const submitData = async (transactionData, newArrayString, isOnline) => {
      if (isOnline) {
        try {
          const response = await fetch(`https://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp?DataFromApp=${newArrayString.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
          });
          const responseText = await response.text();

          const parser = new XMLParser();
          const jsonResponse = parser.parse(responseText);

          const jsonString = jsonResponse.string;
          const responseObject = JSON.parse(jsonString);
          const rawResponseString = responseObject.ResponseString;

          // console.log("Response for submit api:", responseObject, rawResponseString);
          // Extract only the JSON part from the rawResponseString
          const jsonStartIndex = rawResponseString.indexOf('{');
          const cleanedResponseString = rawResponseString.substring(jsonStartIndex);
          const dataObject = JSON.parse(cleanedResponseString);

          const collectionData = dataObject.CollectionData;
          console.log("collectionData:", dataObject);

          try {
            // Extract the actual JSON portion from ResponseString

            if (collectionData && collectionData.length > 0) {
              const collDateTime = collectionData[0].CollDateTime;
              // console.log("CollDateTime:", collDateTime);
              setCollectionDate(collDateTime);
              // You can store or use collDateTime as needed
            } else {
              console.log("No collection data found.");
            }
          }
          catch (error) {
            console.error("Error parsing the response:", error);
            if (responseObject.ResonseCode != '0000' || !response.ok) {
              Alert.alert(
                'Error:',
                `Code : ${responseObject.ResonseCode}, ${responseObject.ResponseString}`
              );
            }
          }
        } catch (error) {
          console.error("Error during API call:", error);
        }
      } else {
        const pendingTransactions = JSON.parse(await AsyncStorage.getItem('pendingTransactions')) || [];
        await AsyncStorage.setItem('pendingTransactions', JSON.stringify([...pendingTransactions, transactionData]));
        // Alert.alert('Offline', 'No internet connection. Transaction saved as pending.');
      }
    };

    if (!mobileValidation() || !amountValidation()) {
      setButtonLoading(false);
      return;
    }

    const receiptNo = generateReceiptNo();
    const transactionDetails = await fetchTransactionData();
    if (!transactionDetails) {
      setButtonLoading(false);
      return;
    }

    const { openingBalance, transactionTable, closingBalance } = transactionDetails;
    // setupdatedBalance(openingBalance);
    // setNewBalance(closingBalance);
    console.log("closing balance check", closingBalance)
    // let closingBal = openingBalance
    const transactionData = {
      GLCode,
      AccountNo,
      EnglishName,
      OpeningBal: openingBalance.toString(),
      Collection: amount.toString(),
      ClosingBal: closingBalance.toString(),
      CollDateTime: formatDateTime1(new Date()),
      IsitNew: 'false',
      IsAmtAdd: IsAmtToBeAdded === 'True' ? "1" : "0",
      MobileNo: mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1),
    };

    const newArray = {
      ClientID, BrCode, AgCode, BrAgCode, FileCreateDate, InputFileType, NoOfRecords: '1',
      CollectionData: [transactionData]
    };

    // console.log("new array checling", newArray);
    const message = `
    Name: ${EnglishName}
Account Number: ${AccountNo}
Opeing Balance: ${(openingBalance || openingBalance === 0) ? `₹${new Intl.NumberFormat('en-IN').format(openingBalance)}` : ThisMthBal}
Amount Collected: ₹${amount}
Total Account Balance: ${closingBalance ? `₹${new Intl.NumberFormat('en-IN').format(closingBalance)}` : 0}
  `;
    Alert.alert(
      'Please Confirm Collection',
      message.trim(),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            setNewBalance(closingBalance);
            setupdatedBalance(closingBalance);
            setOpeningBalinPop(openingBalance);
            // await AsyncStorage.setItem('transactionTable', JSON.stringify([...transactionTable, transactionData]));
            const updatedTransactionData = {
              ...transactionData,
              pending: !isConnected // Add pending flag if offline
            };

            const currentTransactions = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
            await AsyncStorage.setItem('transactionTable', JSON.stringify([...currentTransactions, updatedTransactionData]));
            // setupdatedBalance(newBalance);
            setCollectionMadeToday(true);
            setModalVisible2(true);
            // await submitData(transactionData, JSON.stringify(newArray));
            if (isConnected) {
              await submitData(updatedTransactionData, JSON.stringify(newArray), true);
            } else {
              await submitData(updatedTransactionData, JSON.stringify(newArray), false);
            }
          }
        }
      ]
    );

    setButtonLoading(false);
  };

  const handleSubmit2 = () => {
    setModalVisible(false);
    setModalVisible2(false);
    checkAsyncStorageForData();
    setisTodayCollected(false);
    navigation.navigate('DashboardStack', { refreshData: true });
  }

  useEffect(() => {

    const handleBackPress = () => {
      navigation.navigate("DashboardStack")
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [isFocused]);


  return (
    <View style={styles.mainView}>
      <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

      <View style={styles.profileView}>
        <MaterialCommunityIcons4 onPress={() => { navigation.navigate("DashboardStack") }} style={{ zIndex: 454 }} name='angle-left' color={COLORS.primaryAccent} size={40} />
        <View style={styles.profileName}>
          <Text style={styles.text} >{item.EnglishName ? item.EnglishName : ''}</Text>
          {/* <Text style={[styles.text, {fontFamily: 'Montserrat-Regular', fontSize: 14}]} >A/C No. : {item.EnglishName ? item.EnglishName : ''}</Text> */}
          <Text style={[styles.text, { fontFamily: 'Montserrat-Regular', fontSize: 14 }]} >Address : Aundh, Pune</Text>
        </View>
        <View style={styles.profileIcon}>
          <Image style={{ width: 70, height: 70, resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
        </View>
      </View>

      <View style={styles.dataInfoView}>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.left}>
            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.AccountNo}</Text>

            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Name : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.EnglishName}</Text>

            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Branch : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{route.params.BranchName} ({route.params.BranchCode})</Text>

            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Opening Balance : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{(updatedBalances || updatedBalances === 0) ? `₹${new Intl.NumberFormat('en-IN').format(updatedBalances)}` : item.ThisMthBal}</Text>

            {parseInt(item.LastMthBal) != 0 &&
              <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Last Month Balance : </Text>
            }
            {parseInt(item.LastMthBal) != 0 &&
              <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.LastMthBal}.00</Text>
            }

            {parseInt(item.LienAmt) != 0 &&
              <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Lien Amount : </Text>
            }
            {parseInt(item.LienAmt) != 0 &&
              <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{new Intl.NumberFormat('en-IN').format(item.LienAmt)}</Text>
            }

            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>A/C Opened date. : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.AccOpenDt}</Text>
          </View>
        )}

      </View>

      <View style={{ width: '95%', alignSelf: 'center' }}>
        {(route.params.collectionAllowed === 'true' || Boolean(route.params.collectionAllowed)) &&
          (route.params.multipleCollection || !collectionMadeToday) ? (
          <Button
            style={{
              width: '80%',
              height: 55,
              alignSelf: 'center',
              marginTop: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              // minWidth: 100,
              // padding: 0,
              // margin: 0
            }}
            icon={'plus'}
            labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }}
            mode="contained"
            onPress={handlePress}
            contentStyle={{ flexDirection: 'row', width: '100%' }}
          >
            <Text style={{ color: COLORS.white, marginRight: 0 }}>Collection</Text>
          </Button>
        ) : (
          <View style={{ width: '95%', alignSelf: 'center', height: windowHeight * 0.09, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* <Text style={[styles.text1, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>Today's collection is received.</Text> */}
            {(route.params.collectionAllowed === 'false') ? (
              <Text style={[styles.text1, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>The collection window has expired.</Text>
            ) : (
              <Text style={[styles.text1, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>No collection required.</Text>
            )}
          </View>
        )}

      </View>

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
          <View style={styles.modalView}>
            <Text style={styles.text}>Today's Collection </Text>
            {mobileInputVisible &&
              <View style={{ width: '100%' }}>
                <TextInput
                  label="Enter mobile number"
                  mode='outlined'
                  outlineColor='#8ABCF9'
                  // autoFocus={true}
                  // ref={textInputRef} 
                  value={mobileNumber}
                  keyboardType='numeric'
                  onChangeText={text => setmobileNumber(text)}
                  style={{ width: "100%", marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white }}
                  outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
                  contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
                />
              </View>
            }

            <TextInput
              label="Enter amount"
              mode="outlined"
              outlineColor="#8ABCF9"
              value={amount}
              keyboardType="numeric"
              onChangeText={text => setAmount(text)}
              // onFocus={() => setIsFocusedInput(true)}
              onFocus={() => {
                if (!hasCleared) {
                  setAmount('');
                  setHasCleared(true);
                }
              }}
              // onBlur={() => setIsFocusedInput(false)}
              style={{
                width: "100%",
                marginBottom: 20,
                fontSize: 18,
                marginTop: 20,
                backgroundColor: COLORS.white,
              }}
              outlineStyle={{
                borderRadius: 15,
                fontSize: 18,
                color: COLORS.darkGrey,
                fontFamily: "Montserrat-Bold",
              }}
              contentStyle={{ fontFamily: "Montserrat-SemiBold" }}
            />
            {/* <TextInput
              label="Enter amount"
              mode='outlined'
              outlineColor='#8ABCF9'
              // autoFocus={true}
              // ref={textInputRef} 
              value={amount}
              keyboardType='numeric'
              onChangeText={text => setAmount(text)}
              style={{ width: "100%", marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white }}
              outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
              contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
            /> */}
            <View style={styles.buttonContainer}>
              {/* <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} loading={buttonLoading} disabled={buttonLoading} onPress={comfirmCheck} >Okay</Button> */}

              <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} loading={buttonLoading} disabled={buttonLoading} onPress={handleSubmit} >Submit</Button>
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
        <View style={styles.modalContainer}>

          <View style={styles.modalView}>
            <MaterialCommunityIcons2 onPress={() => { setModalVisible2(false), setModalVisible(false) }} name='close' color={COLORS.primary} style={{ position: "absolute", top: 15, right: 15 }} size={30} />
            <MaterialCommunityIcons2 name='cloud-done' color={COLORS.primary} style={{ elevation: 5 }} size={100} />
            <View style={[styles.dataInfoView, { width: '100%' }]}>
              <View style={styles.left}>
                <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Name : </Text>
                <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.EnglishName}</Text>
                <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number : </Text>
                <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.AccountNo}</Text>
                <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Old Account Balance : </Text>
                <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{(openingBalinPop || openingBalinPop === 0) ? `₹${new Intl.NumberFormat('en-IN').format(openingBalinPop)}` : item.ThisMthBal}</Text>
                <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Amount Collected : </Text>
                <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>₹{amount}</Text>
                <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Total Account Balance : </Text>
                <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{newBalance ? `₹${new Intl.NumberFormat('en-IN').format(newBalance)}` : 0}</Text>
              </View>
            </View>

            <View style={[styles.buttonContainer, { marginTop: 30 }]}>
              {/* <Button
                style={styles.modalButton}
                mode="contained"
                labelStyle={styles.buttonLabel}
                onPress={handleSubmit2}
              >
                Close
              </Button> */}
              {/* <View style={styles.modalButton}>
                <Text style={styles.buttonLabel}>No Receipt</Text>
              </View> */}
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
              <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>
              <MaterialCommunityIcons
                onPress={handleSmsPress}
                style={styles.smsIcon}
                name='android-messages'
                color={COLORS.white}
                size={35}
              />
              <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>
              {/* <Pressable onPress={handleSubmit2} style={styles.noReceipt}>
                <Text style={styles.buttonLabel}>No Receipt</Text>
              </Pressable> */}
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
  mainView: {
    width: windowWidth * 1,
    height: windowHeight * 1,
    backgroundColor: '#FFFFFF'
  },
  profileView: {
    width: windowWidth * 1,
    height: windowHeight * 0.15,
    backgroundColor: COLORS.white,
    elevation: 5,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 20,
    // justifyContent: '',
    flexDirection: 'row'
  },
  profileIcon: {
    // width: 80,
    width: '30%',

    // height: 80,
    // borderWidth: 1,
    borderRadius: 60,
    overflow: 'hidden',
    // padding: 2,
    borderColor: COLORS.lightGrey,
    // elevation: 5,
    // position: 'absolute',
    // top: windowHeight * 0.1
  },
  profileName: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
    // backgroundColor: 'red'
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    marginVertical: 5,
    color: COLORS.darkGrey
  },
  text1: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginVertical: 3,
    marginHorizontal: 15,
    color: COLORS.gray,
    alignSelf: 'flex-start'
  },
  dataInfoView: {
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
  },
  history: {
    width: windowWidth * 0.85,
    height: windowHeight * 0.4,
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 1
  },
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
    borderColor: COLORS.primaryAccent,
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
    elevation: 5,

  },
  noReceipt: {
    // marginHorizontal: 5,
    // marginVertical: 5,
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

  }

})
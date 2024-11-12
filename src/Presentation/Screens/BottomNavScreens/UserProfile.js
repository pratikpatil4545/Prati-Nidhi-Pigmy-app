import { View, Text, StyleSheet, Image, StatusBar, Pressable, ScrollView, Modal, BackHandler, Linking, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, TextInput } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';

export default function UserProfile({ route, navigation }) {

  const { index } = route.params;
  const [item, setItem] = useState(route.params.item);
  const [mobileInputVisible, setmobileInputVisible] = useState(false);
  const [mobileNumber, setmobileNumber] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [amount, setAmount] = useState(null);
  const [isTodayCollected, setisTodayCollected] = useState(true);
  const [updatedBalances, setupdatedBalance] = useState(null);
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
  const [isFocusedInput, setIsFocusedInput] = useState(false);
  const [hasCleared, setHasCleared] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // console.log("routes", item)

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

  // useEffect(() => {
  //   let currentBalance = parseFloat(item.ThisMthBal) || 0;
  //   let amountValue = parseFloat(amount) || 0;

  //   if (item.IsAmtToBeAdded === 'False' && currentBalance < amountValue) {
  //     // console.log("old amount vs  xxnew amount  ss", currentBalance, amountValue)
  //     let temp = parseFloat(amountValue) - parseFloat(currentBalance);
  //     // console.log("minus value", temp)
  //     setAmount(temp.toString());
  //   }
  //   else if (item.IsAmtToBeAdded === 'False' && updatedBalances === 0) {
  //     setAmount(null);
  //     setCollectionMadeToday(true);
  //   }
  //   else {
  //     setAmount(item.DailyAmt);
  //   }
  // }, [item, modalVisible])

  useEffect(() => {
    // setLoading(true);
    const filteredTransactions = transactionTableData?.filter((transaction) =>
      transaction.AccountNo === item.AccountNo && transaction.GLCode === item.GLCode
    );
    // let temp = filteredTransactions[0];
    if (filteredTransactions && filteredTransactions.length > 0) {
      const latestTransaction = filteredTransactions[filteredTransactions.length - 1];
      // console.log("updated balance", latestTransaction)

      setupdatedBalance(latestTransaction?.OpeningBal);
      setLoading(false);

    } else {
      setLoading(false);

      setupdatedBalance(null);
    }
    // setupdatedBalance(filteredTransactions[0]?.openingBalance ? filteredTransactions[0]?.openingBalance : null);
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
    const savedData = await AsyncStorage.getItem('dataObject');
    const dataObject = JSON.parse(savedData);

    // Define the message and phone number
    const getNumber = mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1);
    const phoneNumber = `+91${getNumber}`; // Replace with the actual phone number (with country code)
    const message = `Hi, the amount has been successfully collected. Here is your receipt:

Name: *${item.EnglishName}*
Account No.: *${item.AccountNo}*
Opening Balance: *${(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00*
Amount Collected: *${amount}.00*
Closing Balance: *${newBalance ? newBalance : 0}.00*
Agent Name: *${dataObject.MstrData?.AgNameE}*
Collected date and time: ${formatDateTime(new Date())}`;


    // Create the WhatsApp URL with the correct format
    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;

    Linking.openURL(url);

  };

  const handleSmsPress = async () => {
    const savedData = await AsyncStorage.getItem('dataObject');
    const dataObject = JSON.parse(savedData);

    const getNumber = mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1);
    const phoneNumber = `+91${getNumber}`;
    const message = `Hi, the amount has been successfully collected. Here is your receipt:
  
  Name: ${item.EnglishName}
  Account No.: ${item.AccountNo}
  Opening Balance: ${(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00
  Amount Collected: ${amount}.00
  Closing Balance: ${newBalance ? newBalance : 0}.00
  Agent Name: ${dataObject.MstrData?.AgNameE}
  Collected date and time: ${formatDateTime(new Date())}`;

    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(smsUrl);
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

  // console.log("Current day is:", route.params.collectionAllowed)

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

  const formatDateTime1 = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const comfirmCheck = () => {
    const message = `
    Name: ${item.EnglishName}
Account Number: ${item.AccountNo}
Opeing Balance: ${(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00
Amount Collected: ${amount}.00
Total Account Balance: ${newBalance ? newBalance : 0}.00
  `;


    Alert.alert(
      'Please Confirm Collection',
      message.trim(),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => { setModalVisible2(true) } }
      ]
    );

    // Alert.alert(
    //   'Please Confirm Collection',
    //   message.trim()
    // );
  }

  // const handleSubmit = async () => {
  //   setButtonLoading(true);
  //   let OneShotLmt = parseInt(item.OneShotLmt);
  //   let maxBalance = parseInt(item.MaxBalance);
  //   let currentBalance = parseFloat(item.ThisMthBal) || 0;
  //   let amountValue = parseFloat(amount) || 0;
  //   let updatedBalance = currentBalance + amountValue;
  //   let dailyAmount = parseInt(item.DailyAmt);
  //   let maxInstalled = parseInt(item.MaxInstal);

  //   if (!mobileNumber) {
  //     Alert.alert('Warning', `Plese enter customer's Mobile Number`);
  //     setButtonLoading(false);
  //     return;
  //   }
  //   console.log(mobileNumber.length)
  //   if (mobileNumber.length !== 10 || /\D/.test(mobileNumber)) {
  //     Alert.alert('Warning', `Please enter a valid 10-digit mobile number`);
  //     setButtonLoading(false);
  //     return;
  //   }

  //   if (OneShotLmt != 0) {
  //     if (amountValue >= OneShotLmt) {
  //       Alert.alert('Warning', 'Amount inputed is greater than one shot limit, please re-input amount less than one shot limit.');
  //       setButtonLoading(false);
  //       return;
  //     }
  //   }

  //   if (maxBalance != 0) {
  //     if (updatedBalance >= maxBalance) {
  //       Alert.alert('Warning', 'Amount inputed is greater than maximum balance, please re-input amount less than maximum balance.');
  //       setButtonLoading(false);
  //       return;
  //     }
  //   }

  //   if (maxInstalled != 0 && dailyAmount != 0) {
  //     if (amountValue != dailyAmount) {
  //       Alert.alert('Warning', 'Amount inputed is not equal to daily amount, please re-input amount which is equal to daily amount.');
  //       setButtonLoading(false);
  //       return;
  //     }
  //   }

  //   if (maxInstalled != 0 && dailyAmount != 0) {
  //     if (amountValue % dailyAmount === 0 && amountValue <= maxInstalled) {
  //       console.log('Valid amount entered');
  //     } else {
  //       if (amountValue % dailyAmount !== 0) {
  //         Alert.alert('Warning', `Please enter an amount that is a multiple of ${dailyAmount}.`);
  //         setButtonLoading(false);
  //         return;
  //       } else if (amountValue > maxInstalled) {
  //         Alert.alert('Amount Exceeds Maximum', `The entered amount exceeds the maximum allowed: ${maxInstalled}.`);
  //         setButtonLoading(false);
  //         return;
  //       }
  //     }
  //   }

  //   if (updatedBalance === 0 && item.IsAmtToBeAdded === 'False') {
  //     Alert.alert('Warning', `Opening balance for this lien account is '0' so cannot take any further collection.`);
  //     setModalVisible(false);
  //     setButtonLoading(false);
  //     return;
  //   }

  //   if (amountValue <= 0) {
  //     Alert.alert('Warning', 'Please enter amount.');
  //     setButtonLoading(false);
  //     return;
  //   }

  //   const receiptNo = generateReceiptNo();

  //   try {
  //     let transactionTable = await AsyncStorage.getItem('transactionTable');
  //     transactionTable = transactionTable ? JSON.parse(transactionTable) : [];

  //     const filteredTransactions = transactionTable.filter(
  //       (entry) => entry.AccountNo === item.AccountNo && entry.GLCode === item.GLCode
  //     );

  //     filteredTransactions.sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime));

  //     let openingBalance = 0;
  //     if (filteredTransactions.length > 0) {
  //       const latestTransaction = filteredTransactions[0];
  //       console.log("Opening balance from latest transaction:", latestTransaction);
  //       openingBalance = parseFloat(latestTransaction.OpeningBal);

  //       if (isNaN(openingBalance)) {
  //         openingBalance = 0;
  //       }

  //       if (item.IsAmtToBeAdded === 'True') {
  //         openingBalance += amountValue;
  //       } else if (openingBalance >= amountValue) {
  //         openingBalance -= amountValue;
  //       } else {
  //         Alert.alert('Error', 'Insufficient balance.');
  //         setButtonLoading(false);
  //         return;
  //       }
  //     } else {
  //       openingBalance = updatedBalance;
  //     }

  //     // console.log("opeing balanc below", openingBalance)

  //     setNewBalance(openingBalance);
  //     let agentsPhn = await AsyncStorage.getItem('mobileNumber');

  //     let transactionData = {
  //       // receiptNo: receiptNo,
  //       GLCode: item.GLCode,
  //       AccountNo: item.AccountNo,
  //       EnglishName: item.EnglishName,
  //       OpeningBal: openingBalance.toString(),
  //       Collection: amountValue?.toString(),
  //       ClosingBal: openingBalance?.toString(),
  //       CollDateTime: formatDateTime1(new Date()),
  //       IsitNew: 'false',
  //       IsAmtAdd: item.IsAmtToBeAdded === 'True' ? "1" : "0",
  //       // MobileNo: '1234567890'
  //       MobileNo: mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1)
  //     };

  //     transactionTable.push(transactionData);
  //     // await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionData));

  //     const newArray = {
  //       ClientID: ClientID,
  //       BrCode: BrCode,
  //       AgCode: AgCode,
  //       BrAgCode: BrAgCode,
  //       FileCreateDate: FileCreateDate,
  //       InputFileType: InputFileType,
  //       NoOfRecords: '1',
  //       CollectionData: [
  //         transactionData
  //       ]
  //     };
  //     console.log(" new array", newArray)

  //     const agentmobileNumber = await AsyncStorage.getItem('mobileNumber');

  //     if (agentmobileNumber) {
  //       const newArrayString = JSON.stringify(newArray);

  //       const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp`;

  //       try {
  //         const response = await fetch(url, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/x-www-form-urlencoded',
  //           },
  //           body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
  //         });

  //         const responseData = await response.text();
  //         console.log("Response:", responseData);
  //       } catch (error) {
  //         setButtonLoading(false);
  //         console.error("Error during API call:", error);
  //       }
  //     }
  //     await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));
  //     setCollectionMadeToday(true);
  //     setModalVisible2(true);
  //     setButtonLoading(false);
  //     // route.params.setRefreshData(true);
  //     navigation.navigate('DashboardStack', { refreshData: true });

  //   } catch (error) {
  //     console.error("Error while processing transaction:", error);
  //     setButtonLoading(false);
  //     Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
  //   } finally {
  //     setButtonLoading(false);
  //   }
  // };


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




    const fetchTransactionData = async () => {
      try {
        let transactionTable = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];
        const filteredTransactions = transactionTable.filter(
          (entry) => entry.AccountNo === AccountNo && entry.GLCode === GLCode
        ).sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime));

        // let totalSum;

        // calculateCollectionSum(AccountNo).then((totalCollectionSum) => {
        //   console.log("Total Collection Sum:", totalCollectionSum);
        //   const totalSum = totalCollectionSum > 0 ? totalCollectionSum : parseInt(amount);
        //   console.log("Final Total Sum:", totalSum);
        // });

        let totalSum = parseFloat(amount);
        const totalCollectionSum = await calculateCollectionSum(AccountNo);
        totalSum = totalSum + totalCollectionSum;
        // console.log("Total Collection Sum:", totalCollectionSum);
        // console.log("Final Total Sum:", totalSum);

        const latestTransaction = filteredTransactions[0];
        // let openingBalance = parseFloat(latestTransaction?.OpeningBal || ThisMthBal || 0);
        let openingBalance = parseFloat(ThisMthBal || 0);
        let closingBalance;
        // console.log("amount to be added checking old values", latestTransaction, closingBalance);
        if (IsAmtToBeAdded === 'True') {
          openingBalance += parseFloat(totalSum);
          closingBalance = openingBalance + parseFloat(amount);
          // console.log("amount to be added true", openingBalance, closingBalance);
        } else if (openingBalance >= parseFloat(amount)) {
          openingBalance -= parseFloat(totalSum);
          closingBalance = openingBalance - parseFloat(amount);
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

    const submitData = async (transactionData, newArrayString) => {
      try {
        const response = await fetch(`http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
        });
        // console.log("Response:", await response.text());
      } catch (error) {
        console.error("Error during API call:", error);
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
Opeing Balance: ${(updatedBalances || updatedBalances === 0) ? updatedBalances : ThisMthBal}.00
Amount Collected: ${amount}.00
Total Account Balance: ${openingBalance ? openingBalance : 0}.00
  `;

    Alert.alert(
      'Please Confirm Collection',
      message.trim(),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            setNewBalance(openingBalance);
            await AsyncStorage.setItem('transactionTable', JSON.stringify([...transactionTable, transactionData]));
            setCollectionMadeToday(true);
            setModalVisible2(true);
            await submitData(transactionData, JSON.stringify(newArray));
          }
        }
      ]
    );

    // await AsyncStorage.setItem('transactionTable', JSON.stringify([...transactionTable, transactionData]));
    // setCollectionMadeToday(true);
    // setModalVisible2(true);
    // await submitData(transactionData, JSON.stringify(newArray));
    // navigation.navigate('DashboardStack', { refreshData: true });

    setButtonLoading(false);
  };




  // const confirmCheck = async () => {
  //   let OneShotLmt = parseInt(item.OneShotLmt);
  //   let maxBalance = parseInt(item.MaxBalance);
  //   let currentBalance = parseFloat(item.ThisMthBal) || 0;
  //   let amountValue = parseFloat(amount) || 0;
  //   let updatedBalance = currentBalance + amountValue;
  //   let dailyAmount = parseInt(item.DailyAmt);
  //   let maxInstalled = parseInt(item.MaxInstal);

  //   if (!mobileNumber) {
  //     Alert.alert('Warning', `Please enter the customer's mobile number`);
  //     return;
  //   }
  //   if (mobileNumber.length !== 10 || /\D/.test(mobileNumber)) {
  //     Alert.alert('Warning', `Please enter a valid 10-digit mobile number`);
  //     return;
  //   }

  //   if (OneShotLmt !== 0 && amountValue >= OneShotLmt) {
  //     Alert.alert('Warning', 'Amount entered exceeds the one-shot limit. Please re-enter.');
  //     return;
  //   }

  //   if (maxBalance !== 0 && updatedBalance >= maxBalance) {
  //     Alert.alert('Warning', 'Amount entered exceeds the maximum balance. Please re-enter.');
  //     return;
  //   }

  //   if (maxInstalled !== 0 && dailyAmount !== 0) {
  //     if (amountValue !== dailyAmount) {
  //       Alert.alert('Warning', 'Amount entered does not match the daily amount. Please re-enter.');
  //       return;
  //     }
  //     if (amountValue % dailyAmount !== 0 || amountValue > maxInstalled) {
  //       Alert.alert('Warning', `Please enter an amount that is a multiple of ${dailyAmount} and does not exceed ${maxInstalled}.`);
  //       return;
  //     }
  //   }

  //   if (updatedBalance === 0 && item.IsAmtToBeAdded === 'False') {
  //     Alert.alert('Warning', 'Opening balance for this account is 0. No further collection allowed.');
  //     setModalVisible(false);
  //     return;
  //   }

  //   const message = `
  //     Name: ${item.EnglishName}
  //     Account Number: ${item.AccountNo}
  //     Old Account Balance: ${(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00
  //     Amount Collected: ${amount}.00
  //     Total Account Balance: ${newBalance ? newBalance : 0}.00
  //   `;

  //   Alert.alert(
  //     'Please Confirm Collection',
  //     message.trim(),
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Confirm', onPress: handleSubmit }
  //     ]
  //   );
  // };



  // const handleSubmit = async () => {
  //   const receiptNo = generateReceiptNo();
  //   try {
  //     let transactionTable = await AsyncStorage.getItem('transactionTable');
  //     transactionTable = transactionTable ? JSON.parse(transactionTable) : [];

  //     const transactionData = {
  //       GLCode: item.GLCode,
  //       AccountNo: item.AccountNo,
  //       EnglishName: item.EnglishName,
  //       OpeningBal: updatedBalance.toString(),
  //       Collection: amountValue.toString(),
  //       ClosingBal: updatedBalance.toString(),
  //       CollDateTime: formatDateTime1(new Date()),
  //       IsitNew: 'false',
  //       IsAmtAdd: item.IsAmtToBeAdded === 'True' ? "1" : "0",
  //       MobileNo: mobileInputVisible ? mobileNumber : parseInt(route.params.item.Mobile1)
  //     };

  //     const newArray = {
  //       ClientID: ClientID,
  //       BrCode: BrCode,
  //       AgCode: AgCode,
  //       BrAgCode: BrAgCode,
  //       FileCreateDate: FileCreateDate,
  //       InputFileType: InputFileType,
  //       NoOfRecords: '1',
  //       CollectionData: [transactionData]
  //     };

  //     const agentmobileNumber = await AsyncStorage.getItem('mobileNumber');
  //     if (agentmobileNumber) {
  //       const newArrayString = JSON.stringify(newArray);
  //       const url = `http://app.automatesystemsdataservice.in/Internal/PigmyServices.asmx/GetData_FromApp`;

  //       const response = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //         body: new URLSearchParams({ DataFromApp: newArrayString }).toString(),
  //       });

  //       const responseData = await response.text();
  //       console.log("Response:", responseData);
  //     }

  //     transactionTable.push(transactionData);
  //     await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));
  //     setCollectionMadeToday(true);
  //     setModalVisible2(true);
  //     route.params.setRefreshData(true);
  //   } catch (error) {
  //     console.error("Error while processing transaction:", error);
  //     Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
  //   }
  // };



  // const handleSubmit = async () => {
  //   let OneShotLmt = parseInt(item.OneShotLmt);
  //   let maxBalance = parseInt(item.MaxBalance);
  //   let currentBalance = parseFloat(item.ThisMthBal) || 0;
  //   let amountValue = parseFloat(amount) || 0;
  //   let updatedBalance = currentBalance + amountValue;
  //   let dailyAmount = parseInt(item.DailyAmt);
  //   let maxInstalled = parseInt(item.MaxInstal);

  //   if (OneShotLmt != 0) {
  //     if (amountValue >= OneShotLmt) {
  //       Alert.alert('Warning', 'Amount inputed is greater than one shot limit, please re-input amount less than one shot limit.');
  //       return;
  //     }
  //   }

  //   if (maxBalance != 0) {
  //     if (updatedBalance >= maxBalance) {
  //       Alert.alert('Warning', 'Amount inputed is greater than maximum balance, please re-input amount less than maximum balance.');
  //       return;
  //     }
  //   }

  //   if (maxInstalled != 0 && dailyAmount != 0) {
  //     if (amountValue != dailyAmount) {
  //       Alert.alert('Warning', 'Amount inputed is not equal to daily amount, please re-input amount which is equal to daily amount.');
  //       return;
  //     }
  //   }

  //   if (maxInstalled != 0 && dailyAmount != 0) {
  //     if (amountValue % dailyAmount === 0 && amountValue <= maxInstalled) {
  //       console.log('Valid amount entered');
  //     } else {
  //       if (amountValue % dailyAmount !== 0) {
  //         Alert.alert('Warning', `Please enter an amount that is a multiple of ${dailyAmount}.`);
  //         return;
  //       } else if (amountValue > maxInstalled) {
  //         Alert.alert('Amount Exceeds Maximum', `The entered amount exceeds the maximum allowed: ${maxInstalled}.`);
  //         return;
  //       }
  //     }
  //   }

  //   if (updatedBalances === 0 && item.IsAmtToBeAdded === 'False') {
  //     Alert.alert('Warning', `Opening balance for this lien account is '0' so cannnot take any further collection.`);
  //     setModalVisible(false);
  //     return;
  //   }

  //   const receiptNo = generateReceiptNo();

  //   try {
  //     let openingBalance;

  //     if (item.IsAmtToBeAdded === 'True') {
  //       openingBalance = updatedBalance;
  //       setNewBalance(updatedBalance);
  //       console.log("clg2")
  //     }

  //     else if (currentBalance >= amountValue) {
  //       console.log("clg 2")
  //       let newBalance = parseInt(currentBalance) - parseInt(amountValue);
  //       openingBalance = newBalance;
  //       setNewBalance(newBalance);
  //     }
  //     else {
  //       openingBalance = updatedBalance;
  //       setNewBalance(updatedBalance);
  //     }

  //     console.log("Opening balance is", openingBalance)

  //     // Also Add basic details array and join this new below that.
  //     // "ClientID": "21",
  //     // "BrCode": "2",
  //     // "AgCode": "11",
  //     // "BrAgCode": "0",
  //     // "FileCreateDate": "2024-10-25",
  //     // "InputFileType": "2",
  //     // "NoOfRecords": "03",
  //     // "CollectionData": [

  //     let transactionData = {
  //       receiptNo: receiptNo,
  //       glCode: item.GLCode,
  //       accNo: item.AccountNo,
  //       openingBalance: parseInt(openingBalance),
  //       collectionAmount: amountValue,
  //       dateTimeCollected: formatDateTime(new Date()),

  //       mblNo: await AsyncStorage.getItem('mobileNumber'), 
  //       // mobile number if present else add
  //       // EnglishName: 'Name in english',
  //       // closingBalance: 'closing balance',
  //       // IsAmtToBeAdded: '0 or 1',
  //       // isItNew: 'true or false'
  //     };

  //     let transactionTable = await AsyncStorage.getItem('transactionTable');
  //     transactionTable = transactionTable ? JSON.parse(transactionTable) : [];

  //     transactionTable.push(transactionData);

  //     await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));
  //     setCollectionMadeToday(true);
  //     setModalVisible2(true);
  //   } catch (error) {
  //     console.error("Error while processing transaction:", error);
  //     Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
  //   }
  // }

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

  const handleNext = () => {
    setModalVisible(false);
    setModalVisible2(false);
    // console.log("navigatibng")
    navigation.navigate('DashboardStack', { search: true })
  }

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
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00</Text>

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
              <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.LienAmt}.00</Text>
            }

            <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>A/C Opened date. : </Text>
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold', marginHorizontal: 25 }]}>{item.AccOpenDt}</Text>
          </View>
        )}

        {/* <View style={styles.right}>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{(item.GLCode != 0) ? item.GLCode : ''}{item.AccountNo}</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.EnglishName}</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{route.params.BranchName} ({route.params.BranchCode})</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{updatedBalance ? updatedBalance : item.ThisMthBal}.00</Text>
          {parseInt(item.LastMthBal) != 0 &&
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.LastMthBal}.00</Text>
          }
          {parseInt(item.LienAmt) != 0 &&
            <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.LienAmt}.00</Text>
          }
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.AccOpenDt}</Text>
        </View> */}

      </View>

      {/* {mobileInputVisible &&
        <View>
          <Text style={{color: COLORS.primary, alignSelf: 'flex-end', textDecorationLine: 'underline'}}>Enter mobile</Text>
        </View>
      } */}

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
            <Text style={{ color: COLORS.white, marginRight: 0 }}>Add Collection</Text>
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
                <Text style={styles.text1}>Name : </Text>
                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{item.EnglishName}</Text>
                <Text style={styles.text1}>Account Number : </Text>
                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{item.AccountNo}</Text>
                <Text style={styles.text1}>Old Account Balance : </Text>
                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{(updatedBalances || updatedBalances === 0) ? updatedBalances : item.ThisMthBal}.00</Text>
                <Text style={styles.text1}>Amount Collected : </Text>
                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{amount}.00</Text>
                <Text style={styles.text1}>Total Account Balance : </Text>
                <Text style={[styles.text1, { marginHorizontal: 25 }]}>{newBalance ? newBalance : 0}.00</Text>
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
              <Pressable onPress={handleSubmit2} style={styles.noReceipt}>
                <Text style={styles.buttonLabel}>No Receipt</Text>
              </Pressable>
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
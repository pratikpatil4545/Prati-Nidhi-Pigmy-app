import { View, Text, StyleSheet, Image, StatusBar, Pressable, ScrollView, Modal, BackHandler, Linking, Alert } from 'react-native'
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [amount, setAmount] = useState(item.DailyAmt);
  const [isTodayCollected, setisTodayCollected] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(item[9]);
  const [newBalance, setNewBalance] = useState(null);
  const isFocused = useIsFocused();

  const handleWhatsAppPress = () => {
    // Define the message and phone number
    const phoneNumber = '+917887760491'; // Replace with the actual phone number (with country code)
    const message = 'Hi, I would like to get in touch with you!';

    // Create the WhatsApp URL with the correct format
    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;

    Linking.openURL(url);

    // Check if WhatsApp is installed
    // Linking.canOpenURL(url).then((supported) => {
    //   if (supported) {
    //     // Open WhatsApp with the predefined message
    //     Linking.openURL(url);
    //   } else {
    //     // WhatsApp is not installed or not recognized
    //     Alert.alert('WhatsApp not installed', 'Please install WhatsApp to send a message.');
    //   }
    // }).catch((err) => {
    //   console.error('Error occurred while checking WhatsApp installation:', err);
    // });
  };

  const checkAsyncStorageForData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('customerData');
      if (storedData !== null) {
        let data = JSON.parse(storedData); // Ensure JSON parsing
        console.log("data for refresh", data[index])
        setItem(data[index]);
        data.forEach(transaction => {
          // console.log("9th index value:", transaction[9]);
          setCurrentBalance(transaction.M_Field5);
        });
      }
    } catch (e) {
      console.error('Failed to fetch data from AsyncStorage', e);
    }
  };

  useEffect(() => {
    checkAsyncStorageForData();
  }, [isFocused]);

  console.log("Current day is:", route.params.item)

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleCancel2 = () => {
    setModalVisible2(false);
  };

  let transactionCount = 1; // This should be initialized based on previous transaction count stored

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

  const handleSubmit = async () => {
    let OneShotLmt = parseInt(item.OneShotLmt);
    let maxBalance = parseInt(item.MaxBalance);
    let currentBalance = parseFloat(item.ThisMthBal) || 0;
    let amountValue = parseFloat(amount) || 0;
    let updatedBalance = currentBalance + amountValue;
    let dailyAmount = parseInt(item.DailyAmt);
    let maxInstalled = parseInt(item.MaxInstal);

    if (OneShotLmt != 0) {
      if (amountValue >= OneShotLmt) {
        Alert.alert('Warning', 'Amount inputed is greater than one shot limit, please re-input amount less than one shot limit.');
        return;
      }
    }

    if (maxBalance != 0) {
      if (updatedBalance >= maxBalance) {
        Alert.alert('Warning', 'Amount inputed is greater than maximum balance, please re-input amount less than maximum balance.');
        return;
      }
    }

    if (maxInstalled != 0 && dailyAmount != 0) {
      if (amountValue != dailyAmount) {
        Alert.alert('Warning', 'Amount inputed is not equal to daily amount, please re-input amount which is equal to daily amount.');
        return;
      }
    }

    if (maxInstalled != 0 && dailyAmount != 0) {
      if (amountValue % dailyAmount === 0 && amountValue <= maxInstalled) {
        console.log('Valid amount entered');
      } else {
        if (amountValue % dailyAmount !== 0) {
          Alert.alert('Warning', `Please enter an amount that is a multiple of ${dailyAmount}.`);
          return;
        } else if (amountValue > maxInstalled) {
          Alert.alert('Amount Exceeds Maximum', `The entered amount exceeds the maximum allowed: ${maxInstalled}.`);
          return;
        }
      }
    }

    const receiptNo = generateReceiptNo();

    try {
      let openingBalance;

      // if (item.IsAmtToBeAdded === 'True') {
      //   openingBalance = updatedBalance;
      //   setNewBalance(updatedBalance);
      // } else if (currentBalance >= amountValue) {
      //   const newBalance = currentBalance - amountValue;
      //   openingBalance = newBalance;
      //   setNewBalance(newBalance);
      // } else {
      //   console.log('Insufficient balance', 'Your current balance is insufficient for this transaction.');
      //   return;
      // }

      if (item.IsAmtToBeAdded === 'True') {
        openingBalance = updatedBalance;
        setNewBalance(updatedBalance);
      }
      else if (currentBalance >= amountValue) {
        let newBalance = parseInt(currentBalance) - parseInt(amountValue);
        openingBalance = newBalance;
        setNewBalance(newBalance);
      }
      else {
        openingBalance = updatedBalance;
        setNewBalance(updatedBalance);
      }

      let transactionData = {
        receiptNo: receiptNo,
        glCode: item.GLCode,
        accNo: item.AccountNo,
        openingBalance: openingBalance,
        collectionAmount: amountValue,
        dateTimeCollected: formatDateTime(new Date()),
        mblNo: await AsyncStorage.getItem('mobileNumber')
      };

      let transactionTable = await AsyncStorage.getItem('transactionTable');
      transactionTable = transactionTable ? JSON.parse(transactionTable) : [];

      transactionTable.push(transactionData);

      await AsyncStorage.setItem('transactionTable', JSON.stringify(transactionTable));

      setModalVisible2(true);
    } catch (error) {
      console.error("Error while processing transaction:", error);
      Alert.alert('Error', 'An error occurred while processing your transaction. Please try again.');
    }
  }

  const handleSubmit2 = () => {
    setModalVisible(false);
    setModalVisible2(false);
    checkAsyncStorageForData();
    setisTodayCollected(false);
  }

  useEffect(() => {

    const handleBackPress = () => {
      navigation.navigate('Dashboard')
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
          <Text style={styles.text} >{item[8] ? item[8] : ''}</Text>
          {/* <Text style={[styles.text, {fontFamily: 'Montserrat-Regular', fontSize: 14}]} >A/C No. : {item[0] ? item[0] : ''}</Text> */}
          <Text style={[styles.text, { fontFamily: 'Montserrat-Regular', fontSize: 14 }]} >Address : Aundh, Pune</Text>
        </View>
        <View style={styles.profileIcon}>
          <Image style={{ width: 70, height: 70, resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
        </View>
      </View>

      <View style={styles.dataInfoView}>
        <View style={styles.left}>
          <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Account Number : </Text>
          <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Branch Code : </Text>
          <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>Current Balance : </Text>
          <Text style={[styles.text1, { color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }]}>A/C Opened date. : </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.AccountNo}</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>1</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.ThisMthBal}.00</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item.AccOpenDt}</Text>
        </View>
      </View>

      <>
        {/* <View style={styles.history}>
        <View style={{ width: '100%', display: 'flex', flexDirection: 'row', }}>
          <Text style={[styles.text, { fontSize: 16, width: '50%', marginLeft: 15 }]}>Date :</Text>
          <Text style={[styles.text, { fontSize: 16, width: '50%', marginLeft: 1 }]}>Collections :</Text>
        </View>

        <ScrollView >
          <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
            <View style={styles.left}>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Sunday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Monday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Tuesday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Wednesday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Thursday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Friday</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>Saturday</Text>
            </View>
            <View style={styles.right}>
               <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[1], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[2], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[3], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[4], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[5], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[6], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[7], 10).toString()}.00</Text>
            </View>
          </View>
        </ScrollView>
      </View> */}
      </>

      <View style={{ width: '95%', alignSelf: 'center' }}>
        {(route.params.collectionAllowed === 'true' || Boolean(route.params.collectionAllowed)) ? (
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
            {!route.params.collectionAllowed ? (
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
            <TextInput
              label="Enter amount"
              mode='outlined'
              outlineColor='#8ABCF9'
              autoFocus={true}
              // ref={textInputRef} 
              value={amount}
              keyboardType='numeric'
              onChangeText={text => setAmount(text)}
              style={{ width: "100%", marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white }}
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
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, {}]}>
            <MaterialCommunityIcons2 name='cloud-done' color={COLORS.primary} size={100} />
            {/* <Image source={require('../../Assets/Images/successAnimation.gif')}/> */}
            <View style={[styles.dataInfoView, { width: '100%' }]}>
              <View style={styles.left}>
                <Text style={styles.text1}>Name : </Text>
                <Text style={styles.text1}>Account Number : </Text>
                <Text style={styles.text1}>Old Account Balance : </Text>
                <Text style={styles.text1}>Amount Collected : </Text>
                <Text style={styles.text1}>Total Account Balance : </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.text1}>{item.EnglishName}</Text>
                <Text style={styles.text1}>{item.AccountNo}</Text>
                <Text style={styles.text1}>{parseInt(item.ThisMthBal, 10).toString()}.00</Text>
                <Text style={styles.text1}>{amount}.00</Text>
                <Text style={styles.text1}>{newBalance ? newBalance : 0}.00</Text>
              </View>
            </View>

            <View style={[styles.buttonContainer, { marginTop: 50 }]}>
              <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit2} >Close</Button>
              <Button icon={'printer'} style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleSubmit2} >Print</Button>
            </View>
            {/* <Button icon={'whatsapp'} style={{ width: '48%', marginTop: 25, borderColor: 'transparent' }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleSubmit2} ></Button> */}
            <MaterialCommunityIcons onPress={handleWhatsAppPress} style={{ marginTop: 20, backgroundColor: '#25D366', borderRadius: 15, padding: 5 }} name='whatsapp' color={COLORS.white} size={35} />

          </View>
        </View>
      </Modal>
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
    marginVertical: 5,
    color: COLORS.gray
  },
  dataInfoView: {
    width: windowWidth * 0.85,
    // height: 120,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-around',
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
    width: windowWidth * 0.9,
    // height: windowHeight * 0.5,
    display: 'flex',
    padding: 30,
    paddingBottom: 50,
    paddingTop: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    // marginLeft: 10,
    alignSelf: 'flex-start',
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF'
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',

  },
})
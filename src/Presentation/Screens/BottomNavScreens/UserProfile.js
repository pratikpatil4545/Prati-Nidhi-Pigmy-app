import { View, Text, StyleSheet, Image, StatusBar, Pressable, ScrollView, Modal, BackHandler } from 'react-native'
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
  const [amount, setAmount] = useState(null);
  const [isTodayCollected, setisTodayCollected] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(item[9]);
  const [newBalance, setNewBalance] = useState(null);
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const isFocused = useIsFocused();
  const date = new Date();
  let day = weekday[date.getDay()];

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

  // console.log("Current day is:", day)
  // console.log(" routes darta", item, 'index : ', index);

  const getDay = () => {
    const dayMapping = {
      "Sunday": 1,
      "Monday": 2,
      "Tuesday": 3,
      "Wednesday": 4,
      "Thursday": 5,
      "Friday": 6,
      "Saturday": 7
    };

    return dayMapping[day];
  };

  useEffect(() => {
    let dayIndex = getDay();
    if (item[dayIndex]?.toString() === '000000') {
      setisTodayCollected(true);
    }
  }, [isFocused])

  // console.log("Mapped value for the current day is:", getDay());

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleCancel2 = () => {
    setModalVisible2(false);
  };

  const handleSubmit = async () => {
    let newItemData = [...item];
    const dayIndex = getDay();
    newItemData[dayIndex] = amount;
    // console.log("Updated item data:", newItemData);

    let currentBalance = parseFloat(newItemData[9]) || 0;
    let amountValue = parseFloat(amount) || 0;
    let updatedBalance = currentBalance + amountValue;

    setNewBalance(updatedBalance);

    newItemData[9] = updatedBalance.toString();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Format as dd/mm/yy hh:mm
    const dateTime = `${day}/${month}/${year} ${hours}:${minutes}`;

    // const now = new Date();
    //   const dateTime = now.toLocaleString(); 
    newItemData[11] = dateTime;

    // newItemData = newItemData.map(item => {
    //   return [...item, dateTime];
    // });
    // console.log("new data with dates",newItemData);
    const storedData = await AsyncStorage.getItem('customerData');
    let data = JSON.parse(storedData) || [];

    data[index] = newItemData;

    await AsyncStorage.setItem('customerData', JSON.stringify(data));
    setModalVisible2(true);
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
      {/* <Pressable onPress={() => navigation.goBack()} style={{ position: 'absolute', zIndex: 454 }}>
        <MaterialCommunityIcons name='keyboard-backspace' color={COLORS.primary} size={45} />
      </Pressable> */}



      <View style={styles.profileView}>
      <MaterialCommunityIcons4 onPress={() => { navigation.navigate("DashboardStack") }} style={{zIndex: 454}} name='angle-left' color={COLORS.primaryAccent} size={40} />
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
          {/* <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item[0]}</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item[1]}</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{parseInt(item[9], 10).toString()}.00</Text>
          <Text style={[styles.text1, { fontFamily: 'Montserrat-SemiBold' }]}>{item[10] ? item[10] : ''}</Text> */}
        </View>
      </View>

      <View style={styles.history}>
        {/* <Text style={[styles.text, { marginStart: 10, fontSize: 18 }]}>History :</Text> */}
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
              {/* <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[1], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[2], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[3], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[4], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[5], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[6], 10).toString()}.00</Text>
              <Text style={[styles.text1, { marginVertical: 10 }]}>{parseInt(item[7], 10).toString()}.00</Text> */}
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={{ width: '95%', alignSelf: 'center' }}>
        {isTodayCollected ? (
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
            <Text style={[styles.text1, { alignSelf: 'center', fontFamily: 'Montserrat-Bold' }]}>Today's collection is received.</Text>
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
                <Text style={styles.text1}>{item[8]}</Text>
                <Text style={styles.text1}>{item[0]}</Text>
                <Text style={styles.text1}>{parseInt(item[9], 10).toString()}.00</Text>
                <Text style={styles.text1}>{amount}.00</Text>
                <Text style={styles.text1}>{newBalance ? newBalance : 0}.00</Text>
              </View>
            </View>

            <View style={[styles.buttonContainer, { marginTop: 50 }]}>
              <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit2} >Okay</Button>
              <Button icon={'printer'} style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleSubmit2} >Print</Button>
            </View>
            <Button icon={'share-variant'} style={{ width: '48%', marginTop: 25, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleSubmit2} >Share</Button>

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
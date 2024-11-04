import { View, Text, StyleSheet, Image, StatusBar, Pressable, BackHandler, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';


export default function Profile({ navigation, route }) {

  const isFocused = useIsFocused();
  const [transactionTable, setTransactionTable] = useState([]);
  console.log("routes", route.params, transactionTable.length)
  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate('BottomTabs');
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);

  const handleLogout = () => {
    navigation.navigate('LogIn');
    AsyncStorage.clear();
  }

  useEffect(() => {
    const fetchTransactionTable = async () => {
      try {
        const transactionTableData = await AsyncStorage.getItem('transactionTable');
        if (transactionTableData) {
          const parsedData = JSON.parse(transactionTableData);  // Parse the stored data
          setTransactionTable(parsedData);
        }
        // console.log("transaction data", transactionTableData.length)
      } catch (error) {
        console.error('Error fetching transaction table from AsyncStorage:', error);
      }
    };

    fetchTransactionTable();
  }, [isFocused]);

  const handleCloseCollection = () => {
    // let validDay = route.params?.collectionAllowed;
    // console.log("first", validDay) 
    if(route.params?.collectionAllowed === true) {
      Alert.alert('Closing collection', `You have collected ${transactionTable.length} reciepts out of ${route.params.count}. and total collected amount is Rs ${route.params.amount}.00/-`)
    }
    else if(route.params?.collectionAllowed == false){
      Alert.alert('Cannot Close collection!', `Collection is not allowed, allowed day's are expired`)
    }
  }

  return (
    <View style={styles.mainView}>
      <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />
      <View style={styles.profileView}>
        <View style={styles.curveView} >
          <MaterialCommunityIcons4 onPress={() => { navigation.navigate("BottomTabs") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
        </View>
        {/* <Text style={{ position: 'absolute', zIndex: 5, top: windowHeight * 0.04, color: COLORS.white, fontFamily: 'Montserrat-Bold', fontSize: 22 }}>Profile</Text> */}
        <View style={styles.profileIcon}>
          <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
        </View>
      </View>

      <ScrollView style={{ maxHeight: windowHeight * 0.6, }}>
        <View style={styles.profileSetting}>
          <View style={styles.lineView}>
            <Text style={[styles.lineText, { alignSelf: 'center' }]}> Profile / Settings </Text>
          </View>

          <View style={styles.profileInfo}>

            {/* {transactionTable && transactionTable.length > 0 ? (
              <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10, backgroundColor: COLORS.white, borderRadius: 10, height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '10%', marginBottom: 10 }}>
                <Pressable style={{ width: '90%', height: '100%', display: 'flex', justifyContent: 'center' }} onPress={handleCloseCollection}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <MaterialCommunityIcons name='close-circle-multiple' color={COLORS.gray} size={25} />
                    <Text style={{ fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'center', fontSize: 16 }}> Close collection </Text>
                  </View>
                </Pressable>
                <MaterialCommunityIcons name='chevron-right' color={COLORS.gray} size={30} />
              </View>
            ) : null} */}


            <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10, backgroundColor: COLORS.white, borderRadius: 10, height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '10%', marginBottom: 10, }}>
              <Pressable style={{ width: '90%', height: '100%', display: 'flex', justifyContent: 'center' }} onPress={() => { navigation.navigate('AccountSetting') }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <MaterialCommunityIcons name='account-cog-outline' color={COLORS.gray} size={25} />
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'center', fontSize: 16, }}>   Account Settings   </Text>
                </View>
              </Pressable>
              <MaterialCommunityIcons name={'chevron-right'} color={COLORS.gray} size={30} />
            </View>

            <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10, backgroundColor: COLORS.white, borderRadius: 10, height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '0%', marginBottom: 10, }}>
              <Pressable style={{ width: '90%', height: '100%', display: 'flex', justifyContent: 'center' }} onPress={() => { navigation.navigate('BankDetails') }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <MaterialCommunityIcons name='bank-outline' color={COLORS.gray} size={25} />
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'center', fontSize: 16, }}>   Bank Details   </Text>
                </View>
              </Pressable>
              <MaterialCommunityIcons name={'chevron-right'} color={COLORS.gray} size={30} />
            </View>

            <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10, backgroundColor: COLORS.white, borderRadius: 10, height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '0%', marginBottom: 10, }}>
              <Pressable style={{ width: '90%', height: '100%', display: 'flex', justifyContent: 'center' }} onPress={() => { navigation.navigate('GeneralSetting') }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <MaterialCommunityIcons name='cog-outline' color={COLORS.gray} size={25} />
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'center', fontSize: 16, }}>   General Setting   </Text>
                </View>
              </Pressable>
              <MaterialCommunityIcons name={'chevron-right'} color={COLORS.gray} size={30} />
            </View>

            <View style={{ display: 'flex', paddingLeft: 10, paddingRight: 10, backgroundColor: COLORS.white, borderRadius: 10, height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '0%', marginBottom: 10, }}>
              <Pressable style={{ width: '90%', height: '100%', display: 'flex', justifyContent: 'center' }} onPress={handleLogout}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <MaterialCommunityIcons name='logout' color={COLORS.gray} size={25} />
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: COLORS.gray, alignSelf: 'center', fontSize: 16, }}>   Sign out   </Text>
                </View>
              </Pressable>
              {/* <MaterialCommunityIcons name={'chevron-right'} color={COLORS.gray} size={30} /> */}
            </View>

          </View>
        </View>
      </ScrollView>

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
    height: windowHeight * 0.25,
    // backgroundColor: COLORS.lightGrey,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

  },
  profileIcon: {
    width: 120,
    height: 120,
    // borderWidth: 1,
    borderRadius: 60,
    overflow: 'hidden',
    padding: 2,
    borderColor: COLORS.lightGrey,
    elevation: 5,
    position: 'absolute',
    top: windowHeight * 0.1
  },
  curveView: {
    width: windowWidth * 1,
    height: windowHeight * 0.165,
    backgroundColor: COLORS.primaryAccent,
    // position: 'absolute',
    marginBottom: 'auto',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 5
  },
  logoutView: {
    width: windowWidth * 1,
    height: windowHeight * 0.1,
    // backgroundColor: COLORS.lightGrey,
    position: 'absolute',
    bottom: windowHeight * 0.03,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileSetting: {
    width: windowWidth * 1,
    // height: windowHeight * 0.58,
    // backgroundColor: 'gray'
  },
  lineView: {
    marginTop: 0,
    width: windowWidth * 0.85,
    height: windowHeight * 0.02,
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
  },
  lineText: {
    position: 'absolute',
    top: 3,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    color: COLORS.darkGrey,
    alignSelf: 'flex-start',
    fontSize: 18
  },
  profileInfo: {
    marginTop: 10,
    width: windowWidth * 0.85,
    // backgroundColor: 'grey',
    alignSelf: 'center'
  },
  keyName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: COLORS.darkGrey
  },
  keyValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
    textDecorationLine: 'underline'
  }
})
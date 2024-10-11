import { View, Text, StyleSheet, StatusBar, Image, Pressable } from 'react-native';
import React from 'react';
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings({navigation}) {
  return (
    <View style={styles.mainView}>
      {/* <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" /> */}
      <View style={styles.profileView}>
        <View style={styles.curveView} />
        <Text style={{ position: 'absolute', zIndex: 5, top: windowHeight * 0.04, color: COLORS.white, fontFamily: 'Montserrat-Bold', fontSize: 22 }}>Settings</Text>
        <View style={styles.profileIcon}>
          <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../../Assets/Images/setting.png')} />
        </View>
      </View>
      <View style={styles.logoutView}>
        <Pressable onPress={() => { navigation.navigate('LogIn'), AsyncStorage.clear(); }}>
          <MaterialCommunityIcons name='logout' style={{ alignSelf: 'center' }} color={COLORS.lightGrey} size={40} />
          <Text style={{ color: COLORS.lightGrey, fontFamily: 'Montserrat-Bold' }}>Logout</Text>
        </Pressable>
      </View>
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
    height: windowHeight * 0.3,
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
    height: windowHeight * 0.18,
    backgroundColor: COLORS.primaryAccent,
    // position: 'absolute',
    marginBottom: 'auto',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    elevation: 5
  },
  logoutView: {
    width: windowWidth * 1,
    height: windowHeight * 0.1,
    // backgroundColor: COLORS.lightGrey,
    position: 'absolute',
    bottom: windowHeight * 0.06,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }

})
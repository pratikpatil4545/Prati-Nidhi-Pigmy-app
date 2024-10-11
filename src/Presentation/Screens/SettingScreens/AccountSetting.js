import { View, Text, StyleSheet, Image, StatusBar, Pressable, BackHandler, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';

export default function AccountSetting({navigation}) {
    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={()=>{navigation.navigate("Profile")}} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
                </View>
            </View>

            <Text style={[styles.keyName, { textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>Account Settings</Text>

            <View style={{ width: '80%', alignSelf: 'center', marginTop: '10%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons2 name='user' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   User Name:  </Text>
                    <Text style={styles.keyValue}>Pratik Patil</Text>
                    <MaterialCommunityIcons name='pencil' style={{ marginStart: 'auto' }} color={COLORS.gray} size={25} />
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons3 name='call' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Phone No: </Text>
                    <Text style={styles.keyValue}>+91 9876543210</Text>
                    <MaterialCommunityIcons name='pencil' style={{ marginStart: 'auto' }} color={COLORS.gray} size={25} />

                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons3 name='password' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Password: </Text>
                    <Text style={styles.keyValue}>India@123#</Text>
                    <MaterialCommunityIcons name='pencil' style={{ marginStart: 'auto' }} color={COLORS.gray} size={25} />

                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons2 name='users' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Total Users:  </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none' }]}>148</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='cash-multiple' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Total Collection: </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none' }]}>₹ 15,600.00</Text>
                </View>
                <View style={{ width: windowWidth * 0.85, marginTop: 10, alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey }} />
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
        height: windowHeight * 0.20,
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
        top: windowHeight * 0.04
    },
    curveView: {
        width: windowWidth * 1,
        height: windowHeight * 0.10,
        backgroundColor: COLORS.primaryAccent,
        // position: 'absolute',
        marginBottom: 'auto',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        elevation: 5
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
        fontSize: 17,
        color: COLORS.darkGrey
    },
    keyValue: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: COLORS.primary,
        textDecorationLine: 'underline'
    }
})
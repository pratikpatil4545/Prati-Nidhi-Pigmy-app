import { View, Text, StyleSheet, Image, StatusBar, Pressable, BackHandler, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import CustomToggleSwitch from '../../Components/CustomToggleSwitch';


export default function GeneralSetting({ navigation }) {

    const [regNamePrint, setregNamePrint] = useState(false);
    const [fullPrint, setFullPrint] = useState(true);
    const [datePrint, setdatePrint] = useState(true);
    const [agentName, setagentName] = useState(true);
    const [currentBalance, setcurrentBalance] = useState(true);

    const handleRegNameToggle = (enabled) => {
        setregNamePrint(enabled);
    };

    const handleFullPrintToggle = (enabled) => {
        setFullPrint(enabled);
    };

    const handleDatePrintToggle = (enabled) => {
        setdatePrint(enabled);
    };

    const handleagentNameToggle = (enabled) => {
        setagentName(enabled);
    };

    const handleCurrentBalanceToggle = (enabled) => {
        setcurrentBalance(enabled);
    };

    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={() => { navigation.navigate("Profile") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: 125, height: 120, alignSelf: 'center', resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
                </View>
            </View>
            <Text style={[styles.keyName, { textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>General Settings</Text>

            <View style={styles.lineView}>
                <Text style={styles.lineText}>  Printing options  </Text>
            </View>

            <View style={{ width: '85%', alignSelf: 'center', marginTop: '5%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='printer' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Regional Name Print:  </Text>
                    <View style={{ marginStart: 'auto' }}>
                        <CustomToggleSwitch onToggle={handleRegNameToggle} initialEnabled={false} />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='printer' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Full Print :  </Text>
                    <View style={{ marginStart: 'auto' }}>
                        <CustomToggleSwitch onToggle={handleFullPrintToggle} initialEnabled={true} />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='printer' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Print Date time :  </Text>
                    <View style={{ marginStart: 'auto' }}>
                        <CustomToggleSwitch onToggle={handleDatePrintToggle} initialEnabled={true} />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='printer' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Print Agent Name :  </Text>
                    <View style={{ marginStart: 'auto' }}>
                        <CustomToggleSwitch onToggle={handleagentNameToggle} initialEnabled={false} />
                    </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='printer' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Print Current Balance :  </Text>
                    <View style={{ marginStart: 'auto' }}>
                        <CustomToggleSwitch onToggle={handleCurrentBalanceToggle} initialEnabled={true} />
                    </View>
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
        width: 125,
        height: 125,
        // borderWidth: 1,
        borderRadius: 180,
        overflow: 'hidden',
        padding: 2,
        resizeMode: 'cover',
        // backgroundColor: COLORS.primary,
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
        marginTop: 20,
        width: windowWidth * 0.85,
        height: windowHeight * 0.02,
        alignSelf: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.lightGrey
    },
    lineText: {
        position: 'absolute',
        top: 4,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Montserrat-Bold',
        color: COLORS.lightGrey,
        alignSelf: 'center',
        fontSize: 16
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
import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function BankDetails({ navigation }) {

    const [branchName, setBranchName] = useState(null);
    const [branchCode, setbranchCode] = useState(null);
    const [ClientName, setClientName] = useState(null);

    useEffect(() => {
        getMasterData();
    }, []);

    const getMasterData = async () => {
        try {
            const [savedData] = await Promise.all([
                AsyncStorage.getItem('dataObject'),
            ]);

            if (savedData) {
                const dataObject = JSON.parse(savedData);
                setBranchName(dataObject?.MstrData?.BrNameE || '');
                setbranchCode(dataObject?.MstrData?.BrCode);
                setClientName(dataObject.MstrData?.ClientName);
            }
        } catch (error) {
            console.log('Failed to fetch data from AsyncStorage:', error.message || error);
        }
    };
    
    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={() => { navigation.navigate("Profile") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: 125, height: 120, alignSelf: 'center', resizeMode: 'contain' }} source={require('../../Assets/Images/rupee.png')} />
                </View>
            </View>
            
            <Text style={[styles.keyName, {marginTop:15, textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>Client Details</Text>

            <View style={{ width: '85%', alignSelf: 'center', marginTop: '10%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15, alignItems: 'center' }}>
                    <MaterialCommunityIcons name='bank' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Client Name: </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none', width: '60%', textAlign: 'jusify' }]}>{ClientName ? ClientName : '-'}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15, alignItems: 'center' }}>
                    <MaterialCommunityIcons name='bank' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Branch Name:  </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none', width: '60%', textAlign: 'jusify' }]}>{branchName ? branchName : '-'}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 15 }}>
                    <MaterialCommunityIcons name='city' style={{ alignSelf: 'center' }} color={COLORS.gray} size={20} />
                    <Text style={styles.keyName}>   Branch Code :  </Text>
                    <Text style={[styles.keyValue, { textDecorationLine: 'none' }]}>{branchCode ? branchCode : '-'}</Text>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },
    profileIcon: {
        width: 125,
        height: 125,
        borderRadius: 180,
        overflow: 'hidden',
        padding: 2,
        resizeMode: 'cover',

        elevation: 5,
        position: 'absolute',
        top: windowHeight * 0.04
    },
    curveView: {
        width: windowWidth * 1,
        height: windowHeight * 0.10,
        backgroundColor: COLORS.primaryAccent,
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
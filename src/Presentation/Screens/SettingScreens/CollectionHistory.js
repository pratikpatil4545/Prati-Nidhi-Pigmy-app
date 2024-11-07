import { View, Text, StyleSheet, Image, StatusBar, Pressable, BackHandler, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TransactionCard from '../../Components/TransactionCard';
import HistoryCards from '../../Components/HistoryCards';

export default function CollectionHistory({ navigation }) {
    const [transactionTable, setTransactionTable] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchTransactionTable();
    }, [isFocused]);

    const fetchTransactionTable = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionHistoryTable');
            if (transactionTableData) {
                const parsedData = JSON.parse(transactionTableData);  // Parse the stored data
                setTransactionTable(parsedData);

                const total = parsedData.reduce((sum, transaction) => {
                    return sum + (parseFloat(transaction.Collection) || 0);
                }, 0);
                // console.log("No saved data found, making API call...", total);

                setTotalAmount(total);
            }
        } catch (error) {
            console.error('Error fetching transaction table from AsyncStorage:', error);
        }
    };

    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={() => { navigation.navigate("Profile") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../../Assets/Images/maestrotek_logo.png')} />
                </View>
            </View>

            <Text style={[styles.keyName, { textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>Collections History</Text>

            <ScrollView style={{ marginTop: 20, marginBottom: 40 }}>
                <>
                    {transactionTable && transactionTable?.length > 0 ? (
                        transactionTable
                            ?.sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime))
                            ?.map((item, index, sortedTable) => {
                                const currentCardDate = item.CollDateTime?.split(' ')[0]; // Extract date part only
                                const previousCardDate = sortedTable[index - 1]?.CollDateTime?.split(' ')[0];
                                const showDateHeader = currentCardDate !== previousCardDate;

                                return (
                                    <React.Fragment key={index}>
                                        {showDateHeader && (
                                            <Text style={styles.dateHeader}>{currentCardDate}</Text>
                                        )}
                                        <HistoryCards history={true} item={item} index={index} />
                                    </React.Fragment>
                                );
                            })
                    ) : (
                        <Text style={[styles.text1, { margin: 'auto', marginTop: 100 }]}>No Collections history yet</Text>
                    )}
                </>


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
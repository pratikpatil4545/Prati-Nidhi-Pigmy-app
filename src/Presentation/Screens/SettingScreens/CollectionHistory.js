import { View, Text, StyleSheet, Image, ScrollView, TextInput, Pressable, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import MaterialCommunityIcons4 from 'react-native-vector-icons/FontAwesome6';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistoryCards from '../../Components/HistoryCards';
import { Searchbar } from 'react-native-paper';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';

export default function CollectionHistory({ navigation }) {
    const [transactionTable, setTransactionTable] = useState([]);
    const [filteredTable, setFilteredTable] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchTransactionTable();
    }, [isFocused]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredTable(transactionTable);
        } else {
            const filteredData = transactionTable.filter(
                (item) =>
                    item.EnglishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.AccountNo?.toString().includes(searchTerm)
            );
            setFilteredTable(filteredData);
        }
    }, [searchTerm, transactionTable]);

    const fetchTransactionTable = async () => {
        try {
            const transactionTableData = await AsyncStorage.getItem('transactionHistoryTable');
            if (transactionTableData) {
                const parsedData = JSON.parse(transactionTableData);
 
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const filteredData = parsedData.filter(transaction => {
                    const transactionDate = new Date(transaction.CollDateTime);
                    return transactionDate >= sevenDaysAgo;
                });
 
                await AsyncStorage.setItem('transactionHistoryTable', JSON.stringify(filteredData));

                setTransactionTable(filteredData);
                setFilteredTable(filteredData);

                const total = filteredData.reduce((sum, transaction) => {
                    return sum + (parseFloat(transaction.Collection) || 0);
                }, 0);
                setTotalAmount(total);
            }
        } catch (error) {
            Alert.alert('Error fetching transaction table from AsyncStorage:', error);
        }
    };


    return (
        <View style={styles.mainView}>
            <View style={styles.profileView}>
                <View style={styles.curveView} >
                    <MaterialCommunityIcons4 onPress={() => { navigation.navigate("Profile") }} name='angle-left' style={{ left: windowWidth * 0.05, top: windowHeight * 0.02, position: 'absolute' }} color={COLORS.white} size={40} />
                </View>
                <View style={styles.profileIcon}>
                    <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../../Assets/Images/automateSystemsLogo.png')} />
                </View>
            </View>
            <Text style={[styles.keyName, { textAlign: 'center', fontSize: 20, fontFamily: 'Montserrat-Bold' }]}>Collections History</Text>

            <View style={{ width: windowWidth * 1, marginTop: '2%', height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Searchbar
                    placeholder="Search by Name or A/C No"
                    onChangeText={setSearchTerm}
                    // loading={true}
                    value={searchTerm}
                    onIconPress={() => { setSearchTerm(''), Keyboard.dismiss() }}
                    iconColor={COLORS.primary}
                    elevation={1}
                    style={{
                        width: '80%',
                        alignSelf: 'center',
                        // marginTop: 20,
                        backgroundColor: '#FFFFFF',
                        elevation: 15,
                    }}
                />
            </View>

            <ScrollView style={{ marginTop: 20, marginBottom: 40 }}>
                {filteredTable && filteredTable.length > 0 ? (
                    filteredTable
                        .sort((a, b) => new Date(b.CollDateTime) - new Date(a.CollDateTime))
                        .map((item, index, sortedTable) => {
                            const currentCardDate = item.CollDateTime?.split(' ')[0]; // Extract date part only
                            const previousCardDate = sortedTable[index - 1]?.CollDateTime?.split(' ')[0];
                            const showDateHeader = currentCardDate !== previousCardDate;

                            return (
                                <React.Fragment key={index}>
                                    {showDateHeader && (
                                        <Text style={[styles.keyName, { marginLeft: 10 }]}>{currentCardDate}</Text>
                                    )}
                                    <HistoryCards history={true} item={item} index={index} />
                                </React.Fragment>
                            );
                        })
                ) : (
                    <Text style={[styles.text1, { alignSelf: 'center', marginTop: 100 }]}>No Collections history yet</Text>
                )}
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileIcon: {
        width: 120,
        height: 120,
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
        marginBottom: 'auto',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        elevation: 5
    },
    keyName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: COLORS.darkGrey
    },
    text1: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 18,
        marginVertical: 3,
        marginHorizontal: 15,
        color: COLORS.gray,
        alignSelf: 'flex-start'
    }
});

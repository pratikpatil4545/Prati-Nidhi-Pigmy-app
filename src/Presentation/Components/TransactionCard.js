
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons2 from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TransactionCard(props) {

    const navigation = useNavigation();
    // console.log("searchQuery", props.item);

    const HighlightedText = ({ name, query }) => {
        if (!query) {
            return <><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Account Number: </Text><Text style={[styles.text, { color: COLORS.darkGrey }]}>{name}</Text></>;
        }
        const regex = new RegExp(`(${query})`, 'gi'); // Create a regex to match the query
        const parts = name.split(regex); // Split the name based on the query
        return (
            <Text style={[styles.text, { color: COLORS.darkGrey }]}>
                <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Name: </Text>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? ( // Check if the part matches the query
                        <Text key={index} style={{ backgroundColor: 'yellow' }}>{part}</Text> // Highlighted style
                    ) : (
                        <Text key={index}>{part}</Text>
                    )
                )}
            </Text>
        );
    };

    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date();
    let day = weekday[date.getDay()];

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

    const dayIndex = getDay()

    const dateTime = props.item?.CollDateTime;

    const [CardDate, time, period] = dateTime.split(' ');
    const [year, month, days] = CardDate.split('-');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex];
    const cardDay = days;


    return (
        <View style={styles.mainView}>
            <Pressable key={props.index} style={styles.card}>
                <View style={styles.cardView}>
                    <View style={styles.left}>
                        {props.item.IsitNew === 'True' &&
                            <View style={{ position: 'absolute', width: '100%', height: '20%', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7FA1C3' }}>
                                <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Regular', color: COLORS.white, }}>
                                    New Account
                                </Text>
                            </View>
                        }


                        <View style={styles.dateCard}>
                            <View style={styles.dateCardInner}></View>
                            <View style={[styles.dateCardInner, { backgroundColor: '#6482AD', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, }]}></View>
                            <View style={{ alignSelf: 'center', position: 'absolute' }}>
                                <Text style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Montserrat-Medium', color: COLORS.white }}>{cardDay}</Text>
                                <Text style={{ fontFamily: 'Montserrat-Medium', color: COLORS.white }}>{monthName}</Text>
                            </View>
                            <View style={{ width: 6, height: 6, borderRadius: 20, backgroundColor: COLORS.white, position: 'absolute' }} />
                            <View style={{ width: 6, height: 6, borderRadius: 20, backgroundColor: COLORS.white, position: 'absolute', right: 0 }} />
                        </View>
                    </View>

                    <View style={styles.right}>
                        {/* {props.item.pending &&
                            <MaterialCommunityIcons2 name='upload-off' style={{ elevation: 5, position: 'absolute', right: 5 }} elevation={5} color={COLORS.primary} size={20} />
                        } */}

                        <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Collection date time:  </Text>
                            <Text style={[styles.text, { color: COLORS.darkGrey }]}>{props.item.CollDateTime}</Text>
                        
                        <HighlightedText name={`${((props.item.GLCode != '0' && (props.InputFileType === '2')) ? `${props.item.GLCode}-` : '' )}${props.item.AccountNo}`} query={props.searchQuery} />
                            <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Collection:  </Text>
                        <Text style={[styles.text, { color: COLORS.darkGrey }]}>₹{new Intl.NumberFormat('en-IN').format(props.item.Collection)}</Text>
                            {/* <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Closing balance:  </Text>
                        <Text style={[styles.text, { color: COLORS.darkGrey }]}>    ₹{new Intl.NumberFormat('en-IN').format(props.item.ClosingBal)}</Text> */}
                    </View>
                </View>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    mainView: {
        width: windowWidth * 1,
        height: windowHeight * 0.18,
        // backgroundColor: 'green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        width: windowWidth * 0.85,
        height: windowHeight * 0.15,
        display: "flex",
        // flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        // borderTopLeftRadius: 0,
        // marginBottom: 5,
        // marginTop: 15,
        alignSelf: 'center',
        elevation: 2,
        overflow: 'hidden'
    },
    text: {
        fontSize: 14,
        color: COLORS.primary,
        // marginBottom: 4,
        fontFamily: 'Montserrat-SemiBold'
    },
    cardView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: "center",
        // backgroundColor: COLORS.primary,
    },
    dateCard: {
        width: 50,
        height: 50,
        // backgroundColor: '#00c967',
        backgroundColor: COLORS.white,
        alignSelf: 'center',
        borderRadius: 5,
        elevation: 5,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    dateCardInner: {
        width: '90%',
        height: '45%',
        backgroundColor: '#7FA1C3',
        alignSelf: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    left: {
        width: '32%',
        minHeight: '100%',
        maxHeight: '100%',
        borderRightWidth: 2,
        borderStyle: 'dashed',
        borderRightColor: COLORS.white,
        backgroundColor: COLORS.primaryAccent,
        // borderTopRightRadius: 50,
        // borderBottomRightRadius: 50,
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        // paddingRight: 10
        // marginBottom: 'auto'
        // justifyContent: 'center'
    },
    right: {
        marginLeft: 10,
        width: '60%',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
        // backgroundColor:'red',
        marginTop: 'auto'
        // alignItems: 'center'
    },
    lineCurve: {
        width: 20,
        height: 20,
        backgroundColor: COLORS.white,
        // borderBottomLeftRadius:15,
        // borderRadius: 15,
        borderBottomRightRadius: 15,
        position: 'absolute',
        left: 0,
        top: 0,
        // elevation:15
    },
    lineCurve1: {
        width: 20,
        height: 20,
        backgroundColor: COLORS.white,
        // borderBottomLeftRadius:15,
        // borderRadius: 15,
        borderTopRightRadius: 15,
        position: 'absolute',
        left: 0,
        bottom: 0,
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
    modalCard: {
        width: '100%',
        height: 150,
        backgroundColor: COLORS.primary,
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 15
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
    }
});
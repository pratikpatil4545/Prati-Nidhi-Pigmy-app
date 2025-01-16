
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar, Alert, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

export default function TransactionCard(props) {

    const navigation = useNavigation();
    // console.log("searchQuery", props);
    const [modalVisible, setModalVisible] = useState(false);
    const [ClientID, setClientId] = useState(null);
    const [BrCode, setBrCode] = useState(null);
    const [AgCode, setAgCode] = useState(null); 

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savedData = await AsyncStorage.getItem('dataObject');
                // console.log("saved data", savedData);
                if (savedData) {
                    const dataObject = JSON.parse(savedData);
                    setClientId(dataObject.MstrData?.ClientID);
                    setAgCode(dataObject.MstrData?.AgCode);
                    setBrCode(dataObject.MstrData?.BrCode);
                }
            } catch (error) {
                console.log("Error fetching data from AsyncStorage:", error);
                Alert.alert("Error fetching data from AsyncStorage:");
            }
        };
    
        fetchData();
    }, []);
    

    const handleWhatsAppPress = async () => {
 
        const clId = ClientID;
        const Brid = BrCode;
        const Agid = AgCode;
        const glcod = props.item?.GLCode;
        const acno = props.item?.AccountNo; 
        const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
        const ruid = Buffer.from(ruidString).toString('base64');
        const encodedDateTime = props.item?.CollDateTime?.replace(' ', '%20');
        // console.log("time new", encodedDateTime)
    
        const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;
    
        // console.log(encodedURL);
        const getNumber = parseInt(props.item?.MobileNo);
        const phoneNumber = `+91${getNumber}`;
        const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;
        const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phoneNumber}`;
        Linking.openURL(url);
        setModalVisible(false)
     
      };
     
      const handleSmsPress = async () => {
    
        const clId = ClientID;
        const Brid = BrCode;
        const Agid = AgCode;
        const glcod = props.item?.GLCode;
        const acno = props.item?.AccountNo; 
        const ruidString = `${clId},${Brid},${Agid},${glcod},${acno}`;
        const ruid = Buffer.from(ruidString).toString('base64');
        const encodedDateTime = props.item?.CollDateTime?.replace(' ', '%20');
        // console.log("time new", encodedDateTime)
    
        const encodedURL = `https://app.automatesystemsdataservice.in/Customer/api/Receipt?ruid=${ruid}&ColldateTime=${encodedDateTime}`;
    
        // console.log(encodedURL);
        const getNumber = parseInt(props.item?.MobileNo);
        const phoneNumber = `+91${getNumber}`;
        const message = `Hi, Please click on the link Below for the Receipt of your Transaction. ${encodedURL} `;
    
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        try {
          await Linking.openURL(smsUrl); 
          setModalVisible(false);
        } catch (error) {
          Alert.alert("Error", "Unable to open SMS app.");
        }
      };

    return (
        <View style={styles.mainView}>
            <Pressable onLongPress={() => setModalVisible(true)} key={props.index} style={styles.card}>
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

                        <HighlightedText name={`${((props.item.GLCode != '0' && (props.InputFileType === '2')) ? `${props.item.GLCode}-` : '')}${props.item.AccountNo}`} query={props.searchQuery} />
                        <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Collection:  </Text>
                        <Text style={[styles.text, { color: COLORS.darkGrey }]}>₹{new Intl.NumberFormat('en-IN').format(props.item.Collection)}</Text>
                        {/* <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Closing balance:  </Text>
                        <Text style={[styles.text, { color: COLORS.darkGrey }]}>    ₹{new Intl.NumberFormat('en-IN').format(props.item.ClosingBal)}</Text> */}
                    </View>
                </View>
            </Pressable>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Montserrat-Bold', marginBottom: 20 }}>Share a Receipt</Text>
                            {/* <Text style={{fontSize: 14, alignSelf: 'flex-start', color: 'grey', fontFamily: 'Montserrat-SemiBold', marginBottom: 20}}>Account number : {((props.item.GLCode != '0' && (props.InputFileType === '2')) ? `${props.item.GLCode}-` : '')}{props.item.AccountNo} </Text> */}
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                onPress={handleWhatsAppPress}
                                style={styles.whatsappIcon}
                                name='whatsapp'
                                color={COLORS.white}
                                size={35}
                            />
                            <Text style={{ alignSelf: 'center', fontSize: 26, fontWeight: 'thin', color: '#999999' }}>|</Text>
                            <MaterialCommunityIcons
                                onPress={handleSmsPress}
                                style={styles.smsIcon}
                                name='android-messages'
                                color={COLORS.white}
                                size={35}
                            />
                        </View>
                        <Button icon={'close'} onPress={() => setModalVisible(false)} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: '8%', minWidth: windowWidth * 0.35 }} mode="contained">Close</Button>
                        {/* <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ color: COLORS.primary, marginTop: 20 }}>Close</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>
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
        height: windowHeight * 0.20,
        // backgroundColor: 'green',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        width: windowWidth * 0.85,
        height: windowHeight * 0.18,
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
    whatsappIcon: {
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: '#25D366',
        borderRadius: 15,
        padding: 5,
        elevation: 5,

    },
    smsIcon: {
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        padding: 5,
        elevation: 5,

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
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
    iconContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
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
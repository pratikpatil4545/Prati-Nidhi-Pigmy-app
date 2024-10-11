import { View, Text, StyleSheet, ToastAndroid, ScrollView, StatusBar, Modal, Pressable, BackHandler, Keyboard, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../../Common/Constants'
import { Button, Searchbar } from 'react-native-paper'
import DataCard from '../../Components/DataCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons2 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons3 from 'react-native-vector-icons/Ionicons';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockData } from '../../../Common/MockData';
import TransactionCard from '../../Components/TransactionCard';
import SearchPopup from '../../Components/SearchPopup';
import { useIsFocused } from '@react-navigation/native';
import { database } from '../../../data/database';
import pigmyConfig from '../../../Common/DummyData.json'

const { FtpModule } = NativeModules;

export default function Dashboard({ navigation }) {

    const [dataAvailable, setDataAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [data, setData] = useState([]);
    const [inputData, setInputData] = useState({});
    const [filteredData, setFilteredData] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState(MockData.recentTransactions);
    const [searchedResults, setSearchedResults] = useState(false);
    const [backPressedOnce, setBackPressedOnce] = useState(false);
    const isFocused = useIsFocused();
    const [totalAmount, setTotalAmount] = useState(0);
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date();
    let day = weekday[date.getDay()];
    const [recordLineStart, setRecordLineStart] = useState(null);
    const [pigmyConfigFile, setPigmyConfigFile] = useState(null);
    const [header1Count, setHeader1Count] = useState(null);
    const [header2Count, setHeader2Count] = useState(null);
    const [header3Count, setHeader3Count] = useState(null);
    const [headerTableData, setHeaderTableData] = useState(null);
    const [headerTableDatatoCheck, setHeaderTableDatatoCheck] = useState(null);
    const [MasterTableDatatoCheck, setMasterTableDatatoCheck] = useState(null);
    const [masterTableData, setMasterTableData] = useState(null);
    const [mappedMasterData, setMappedMasterData] = useState([]);
    const [mappedMasterData2, setMappedMasterData2] = useState(null);
    const table1Mapping = [
        "M_Field1", "Account number  ",
        "M_Field2", "Name in English ",
        "M_Field3", "Name in regional ",
        "M_Field4", "Current Balance ",
        "M_Field5", "Last Month Balance ",
        "M_Field6", "ThisMonth Balance",
        "M_Field7", "Maximum Installments",
        "M_Field8", "Daily Expected Amount ",
        "M_Field9", "One time Collection Limit  ",
        "M_Field10", "Maximum Balance Allowed",
        "M_Field11", "Acc Open Date  ",
        "M_Field12", "Last Collection Date  ",
        "M_Field13", "Lien GL Code  ",
        "M_Field14", "Lien GL Text  ",
        "M_Field15", "Lien Account No  ",
        "M_Field16", "Lien Amount",
        "M_Field17", "Mobile No"
    ];

    // console.log("master table datas",  mappedMasterData);

    // useEffect(async () => {
    //     getData();
    //     const storedData = await AsyncStorage.getItem('customerData');
    //     // console.log("mapped master new data", JSON.parse(storedData));
    //     // mapData();
    //     // getFileContent()
    //     // mapMasterData();
    // }, [isFocused])

    useEffect(() => {
        setLoading(true);
        ftpTest()
        const checkAndSetData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('customerData');

                if (storedData !== null) {
                    const parsedData = JSON.parse(storedData);
                    setMappedMasterData(parsedData);
                    setLoading(false);
                    setDataAvailable(true);
                    //   console.log("Stored data loaded sx:", storedData);
                } else {
                    setLoading(false);
                    console.log("No stored data found, fetching file content and mapping data...");
                }
            } catch (error) {
                console.error("Error retrieving data:", error);
            }
        };
        if (isFocused) {
            checkAndSetData();
        }
    }, [isFocused]);

    useEffect(() => {
        const storeData = async () => {
            try {
                await AsyncStorage.setItem('customerData', JSON.stringify(mappedMasterData));

            } catch (error) {
                console.error("Error storing customer data:", error);
            }
        };

        if (mappedMasterData) { // Optional: Ensure data is available
            storeData();
        }
    }, [mappedMasterData]);

    useEffect(() => {
        const total = recentTransactions.reduce((sum, transaction) => {
            const amount = parseFloat(transaction[getDay()]) || 0;
            return sum + amount;
        }, 0);

        setTotalAmount(total);
    }, [recentTransactions]);

    useEffect(() => {
        const handleBackPress = () => {
            if (backPressedOnce && !searchedResults) {
                BackHandler.exitApp();
            } else {
                setBackPressedOnce(true);
                ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                setTimeout(() => {
                    setBackPressedOnce(false);
                }, 2000);
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, [backPressedOnce]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const storedData = await AsyncStorage.getItem('customerData');
                let data = JSON.parse(storedData) || [];

                const today = new Date();
                const todayString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(-2)}`;

                const todayTransactions = data.filter(transaction => {
                    const dateTime = transaction[11]; // Assuming the 11th index contains the date
                    return dateTime?.startsWith(todayString);
                });

                todayTransactions.sort((a, b) => {
                    const timeA = a[11].split(' ')[1]; // Extract time from dateTime
                    const timeB = b[11].split(' ')[1];
                    return timeB?.localeCompare(timeA); // Compare time strings
                });

                setRecentTransactions(todayTransactions);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };

        fetchTransactions();
    }, [isFocused]);

    // useEffect(() => {
    //     const checkAsyncStorageForData = async () => {
    //         try {
    //             const storedData = await AsyncStorage.getItem('customerData');
    //             if (storedData !== null) {
    //                 setDataAvailable(true);
    //             }
    //             else {
    //                 setDataAvailable(false);
    //             }
    //         } catch (e) {
    //             console.error('Failed to fetch data from AsyncStorage', e);
    //         }
    //         // getFileContent();
    //     };

    //     checkAsyncStorageForData();
    // }, []);

    useEffect(() => {
        const checkDataFromDB = async () => {
            try {
                const headerRecords = await database.get('master_table').query().fetch();
                const storedData = await AsyncStorage.getItem('customerData');
                let data = JSON.parse(storedData) || [];

                // console.log("from asyncstorag  se xd data", data)
                if (headerRecords.length === 0) {
                    setDataAvailable(false);
                }
                else {
                    setDataAvailable(true);
                }
            } catch (e) {
                console.error('Failed to fetch data from AsyncStorage', e);
            }
            // getFileContent();
        };

        checkDataFromDB();
    }, []);

    // useEffect(() => {
    //     let pigmyFileConfig = JSON.parse(pigmyConfigFile)
    //     const recordLineStartData = pigmyFileConfig["Pigmy Input Configuration"]["Record Start Line"];
    //     setRecordLineStart(recordLineStartData);
    //     const header1CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header1 Fields"];
    //     setHeader1Count(header1CountData);
    //     const header2CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header2 Fields"];
    //     setHeader2Count(header2CountData);
    //     const header3CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header3 Fields"];
    //     setHeader3Count(header3CountData);
    //     const headerTableData = pigmyFileConfig["Pigmy Input Configuration"]["Table2 Mapping"];
    //     setHeaderTableData(headerTableData);
    //     const masterTableData = pigmyFileConfig["Pigmy Input Configuration"]["Table1 Mapping"];
    //     setMasterTableData(masterTableData);

    //     console.log("table maping in config file", masterTableData);
    // }, [pigmyConfigFile])



    // useEffect(() => {
    //     let temp = JSON.parse(pigmyConfigFile)
    //     console.log("new by file", temp["Pigmy Input Configuration"]["Record Start Line"]);
    // }, [pigmyConfigFile])

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

    const handleGetData = () => {
        setLoading(true);
        ToastAndroid.show('Getting latest data', ToastAndroid.SHORT);
        getFileContent();
    }

    const ftpTest = async () => {
        console.log("first")
        try {
            const content = await FtpModule.getFileContent(
                'automatesystemsdataservice.in',
                21,
                'TESTFTP',
                'Auto_1234',
                '/TOPIG/PigmyInputConfigType.json'
            );
            // Assuming parseFileContent is a function that parses the content into an array
            // const dataArray = parseFileContent(content);
            console.log("FTP local", content);
            setPigmyConfigFile(content);
            mapConfigJsonFile(content);
            // let slicedDataArray = dataArray.slice(1);
        } catch (error) {
            console.error(error);
        }
    }

    const mapConfigJsonFile = (content) => {
        const pigmyFileConfig = JSON.parse(content)
        const recordLineStartData = pigmyFileConfig["Pigmy Input Configuration"]["Record Start Line"];
        setRecordLineStart(recordLineStartData);
        const header1CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header1 Fields"];
        setHeader1Count(header1CountData);
        const header2CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header2 Fields"];
        setHeader2Count(header2CountData);
        const header3CountData = pigmyFileConfig["Pigmy Input Configuration"]["No of Header3 Fields"];
        setHeader3Count(header3CountData);
        const headerTableData = pigmyFileConfig["Pigmy Input Configuration"]["Table2 Mapping"];
        setHeaderTableData(headerTableData);
        const masterTableData = pigmyFileConfig["Pigmy Input Configuration"]["Table1 Mapping"];
        setMasterTableData(masterTableData);
    }

    const getFileContent = async () => {
        try {
            // const content = await FtpModule.getFileContent(
            //     '192.168.1.155',
            //     21,
            //     'mipl',
            //     'Mipl@123',
            //     '/upload/PigmyInputConfigType1.json'
            // );
            // console.log("FTP local", content)
            // Assuming parseFileContent is a function that parses the content into an array
            // const dataArray = parseFileContent(content);
            // let slicedDataArray = dataArray.slice(1);

            const headerRecords = await database.get('master_table').query().fetch();
            if (headerRecords.length === 0) {
                const content = await FtpModule.getFileContent(
                    'automatesystemsdataservice.in',
                    21,
                    'TESTFTP',
                    'Auto_1234',
                    '/TOPIG/InputFile_Type.txt'
                );
                // setDataAvailable(false);
                const dataArray = parseFileContent(content);
                let slicedDataArray = dataArray.slice(parseInt(recordLineStart) - 1);
                setInputData(slicedDataArray); // Set input data for further processing
                let slicedDataArrayHeader = dataArray.slice(0, parseInt(recordLineStart) - 1);
                setData(slicedDataArrayHeader);
                mapData(slicedDataArrayHeader);
                mapMasterData(slicedDataArray);
            }
            // else {
            //     const dataArray = parseFileContent(rawData);
            //     let slicedDataArray = dataArray.slice(parseInt(recordLineStart) - 1);
            //     setInputData(slicedDataArray); // Set input data for further processing
            //     let slicedDataArrayHeader = dataArray.slice(0, parseInt(recordLineStart) - 1);
            //     setData(slicedDataArrayHeader);
            //     mapData(slicedDataArrayHeader);
            //     mapMasterData(slicedDataArray);
            // }

            ToastAndroid.show('Data found!', ToastAndroid.SHORT);
            setLoading(false);
            setDataAvailable(true);
        } catch (error) {
            console.error(error);
        }
    };

    const parseFileContent = (fileContent) => {
        const lines = fileContent.trim().split('\n');
        const parsedData = lines.map(line => {
            const values = line.split(',');
            return values.map(value => value.trim());
        });
        return parsedData;
    };

    const getData = () => {
        const headersData = database.collections.get('master_table');
        // console.log("fetched data mster table", headersData)
        headersData.query().observe()?.forEach(item => {
            let temp = [];
            item?.forEach(data => {
                temp.push(data._raw);
            });
            setMappedMasterData2(headersData);
            // console.log("all items in master table  =>>>", temp)
        })
    }

    const mapData = (slicedDataArrayHeader) => {
        let headers = [];
        headerTableData?.map((v, i) => {
            headers.push({
                column_name: v[i.toString()][0],
                display_name: v[i.toString()][1],
                index: parseInt(v[i.toString()][2].split('-')[1]) - 1,
                header_number: (v[i.toString()][2].split('-')[0]).replace(/\D/g, '')
            });
        });
        setHeaderTableDatatoCheck(headers);
        mapDataValues(headers, slicedDataArrayHeader);
    };

    const mapDataValues = (headers, inputData) => {
        const result = {};
        const result2 = {};

        headers.forEach(header => {
            const headerIndex = parseInt(header.header_number) - 1;
            if (inputData[headerIndex] && inputData[headerIndex][header?.index] !== undefined) {
                result[header?.column_name] = inputData[headerIndex][header?.index];
            } else {
                result[header?.column_name] = null;
            }
        });
        headers.forEach(header => {
            const headerIndex = parseInt(header.header_number) - 1;
            result2[header?.column_name] = header?.display_name;
        });
        // console.log("header mapping testibnf", result)
        // console.log("header mapping result 2", result2)

        insertMappedDataToDB(result);
    };

    const insertMappedDataToDB = async (mappedData) => {
        const currentDate = new Date().toLocaleDateString();
        const headerRecords = await database.get('header_table').query().fetch();

        if (headerRecords.length === 0) {
            await database.write(async () => {
                await database.get('header_table').create(record => {
                    Object.keys(mappedData).forEach(key => {
                        record[key] = mappedData[key];  // Dynamically set values
                    });
                    record.D_Field38 = currentDate;  // Add current date to D_Field38
                });
            });
            console.log("Header Data successfully inserted into WatermelonDB.");
        } else {
            console.log("Header Data not inserted as header_table is not empty.");
        }
    };

    const mapMasterData = (slicedDataArray) => {
        let master = [];
        masterTableData?.map((v, i) => {
            master.push({
                column_name: v[i.toString()][0],
                display_name: v[i.toString()][1],
                index: parseInt(v[i.toString()][2]) - 1,
            });
        });
        // console.log("mapped masters data", master);
        mapMasterDataValues(master, slicedDataArray)
        setMasterTableDatatoCheck(master);
    };

    const mapMasterDataValues = async (masters, inputData) => {
        const mappedDataArray = [];
        const mappedDisplayColumnName = [];
        for (const row of inputData) {
            const mappedRow = {};
            const mappedRow2 = {};
            const mappedRow3 = {};
            masters.forEach(master => {
                const { column_name, index, display_name } = master;

                if (index >= 0 && row[index] !== undefined) {
                    mappedRow[column_name] = row[index];
                    mappedRow2[display_name] = row[index];
                    mappedRow3[display_name] = column_name;
                } else {
                    mappedRow[column_name] = null;
                    mappedRow2[display_name] = null;
                    mappedRow3[display_name] = null;
                }
            });

            mappedDataArray.push(mappedRow2);
            mappedDisplayColumnName.push(mappedRow3);

            await insertMappedMasterDataToDB(mappedRow);
        }
        setLoading(false);
        setDataAvailable(true);
        setMappedMasterData(prevData => [...(prevData || []), ...mappedDataArray]);
        // let updatedData = prevData => [...(prevData || []), ...mappedDisplayColumnName];
        // const stringifiedData = JSON.stringify(updatedData);
        // const dataToStore = updatedData || []; // Default to an empty array if data is null or undefined
        // const stringifiedData = JSON.stringify(dataToStore);
        // await AsyncStorage.setItem('customerData', stringifiedData);
        // setMappedMasterData2(prevData => [...(prevData || []), ...mappedDisplayColumnName]);
        // console.log("Mapped Master Data for U I (Complete Array):", updatedData);
        // console.log("Mapped Master Data json stringify", stringifiedData);
    };

    const insertMappedMasterDataToDB = async (mappedData) => {
        const currentDate = new Date().toLocaleDateString();

        // Insert the new record into the database
        await database.write(async () => {
            await database.get('master_table').create(record => {
                Object.keys(mappedData).forEach(key => {
                    record[key] = mappedData[key];  // Dynamically set values for each column
                });
            });
        });

        // console.log("Data successfully inserted into WatermelonDB.");
    };

    const fieldMapping = Object.fromEntries(
        table1Mapping?.map(item => {
            const [key, [fieldId, displayName]] = Object.entries(item)[0];
            return [fieldId, displayName?.trim()]; // Remove any extra whitespace
        })
    );

    return (
        <View style={styles.dashView}>
            <StatusBar backgroundColor={COLORS.primaryAccent} barStyle="light-content" />

            {dataAvailable ? (
                <>
                    <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Searchbar
                            placeholder="Search by Name or A/C No"
                            onChangeText={setSearchQuery}
                            // loading={true}
                            value={searchQuery}
                            autoFocus={searchedResults}
                            onIconPress={() => { setSearchedResults(false), setSearchQuery(''), Keyboard.dismiss() }}
                            icon={searchedResults ? 'arrow-left-thin' : 'magnify'}
                            iconColor={COLORS.primary}
                            onPress={() => { setSearchedResults(true) }}
                            elevation={1}
                            style={{
                                width: '80%',
                                alignSelf: 'center',
                                // marginTop: 20,
                                backgroundColor: '#FFFFFF',
                                elevation: 15,
                            }}
                        />
                        <Pressable onPress={() => { navigation.navigate('Profile') }}>
                            <MaterialCommunityIcons2 name='user-circle' style={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    <View style={{ height: windowHeight * 0.80 }}>
                        <ScrollView >
                            {mappedMasterData
                                .filter(item => {
                                    const name = item['Name in English ']?.toLowerCase() || '';
                                    const accountNumber = item['Account number  ']?.toLowerCase() || '';
                                    return (
                                        name.includes(searchQuery.toLowerCase()) ||
                                        accountNumber.includes(searchQuery.toLowerCase())
                                    );
                                })
                                .map((item, index) => (
                                    <DataCard searchQuery={searchQuery} key={index} index={index} item={item} />

                                    // <View
                                    //     key={index}
                                    //     style={{ width: '80%', marginTop: 5, backgroundColor: 'lightgray', height: 'auto', alignSelf: 'center', padding: 10 }}
                                    // >
                                    //     {Object.entries(item).map(([key, value], subIndex) => (
                                    //         value !== null && (
                                    //             // <View key={subIndex} style={{ marginBottom: 5 }}>
                                    //             //     <Text>{key}: {value}</Text>
                                    //             // </View>
                                    //             <DataCard key={key} value={value}/>
                                    //         )
                                    //     ))}
                                    // </View>
                                ))}
                        </ScrollView>
                    </View>

                    {/* <ScrollView>
                        {mappedMasterData2?.map((item, index) => (
                            <View
                                key={index}
                                style={{ width: '80%', marginTop: 5, backgroundColor: 'lightgray', height: 'auto', alignSelf: 'center', padding: 10 }}
                            >
                                {Object.entries(item).map(([key, value], subIndex) => (
                                    key.startsWith('M_Field') && value !== null && (
                                        <View key={subIndex} style={{ marginBottom: 5 }}>
                                            <Text>{fieldMapping[key]}: {value}</Text>
                                        </View>
                                    )
                                ))}
                            </View>
                        ))}
                    </ScrollView> */}



                    {/* {searchedResults ? (
                        <>
                            <SearchPopup setSearchedResults={setSearchedResults} searchQuery={searchQuery} />
                        </>
                    ) : (
                        <>
                            <View style={{ width: windowWidth * 1, height: windowHeight * 0.18, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                <View style={styles.dataInfoView}>
                                    <Text style={styles.text}>Total Receipts </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>{searchQuery ? filteredData.length : recentTransactions.length} </Text>
                                </View>

                                <View style={styles.dataInfoView}>
                                    <Text style={styles.text}>Total collected </Text>
                                    <Text style={[styles.text, { fontSize: 26, fontFamily: 'Montserrat-Bold' }]}>₹{totalAmount}.00</Text>
                                </View>
                            </View>

                            <View style={styles.lineView}>
                                <Text style={styles.lineText}>Recent transactions </Text>
                            </View>

                            {recentTransactions && recentTransactions.length > 0 &&
                                <View>
                                    <Button icon={'arrow-up'} onPress={() => { console.log("Data sent"); ToastAndroid.show('Latest transactions has been sent successfully.', ToastAndroid.SHORT) }} labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }} style={{ marginTop: 30, width: '30%', alignSelf: 'flex-end', marginRight: 20 }} mode="contained">Send Data</Button>
                                </View>
                            }

                            <ScrollView style={{ marginTop: 20, marginBottom: 40 }}>
                                <>
                                    {recentTransactions && recentTransactions.length > 0 ? (
                                        recentTransactions.map((item, index) => (
                                            <TransactionCard searchQuery={searchQuery} item={item} key={index} index={index} />
                                        ))
                                    ) : (
                                        <Text style={[styles.text1, { margin: 'auto', marginTop: 100 }]}>No transactions yet</Text>
                                    )}
                                </>

                            </ScrollView>
                        </>
                    )} */}
                </>
            ) : (
                <>
                    <View style={{ width: windowWidth * 1, height: windowHeight * 0.1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Searchbar
                            placeholder="Search by Name or A/C No"
                            onChangeText={setSearchQuery}
                            // loading={true}
                            value={searchQuery}
                            autoFocus={searchedResults}
                            onIconPress={() => { setSearchedResults(false), setSearchQuery(''), Keyboard.dismiss() }}
                            icon={searchedResults ? 'arrow-left-thin' : 'magnify'}
                            iconColor={COLORS.primary}
                            onPress={() => { setSearchedResults(true) }}
                            elevation={1}
                            style={{
                                width: '80%',
                                alignSelf: 'center',
                                // marginTop: 20,
                                backgroundColor: '#FFFFFF',
                                elevation: 15,
                            }}
                        />
                        <Pressable onPress={() => { navigation.navigate('Profile') }}>
                            <MaterialCommunityIcons2 name='user-circle' style={{ elevation: 5 }} elevation={5} color={COLORS.primary} size={45} />
                        </Pressable>
                    </View>

                    <View style={styles.notFound}>
                        <MaterialCommunityIcons name='cloud-off-outline' style={{ marginBottom: 20 }} color={COLORS.primary} size={50} />
                        <Text style={styles.text1}>Data not found !</Text>
                        <View style={styles.getData}>
                            <Button loading={loading} disabled={loading} labelStyle={{ fontFamily: 'Montserrat-Bold', fontSize: 18 }} style={{ marginTop: 30, width: '50%' }} mode="contained" onPress={() => handleGetData()}>
                                Get Data
                            </Button>
                        </View>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    dashView: {
        width: windowWidth * 1,
        height: windowHeight * 1,
        backgroundColor: '#FFFFFF'
    },
    text1: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: COLORS.gray
    },
    notFound: {
        width: windowWidth * 0.8,
        height: windowHeight * 0.80,
        // backgroundColor: COLORS.lightGrey,
        alignSelf: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    getData: {
        width: windowWidth * 1,
        height: windowHeight * 0.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: COLORS.primary
    },
    dataInfoView: {
        width: '45%',
        height: 120,
        borderRadius: 10,
        // alignSelf: 'center',
        // marginTop: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#eef2fa',
        elevation: 2
    },
    text: {
        fontFamily: 'Montserrat-SemiBold',
        color: COLORS.gray,
        marginLeft: 10
    },
    lineView: {
        marginTop: 20,
        width: windowWidth * 0.85,
        height: windowHeight * 0.02,
        alignSelf: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary
    },
    lineText: {
        position: 'absolute',
        top: 5,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Montserrat-Bold',
        color: COLORS.gray,
        alignSelf: 'flex-start',
        fontSize: 16
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
    modalView: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        marginTop: 1,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 20,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    cloudIcon: {
        marginBottom: 20,
    },
})
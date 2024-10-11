import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataCard from './DataCard';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { database } from '../../data/database';

export default function SearchPopup(props) {
    const { modalVisible, setModalVisible, searchQuery } = props;
    // const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState(data);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = data.filter((item) => {
            const name = item[8]?.toLowerCase();
            const accNumber = item[0];
            return name.includes(query) || accNumber.includes(query);
        });
        setFilteredData(filtered);
    }, [searchQuery]);

    useEffect(() => {
        setLoading(true);
    }, [isFocused])

    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data])

    useEffect(() => {
        const getMasterData = async () => {
            try {
                const masterData = database.collections.get('master_table');
                // console.log("fetched data mster table", masterData)
                masterData.query().observe()?.forEach(item => {
                    let temp = [];
                    item?.forEach(data => {
                        temp.push(data._raw);
                    });
                    setData(temp);
                    setFilteredData(temp);
                    setLoading(false);

                    // console.log("all items in master table  =>>>", temp[2].M_Field10)
                })
            } catch (e) {
                console.error('Failed to fetch data from AsyncStorage', e);
            }
        };
        getMasterData();
    }, [isFocused]);

    // useEffect(() => {
    //     const checkAsyncStorageForData = async () => {
    //         try {
    //             const storedData = await AsyncStorage.getItem('customerData');
    //             if (storedData !== null) {
    //                 let data = JSON.parse(storedData); // Ensure JSON parsing

    //                 // Add unique ID to each item
    //                 // data = data.map(item => {
    //                 //     const id = Math.random().toString(36).substring(2, 7);
    //                 //     return [...item, id]; // Add ID as the last element
    //                 // });
    //                 setData(data);
    //                 setFilteredData(data);
    //                 await AsyncStorage.setItem('customerData', JSON.stringify(data));
    //                 // console.log('Retrieved data from AsyncStorage with IDs xc:',data);
    //                 // console.log(data);
    //                 setLoading(false);
    //             }
    //         } catch (e) {
    //             console.error('Failed to fetch data from AsyncStorage', e);
    //         }
    //         // getFileContent();
    //     };

    //     checkAsyncStorageForData();
    // }, [isFocused]);

    useEffect(() => {
        const handleBackPress = () => {
            props.setSearchedResults(false)
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.main}>

            <ScrollView style={styles.scrollView}>
                {loading ? (
                    //   <ActivityIndicator
                    //     animating={true}
                    //     color={COLORS.primary}
                    //     size="large"
                    //   />
                    <>
                        {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((v, i) => (
                            <View key={i} style={{ marginVertical: 10, width: '80%', display: 'flex', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <SkeletonPlaceholder backgroundColor={COLORS.primaryAccent} highlightColor={COLORS.white} borderRadius={4}>
                                    <SkeletonPlaceholder.Item marginLeft={'auto'} flexDirection="row" alignItems="center">
                                        <SkeletonPlaceholder.Item width={80} height={60} borderRadius={5} />
                                        <SkeletonPlaceholder.Item width={'67%'} marginLeft={20}>
                                            <SkeletonPlaceholder.Item width={'85%'} height={20} />
                                            <SkeletonPlaceholder.Item width={'65%'} marginTop={6} height={20} />
                                        </SkeletonPlaceholder.Item>
                                    </SkeletonPlaceholder.Item>
                                </SkeletonPlaceholder>
                            </View>
                        ))}
                    </>
                ) : (
                    filteredData?.map((item, index) => (
                        <DataCard searchQuery={searchQuery} item={item} key={index} index={index} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    scrollView: {
        width: windowWidth * 1,
        // height: windowHeight * 0.5,
        backgroundColor: '#FFFFFF',
        marginBottom: 50
    }
});

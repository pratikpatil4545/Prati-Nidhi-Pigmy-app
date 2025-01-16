import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, BackHandler } from 'react-native';
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataCard from './DataCard';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { XMLParser } from 'fast-xml-parser';

const MemoizedDataCard = React.memo(DataCard);

export default function SearchPopup(props, { route }) {
    const { modalVisible, setModalVisible, searchQuery } = props;
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleItemsCount, setVisibleItemsCount] = useState(10); // Initially render 10 items
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [refreshData, setRefreshData] = useState(false);
    // console.log("propss ", props)

    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            const query = searchQuery.trim().toLowerCase();
            const filtered = data.filter((item) => {
                const name = item.EnglishName?.toLowerCase();
                const accNumber = `${item.GLCode}${item.AccountNo}`.toLowerCase();
                return name.includes(query) || accNumber.includes(query);
            });
            setFilteredData(filtered);
        }, 300); // Delay the filter logic by 300ms to debounce

        return () => clearTimeout(debounceSearch);
    }, [searchQuery, data]);
 
    useEffect(() => {
        setLoading(true);
    }, [isFocused]);

    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data]);

    const getMasterData = async () => {
        try {

            const savedData = await AsyncStorage.getItem('dataObject');

            if (savedData) {
                const dataObject = JSON.parse(savedData);
                setData(dataObject.MstrData?.MstrRecs);
                setFilteredData(dataObject.MstrData?.MstrRecs);
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
            console.log('Failed to fetch data from AsyncStorage', e);
            Alert.alert('Failed to fetch data from Local Storage');
        }
    };

    useEffect(() => {
        getMasterData();
    }, [isFocused]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (route?.params?.refreshData) {
                setRefreshData(true);
                navigation.setParams({ refreshData: false });
            }
        });

        return unsubscribe;
    }, [navigation, route?.params]);


    useEffect(() => {
        const handleBackPress = () => {
            props.setSearchedResults(false);
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, []);
 
    const renderItem = useCallback(({ item, index }) => (
        <MemoizedDataCard
            maxAmountLimit={props.maxAmountLimit}
            BranchName={props.BranchName}
            BranchCode={props.BranchCode}
            collectionAllowed={props.collectionAllowed}
            multipleCollection={props.multipleCollection}
            searchQuery={searchQuery}
            item={item}
            key={index}
            index={index}
        />
    ), [props, searchQuery]);


    const loadMoreItems = () => {
        if (visibleItemsCount < filteredData.length) {
            setVisibleItemsCount(prevCount => prevCount + 10); // Load more when reaching the end
        }
    };

    return (
        <View style={styles.main}>
            {loading ? (
                <>
                    {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((v, i) => (
                        <View key={i} style={styles.skeletonContainer}>
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
                <View style={{marginBottom: windowHeight * 0.10}}>
                    <FlatList
                        data={filteredData.slice(0, visibleItemsCount)} // Only render the visible items
                        renderItem={renderItem}
                        keyExtractor={(item) => item.AccountNo.toString()} // Use unique key (e.g., AccountNo)
                        onEndReached={loadMoreItems} // Load more when reaching the end
                        onEndReachedThreshold={0.5} // Trigger when the list is scrolled halfway to the end
                        ListFooterComponent={() => (visibleItemsCount < filteredData.length ? <LoadingIndicator /> : null)}
                        initialNumToRender={5} // Render fewer items initially
                        maxToRenderPerBatch={10}
                    />
                </View>
            )}
        </View>
    );
}

const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
        <SkeletonPlaceholder backgroundColor={COLORS.primaryAccent} highlightColor={COLORS.white} borderRadius={4}>
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                <SkeletonPlaceholder.Item width={80} height={60} borderRadius={5} />
                <SkeletonPlaceholder.Item width={'67%'} marginLeft={20}>
                    <SkeletonPlaceholder.Item width={'85%'} height={20} />
                    <SkeletonPlaceholder.Item width={'65%'} marginTop={6} height={20} />
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
    </View>
);

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    skeletonContainer: {
        marginVertical: 10,
        width: '80%',
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

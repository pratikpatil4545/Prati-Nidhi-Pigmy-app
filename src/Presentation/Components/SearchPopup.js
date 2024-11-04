import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, BackHandler } from 'react-native';
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataCard from './DataCard';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function SearchPopup(props) {
    const { modalVisible, setModalVisible, searchQuery } = props;
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleItemsCount, setVisibleItemsCount] = useState(10); // Initially render 10 items
    const isFocused = useIsFocused();

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = data.filter((item) => {
            const name = item.EnglishName?.toLowerCase();
            const accNumber = item.AccountNo;
            return name.includes(query) || accNumber.includes(query);
        });
        setFilteredData(filtered);
    }, [searchQuery]);

    useEffect(() => {
        setLoading(true);
    }, [isFocused]);

    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data]);

    useEffect(() => {
        const getMasterData = async () => {
            try {
                setData(props.mappedMasterData);
                setFilteredData(props.mappedMasterData);
                setLoading(false);
            } catch (e) {
                console.error('Failed to fetch data from AsyncStorage', e);
            }
        };
        getMasterData();
    }, [isFocused]);

    useEffect(() => {
        const handleBackPress = () => {
            props.setSearchedResults(false);
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, []);

    const renderItem = ({ item, index }) => (
        <DataCard BranchName={props.BranchName} BranchCode={props.BranchCode} collectionAllowed={props.collectionAllowed} multipleCollection={props.multipleCollection} searchQuery={searchQuery} item={item} key={index} index={index} />
    );

    const loadMoreItems = () => {
        if (visibleItemsCount < filteredData.length) {
            setVisibleItemsCount(prevCount => prevCount + 10); // Load 10 more items when the end is reached
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
                <FlatList
                    data={filteredData.slice(0, visibleItemsCount)} // Only render the visible items
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={loadMoreItems} // Load more when reaching the end
                    onEndReachedThreshold={0.5} // Trigger when the list is scrolled halfway to the end
                    ListFooterComponent={() => (visibleItemsCount < filteredData.length ? <LoadingIndicator /> : null)}
                />
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

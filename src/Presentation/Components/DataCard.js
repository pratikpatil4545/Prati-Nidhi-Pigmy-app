import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DataCard(props) {

  const [openingBalance, setOpeningBalance] = useState(null);
  const [mobileNumber, setmobileNumber] = useState(null);
  // console.log("opening balance", openingBalance)
  const navigation = useNavigation();
  // console.log("searchQuery", props)

  const orderedKeys = [
    { key: 'GLText', label: 'Account Type' },
    { key: 'AccountNo', label: 'Account No' },
    { key: 'EnglishName', label: 'Name' },
    { key: 'ThisMthBal', label: 'Opening Bal' },
    { key: 'AccOpenDt', label: 'Opening Date' },
    { key: 'LienAmt', label: 'Lien Amount' },
    { key: 'Mobile1', label: 'Mobile' },
  ];

  const handlePress = () => {
    // setModalVisible(true);
    // navigation.navigate('UserProfile', props,openingBalance);
    navigation.navigate('UserProfile', {
      ...props, // Spread the existing props
      openingBalance: openingBalance, // Add openingBalance to the params
      mobileNumber: mobileNumber
    });
  };

  // const shouldDisplayItem = (item, searchQuery) => {
  //   if (!searchQuery) return true;

  //   const query = searchQuery.trim();
  //   const combinedAccountNo = `${item.GLCode}${item.AccountNo}`.trim();

  //   const isMatch = combinedAccountNo.includes(query);

  //   if (query.length > 1 && combinedAccountNo.length > 1) {
  //     const regex = new RegExp(query, 'i');
  //     return regex.test(combinedAccountNo);
  //   }
  //   return isMatch;
  // };

  const shouldDisplayItem = (item, searchQuery) => {
    if (!searchQuery) return true;

    const query = searchQuery.trim();
    const combinedAccountNo = `${item.GLCode}${item.AccountNo}`.trim();

    // Check for matches in both combinedAccountNo and EnglishName
    const isAccountMatch = combinedAccountNo.includes(query);
    const isNameMatch = item.EnglishName?.toLowerCase().includes(query.toLowerCase());

    // Use regex for partial matching if the query is longer than 1 character
    if (query.length > 1) {
      const regex = new RegExp(query, 'i');
      return regex.test(combinedAccountNo) || regex.test(item.EnglishName || '');
    }

    return isAccountMatch || isNameMatch;
  };


  const HighlightedText = ({ text, query }) => {
    if (!query) return <Text>{text}</Text>;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={index} style={{ backgroundColor: 'yellow', color: 'black' }}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };


  const HighlightedAccNo = ({ glCode, accNo, query }) => {
    const combinedAccountNo = glCode !== '0' ? `${glCode}-${accNo}` : accNo;
    return (
      <HighlightedText text={combinedAccountNo} query={query} />
    );
  };

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      try {
        const transactionTable = JSON.parse(await AsyncStorage.getItem('transactionTable')) || [];

        const calculateCollectionSum = (accountNo) => {
          return transactionTable
            .filter(entry => entry.AccountNo === accountNo)
            .reduce((sum, entry) => sum + (parseFloat(entry.Collection) || 0), 0);
        };

        const collectionAddorSub = (accountNo) => {
          return transactionTable.filter(entry => entry.AccountNo === accountNo);
        };

        const totalCollectionSum = calculateCollectionSum(props.item.AccountNo);
        const addorSub = collectionAddorSub(props.item.AccountNo);

        let newOpeningBalance;

        if (addorSub[0]?.IsAmtAdd === '1') {
          newOpeningBalance = parseFloat(props.item.ThisMthBal || 0) + totalCollectionSum;
        } else if (addorSub[0]?.IsAmtAdd === '0') {
          newOpeningBalance = parseFloat(props.item.ThisMthBal || 0) - totalCollectionSum;
        } else {
          newOpeningBalance = parseFloat(props.item.ThisMthBal || 0);
        }

        if (!totalCollectionSum) {
          newOpeningBalance = parseFloat(props.item.ThisMthBal || 0);
        }

        setOpeningBalance(newOpeningBalance.toFixed(2));

        const mobileNumber = transactionTable.find(entry => entry.AccountNo === props.item.AccountNo)?.MobileNo;
        setmobileNumber(mobileNumber || '');
      } catch (error) {
        Alert.alert("Error in fetchDataAndCalculate:", error);
      }
    };

    fetchDataAndCalculate();
  }, [props.item.AccountNo, props.item.ThisMthBal]);

  return (
    <View style={styles.mainView}>
      {shouldDisplayItem(props.item, props.searchQuery) && (
        <Pressable onPress={handlePress} key={props.index} style={styles.card}>
          <View style={styles.cardView}>
            <View style={styles.left}>
              <Text
                style={[
                  styles.text,
                  {
                    color: COLORS.white,
                    alignSelf: 'center',
                    fontFamily: 'Montserrat-Bold',
                    fontSize: 16,
                  },
                ]}
              >
                Sr. No. : {props.index + 1}
              </Text>
            </View>
            <View style={styles.right}>
              {orderedKeys.map(({ key, label }, subIndex) => {
                let value = props.item[key];

                // Handle Opening Balance specifically
                if (key === 'ThisMthBal') {
                  value = openingBalance || props.item[key];
                }

                // Handle AccountNo concatenation
                if (key === 'AccountNo') {
                  value = `${props.item.GLCode}${props.item.AccountNo}`;
                }

                // Skip rendering if value is '0' or falsy (null, undefined, or '')
                if (!value || value === '0') {
                  if (key === 'Mobile1') return null; // Skip Mobile1 if its value is '0'
                  return null; // Skip other fields with '0' or empty values
                }

                return (
                  <View key={subIndex} style={{ marginBottom: 5 }}>
                    <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
                      {label}:{' '}
                      <Text style={[styles.text, { color: COLORS.darkGrey }]}>
                        {key === 'AccountNo' ? (
                          <HighlightedAccNo
                            glCode={props.item.GLCode}
                            accNo={props.item.AccountNo}
                            query={props.searchQuery}
                          />
                        ) : (
                          <>
                            {key === 'EnglishName' ? (
                              <HighlightedText text={value.toString()} query={props.searchQuery} />
                            ) : (
                              <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
                                <Text style={[styles.text, { color: COLORS.darkGrey }]}> {value} </Text>
                              </Text>
                            )}
                          {/*  <HighlightedText text={value.toString()} query={props.searchQuery} /> */}
                          </>
                        )
                        }
                      </Text>
                    </Text>
                  </View>
                );
              })}
              {/* Show the mobile number from state */}
              {/* {mobileNumber && (
                <View style={{ marginBottom: 5 }}>
                  <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
                    Mobile:{' '}
                    <Text style={[styles.text, { color: COLORS.darkGrey }]}>
                      {mobileNumber}
                    </Text>
                  </Text>
                </View>
              )} */}
              {(props.item.Mobile1 === '0') && mobileNumber && (
                <View style={{ marginBottom: 5 }}>
                  <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
                    Mobile:{' '}
                    <Text style={[styles.text, { color: COLORS.darkGrey }]}>
                      {mobileNumber}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      )}
    </View>


    // <View style={styles.mainView}>
    //   <Pressable onPress={handlePress} key={props.index} style={styles.card}>
    //     <View style={styles.cardView}>
    //       <View style={styles.left}>
    //         <Text
    //           style={[
    //             styles.text,
    //             {
    //               color: COLORS.white,
    //               alignSelf: 'center',
    //               fontFamily: 'Montserrat-Bold',
    //               fontSize: 16,
    //             },
    //           ]}
    //         >
    //           Sr. No. : {props.index + 1}
    //         </Text>
    //       </View>
    //       <View style={styles.right}>
    //         {shouldDisplayItem(props.item.GLCode, props.item.AccountNo, props.searchQuery) &&
    //           orderedKeys.map(({ key, label }, subIndex) => {
    //             let value = key === 'ThisMthBal' ? openingBalance : props.item[key];

    //             if (!value || value === '0') {
    //               if (key === 'Mobile1') return null;
    //               return null;
    //             }

    //             if (key === 'AccountNo') {
    //               return (
    //                 <View key={subIndex} style={{ marginBottom: 5 }}>
    //                   <HighlightedAccNo
    //                     glCode={props.item.GLCode}
    //                     accNo={props.item.AccountNo}
    //                     query={props.searchQuery}
    //                     label={label}
    //                   />
    //                 </View>
    //               );
    //             }

    //             return (
    //               <View key={subIndex} style={{ marginBottom: 5 }}>
    //                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
    //                   {label}:{' '}
    //                   <Text style={[styles.text, { color: COLORS.darkGrey }]}>
    //                     {key === 'ThisMthBal'
    //                       ? openingBalance
    //                         ? openingBalance
    //                         : props.item.ThisMthBal
    //                       : <HighlightedText text={value} query={props.searchQuery} />}
    //                   </Text>
    //                 </Text>
    //               </View>
    //             );
    //           })}
    //       </View>
    //     </View>
    //   </Pressable>
    // </View>
    // <View style={styles.mainView}>
    //   <Pressable onPress={handlePress} key={props.index} style={styles.card}>
    //     <View style={styles.cardView}>
    //       <View style={styles.left}>
    //         <Text
    //           style={[
    //             styles.text,
    //             {
    //               color: COLORS.white,
    //               alignSelf: 'center',
    //               fontFamily: 'Montserrat-Bold',
    //               fontSize: 16,
    //             },
    //           ]}
    //         >
    //           Sr. No. : {props.index + 1}
    //         </Text>
    //       </View>
    //       <View style={styles.right}>
    //         {orderedKeys.map(({ key, label }, subIndex) => {
    //           let value = key === 'ThisMthBal' ? openingBalance : props.item[key];

    //           if (!value || value === '0') {
    //             if (key === 'Mobile1') return null;
    //             return null;
    //           }

    //           if (key === 'AccountNo') {
    //             return (
    //               <View key={subIndex} style={{ marginBottom: 5 }}>
    //                 <HighlightedAccNo
    //                   glCode={props.item.GLCode}
    //                   accNo={props.item.AccountNo}
    //                   query={props.searchQuery}
    //                   label={label}
    //                 />
    //               </View>
    //             );
    //           }

    //           return (
    //             <View key={subIndex} style={{ marginBottom: 5 }}>
    //               <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
    //                 {label}:{' '}
    //                 <Text style={[styles.text, { color: COLORS.darkGrey }]}>
    //                   {key === 'ThisMthBal' ? openingBalance ? openingBalance: props.item.ThisMthBal
    //                     : <HighlightedText text={value} query={props.searchQuery} />}
    //                 </Text>
    //               </Text>
    //             </View>
    //           );
    //         })}
    //       </View>
    //     </View>
    //   </Pressable>
    // </View>
    // <View style={styles.mainView}>
    //   <Pressable onPress={() => { handlePress() }} key={props.index} style={styles.card}>
    //     <View style={styles.cardView}>
    //       <View style={[styles.left]}>
    //         <Text style={[styles.text, { color: COLORS.white, alignSelf: 'center', fontFamily: 'Montserrat-Bold', fontSize: 16 }]}>
    //           {props.index + 1}
    //         </Text>
    //       </View>
    //       <View style={styles.right}>
    //         {Object.entries(props.item).map(([key, value], subIndex) => (
    //           value !== '' && value !== undefined && value !== '0' && (
    //             <View key={subIndex} style={{ marginBottom: 5 }}>
    //               {key === 'EnglishName' ? (
    //                 <HighlightedText name={value} keyName={key} query={props.searchQuery} />
    //               ) : key === 'AccountNo' ? (
    //                 props.item.GLCode && props.item.GLCode !== '0' ? null : (
    //                   <HighlightedAccNo
    //                     glCode="0"
    //                     accNo={props.item.AccountNo}
    //                     keyName="AccountNo"
    //                     query={props.searchQuery}
    //                   />
    //                 )
    //               ) : key === 'GLCode' && props.item.GLCode !== '0' ? (
    //                 <HighlightedAccNo
    //                   glCode={props.item.GLCode}
    //                   accNo={props.item.AccountNo}
    //                   keyName="AccountNo"
    //                   query={props.searchQuery}
    //                 />
    //               ) : (
    //                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
    //                   {key}:<Text style={[styles.text, { color: COLORS.darkGrey }]}> {value} </Text>
    //                 </Text>
    //               )}
    //             </View>
    //           )
    //         ))}
    //       </View>
    //     </View>
    //   </Pressable>
    // </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainView: {
    width: windowWidth * 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  card: {
    width: windowWidth * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 8,
    overflow: 'hidden',
    flexGrow: 1, // Allow the card to grow with content
  },
  text: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardView: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: "center",
  },
  left: {
    width: '100%',
    minHeight: 50, // Give some space for the index
    borderBottomWidth: 2.5,
    borderStyle: 'dashed',
    borderBottomColor: COLORS.white,
    backgroundColor: COLORS.primaryAccent,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 10,
  },
  right: {
    marginLeft: 10,
    width: '90%',
    flexShrink: 1, // Ensure content does not overflow
    alignItems: 'flex-start', // Align the content properly
    marginTop: 'auto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: windowWidth * 0.9,
    display: 'flex',
    padding: 30,
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
    borderRadius: 15,
  },
  modalText: {
    fontSize: 16,
    marginHorizontal: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
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

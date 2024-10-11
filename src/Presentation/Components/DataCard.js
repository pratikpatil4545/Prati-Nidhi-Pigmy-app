// import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
// import React, { useState } from 'react'
// import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
// import { Button, TextInput } from 'react-native-paper';

// export default function DataCard(props) {

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalVisible2, setModalVisible2] = useState(false);
//   const [amount, setAmount] = useState(null);

//   const handlePress = () => {
//     setModalVisible(true);
//   };

//   const handleSubmit = () => {
//     console.log(`Submitted amount: ${amount} for ${props.item[8]}`);
//     if (amount) {
//       setModalVisible2(true);
//       // setModalVisible(false);
//     }
//     else {
//       ToastAndroid.show('Please enter amount', ToastAndroid.SHORT);
//     }
//   };

//   const handleCancel = () => {
//     setModalVisible(false);
//   };

//   const handleSubmit2 = () => {
//     console.log(`Submitted amount: ${amount} for ${props.item[8]}`);
//     // if (amount) {
//     setModalVisible2(false);
//     setModalVisible(false);
//     setAmount(null);
//     // }
//     // else {
//     ToastAndroid.show('Amount Collected Successfully.', ToastAndroid.SHORT);
//     // }
//   };

//   const handleCancel2 = () => {
//     setModalVisible2(false);
//   };

//   return (
//     <View style={styles.mainView}>

//       <Pressable onPress={() => { handlePress() }} key={props.index} style={styles.card}>
//         <View style={styles.cardView}>
//           <View style={styles.left}>

//             {/* <Text style={[styles.text, { fontSize: 11, marginBottom: 10 }]}>Last Collections:</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[1]}</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[2]}</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[3]}</Text>
//           <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[4]}</Text> */}

//           </View>

//           <View style={styles.right}>
//             <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontSize:16, fontFamily: 'Montserrat-SemiBold' }}>No: </Text>          {props.index + 1}</Text>
//             <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontSize:16, fontFamily: 'Montserrat-SemiBold' }}>Date: </Text>      {props.item[10]}</Text>
//             <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontSize:16, fontFamily: 'Montserrat-SemiBold' }}>Name: </Text>    {props.item[8]}</Text>
//             <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontSize:16, fontFamily: 'Montserrat-SemiBold' }}>A/C No: </Text>  {props.item[3]}</Text>
//           </View>
//         </View>

//       </Pressable>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={handleCancel}
//       >
//         <StatusBar
//           barStyle={'light-content'}
//           backgroundColor={'rgba(0, 0, 0, 0.5)'}
//         />
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView}>
//             {/* <View style={styles.modalCard}>
//               <Text style={styles.modalText}>Name: {props.item[8]}</Text>
//               <Text style={styles.modalText}>Balance: {props.item[4]}</Text>
//               <Text style={styles.modalText}>A/C No.: {props.item[3]}</Text>
//               <Text style={styles.modalText}>Date: {props.item[10]}</Text>
//             </View>

//             <TextInput
//               label="Enter amount"
//               mode='outlined'
//               outlineColor='#8ABCF9'
//               value={amount}
//               keyboardType='numeric'
//               onChangeText={text => setAmount(text)}
//               style={{ width: "100%", marginBottom: 20, marginTop: 20 }}
//               outlineStyle={{ borderRadius: 15, fontFamily: "Montserrat-Bold" }}
//               contentStyle={{ fontFamily: "Montserrat-Regular" }}
//             />
//             <View style={styles.buttonContainer}>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleSubmit} >Submit</Button>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleCancel} >Cancel</Button>
//             </View> */}

//             <View style={[styles.modalCard, { backgroundColor: COLORS.white, marginTop: 0, elevation: 2 }]}>
//               <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30 }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold' }}>Name: </Text>         {props.item[8]}</Text>
//               <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30 }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold' }}>Balance: </Text>     {props.item[4]}</Text>
//               <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30 }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold' }}>A/C No.: </Text>      {props.item[3]}</Text>
//               <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30 }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold' }}>Date: </Text>           {props.item[10]}</Text>
//             </View>

//             <TextInput
//               label="Enter amount"
//               mode='outlined'
//               outlineColor='#8ABCF9'
//               value={amount}
//               keyboardType='numeric'
//               onChangeText={text => setAmount(text)}
//               style={{ width: "100%", marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white }}
//               outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
//               contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
//             />
//             <View style={styles.buttonContainer}>
//               <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit} >Submit</Button>
//               <Button style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleCancel} >Cancel</Button>
//             </View>

//           </View>
//         </View>
//       </Modal>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible2}
//         onRequestClose={handleCancel2}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView}>
//             <View>
//               <Text>Please check and confirm</Text>
//               <Text>Name: {props.item[8]} </Text>
//               <Text>Old balance {props.item[4]} Rs</Text>
//               <Text>Amount collected: {amount} Rs</Text>
//               <Text>Total Amount: 1800 Rs</Text>
//             </View>
//             <View style={styles.buttonContainer}>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleSubmit2} >Confirm</Button>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleCancel2} >Cancel</Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   mainView: {
//     width: windowWidth * 1,
//     height: windowHeight * 0.18,
//     // backgroundColor: 'green',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   card: {
//     width: windowWidth * 0.85,
//     height: windowHeight * 0.15,
//     display: "flex",
//     // flexDirection: 'row',
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     // marginBottom: 5,
//     // marginTop: 15,
//     alignSelf: 'center',
//     elevation: 8,
//     overflow: 'hidden'
//   },
//   text: {
//     fontSize: 14,
//     color: COLORS.primary,
//     // marginBottom: 4,
//     fontFamily: 'Montserrat-SemiBold'
//   },
//   cardView: {
//     width: '100%',
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: "center",
//     // backgroundColor: COLORS.primary,

//   },
//   left: {
//     width: '5%',
//     minHeight: '70%',
//     maxHeight: '70%',
//     // borderRightWidth: 2,
//     borderStyle: 'dashed',
//     borderRightColor: COLORS.primary,
//     backgroundColor: COLORS.white,
//     marginTop: 'auto',
//     display: 'flex',
//     justifyContent: 'space-evenly',
//     alignItems: 'flex-start',
//     paddingLeft: 25
//     // marginBottom: 'auto'
//     // justifyContent: 'center'
//   },
//   right: {
//     marginLeft: 10,
//     width: '80%',
//     height: '100%',
//     display: 'flex',
//     justifyContent: 'space-evenly',
//     // backgroundColor:'red',
//     marginTop: 'auto'
//     // alignItems: 'center'
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalView: {
//     width: windowWidth * 0.9,
//     // height: windowHeight * 0.5,
//     display: 'flex',
//     padding: 30,
//     paddingBottom: 50,
//     paddingTop: 50,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalCard: {
//     width: '100%',
//     height: 150,
//     backgroundColor: COLORS.primary,
//     display: 'flex',
//     justifyContent: 'center',
//     borderRadius: 15
//   },
//   modalText: {
//     fontSize: 16,
//     marginHorizontal: 10,
//     marginBottom: 10,
//     // marginLeft: 10,
//     alignSelf: 'flex-start',
//     fontFamily: 'Montserrat-Regular',
//     color: '#FFFFFF'
//   },
//   input: {
//     width: '100%',
//     padding: 10,
//     borderWidth: 1,
//     borderColor: 'gray',
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   }
// });



// Main backup  ; 


// import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
// import React, { useState } from 'react'
// import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
// import { Button, TextInput } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';

// export default function DataCard(props) {

//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalVisible2, setModalVisible2] = useState(false);
//   const [amount, setAmount] = useState(null);
//   console.log("searchQuery", props.item)

//   const handlePress = () => {
//     // setModalVisible(true);
//     navigation.navigate('UserProfile',props);
//   };

//   const handleSubmit = () => {
//     // console.log('Submitted amount'. ${amount} for ${props.item[8]});
//     if (amount) {
//       setModalVisible2(true);
//       // setModalVisible(false);
//     }
//     else {
//       ToastAndroid.show('Please enter amount', ToastAndroid.SHORT);
//     }
//   };

//   const handleCancel = () => {
//     setModalVisible(false);
//   };

//   const handleSubmit2 = () => {
//     // console.log(Submitted amount: ${amount} for ${props.item[8]});
//     // if (amount) {
//     setModalVisible2(false);
//     setModalVisible(false);
//     setAmount(null);
//     // }
//     // else {
//     ToastAndroid.show('Amount Collected Successfully.', ToastAndroid.SHORT);
//     // }
//   };

//   const handleCancel2 = () => {
//     setModalVisible2(false);
//   };

//   const HighlightedText = ({ name, query }) => {
//     if (!query) {

//       return <Text style={[styles.text, { color: COLORS.darkGrey }]}> <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Name: </Text>    {name}</Text>;
//     }

//     const regex = new RegExp(`(${query})`, 'gi'); // Create a regex to match the query
//     const parts = name.split(regex); // Split the name based on the query

//     return (
//       <Text style={[styles.text, { color: COLORS.darkGrey }]}>
//         <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>Name: </Text>
//         {parts.map((part, index) =>
//           part.toLowerCase() === query.toLowerCase() ? ( // Check if the part matches the query
//             <Text key={index} style={{ backgroundColor: 'yellow' }}>{part}</Text> // Highlighted style
//           ) : (

//             <Text key={index}>{part}</Text>
//           )
//         )}
//       </Text>
//     );
//   };

//   const HighlightedAccNo = ({ name, query }) => {
//     if (!query) {
//       return <Text style={[styles.text, { color: COLORS.darkGrey }]}> <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>A/C No: </Text>  {name}</Text>;
//     }

//     const regex = new RegExp(`(${query})`, 'gi'); // Create a regex to match the query
//     const parts = name.split(regex); // Split the name based on the query

//     return (
//       <Text style={[styles.text, { color: COLORS.darkGrey }]}>
//         <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>A/C No: </Text>
//         {parts.map((part, index) =>
//           part.toLowerCase() === query.toLowerCase() ? ( // Check if the part matches the query
//             <Text key={index} style={{ backgroundColor: 'yellow' }}>{part}</Text> // Highlighted style
//           ) : (
//             <Text key={index}>{part}</Text>
//           )
//         )}
//       </Text>
//     );
//   };

//   return (
//     <View style={styles.mainView}>

//       <Pressable onPress={() => { handlePress() }} key={props.index} style={styles.card}>
//         <View style={styles.cardView}>
//           <View style={styles.left}>

//             {/* <Text style={[styles.text, { fontSize: 11, marginBottom: 10 }]}>Last Collections:</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[1]}</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[2]}</Text>
//             <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[3]}</Text>
//           <Text style={[styles.text,{color: COLORS.darkGrey}]}>{props.item[4]}</Text> */}
//             <Text style={[styles.text, { color: COLORS.white, alignSelf: 'center', fontFamily: 'Montserrat-Bold', fontSize: 16, }]}> {props.index + 1}</Text>

//             <Text style={[styles.text, { color: COLORS.white, alignSelf: 'center', fontFamily: 'Montserrat-Bold', fontSize: 16 }]}> {props.item?.M_Field11}</Text>
//           </View>

//           <View style={styles.right}>
//             <HighlightedText name={props.item?.M_Field2} query={props.searchQuery} />
//             <HighlightedAccNo name={props.item?.M_Field1} query={props.searchQuery} />

//             {/* <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary }}>Name: </Text>   {props.item[8]}</Text> */}
//             {/* <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary }}>A/C No: </Text>  {props.item[3]}</Text> */}
//           </View>
//         </View>

//       </Pressable>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={handleCancel}
//       >
//         <StatusBar
//           barStyle={'light-content'}
//           backgroundColor={'rgba(0, 0, 0, 0.5)'}
//         />
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView}>
//             {/* <View style={styles.modalCard}>
//               <Text style={styles.modalText}>Name: {props.item[8]}</Text>
//               <Text style={styles.modalText}>Balance: {props.item[4]}</Text>
//               <Text style={styles.modalText}>A/C No.: {props.item[3]}</Text>
//               <Text style={styles.modalText}>Date: {props.item[10]}</Text>
//             </View>

//             <TextInput
//               label="Enter amount"
//               mode='outlined'
//               outlineColor='#8ABCF9'
//               value={amount}
//               keyboardType='numeric'
//               onChangeText={text => setAmount(text)}
//               style={{ width: "100%", marginBottom: 20, marginTop: 20 }}
//               outlineStyle={{ borderRadius: 15, fontFamily: "Montserrat-Bold" }}
//               contentStyle={{ fontFamily: "Montserrat-Regular" }}
//             />
//             <View style={styles.buttonContainer}>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleSubmit} >Submit</Button>
//               <Button style={{ width: '45%', marginTop: 20 }} mode="contained" onPress={handleCancel} >Cancel</Button>
//             </View> */}

//             <View style={[styles.modalCard, { backgroundColor: COLORS.white, marginTop: 0, elevation: 2, display: 'flex', flexDirection: 'row' }]}>
//               <View style={{ width: '40%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold' }}>Last Collections: </Text>
//               </View>
//               <View style={{ width: '60%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30, }]}>{props.item[5]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30, }]}>{props.item[4]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30, }]}>{props.item[3]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', marginLeft: 30, }]}>{props.item[2]}</Text>
//               </View>
//             </View>

//             <View style={[styles.modalCard, { backgroundColor: COLORS.white, marginTop: 20, elevation: 2, display: 'flex', flexDirection: 'row' }]}>
//               <View style={{ width: '35%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Name: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Balance: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>A/C No.: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Date: </Text>
//               </View>
//               <View style={{ width: '65%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center'}}>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium' }]}>{props.item[8]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium' }]}>{props.item[4]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium' }]}>{props.item[3]}</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium' }]}>{props.item[10]}</Text>
//               </View>
//             </View>

//             <TextInput
//               label="Enter amount"
//               mode='outlined'
//               outlineColor='#8ABCF9'
//               value={amount}
//               keyboardType='numeric'
//               onChangeText={text => setAmount(text)}
//               style={{ width: "100%", marginBottom: 20, fontSize: 18, marginTop: 20, backgroundColor: COLORS.white }}
//               outlineStyle={{ borderRadius: 15, fontSize: 18, color: COLORS.darkGrey, fontFamily: "Montserrat-Bold", }}
//               contentStyle={{ fontFamily: "Montserrat-SemiBold", }}
//             />
//             <View style={styles.buttonContainer}>
//               <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit} >Submit</Button>
//               <Button style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleCancel} >Cancel</Button>
//             </View>

//           </View>
//         </View>
//       </Modal>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible2}
//         onRequestClose={handleCancel2}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView}>
//             <Text style={[styles.modalText, { color: COLORS.black, fontFamily: 'Montserrat-SemiBold', }]}>Please check and confirm!</Text>
//             <View style={[styles.modalCard, { backgroundColor: COLORS.white, marginTop: 20, elevation: 2, display: 'flex', flexDirection: 'row' }]}>
//               <View style={{ width: '50%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Name: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Old balance: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Amount collected: </Text>
//                 <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-Bold', marginHorizontal: 10, marginBottom: 10 }}>Total Amount: </Text>
//               </View>
//               <View style={{ width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', }]}>{props.item[8]} </Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', }]}>{props.item[4]} Rs</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', }]}>{amount} Rs</Text>
//                 <Text style={[styles.modalText, { color: COLORS.darkGrey, fontFamily: 'Montserrat-Medium', }]}>{parseFloat(props.item[4]) + parseInt(amount)} Rs</Text>
//               </View>
//             </View>
//             <View style={[styles.buttonContainer, { marginTop: 20 }]}>
//               <Button style={{ width: '48%', marginTop: 5 }} mode="contained" labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} onPress={handleSubmit2} >Confirm</Button>
//               <Button style={{ width: '48%', marginTop: 5, borderColor: COLORS.primaryAccent }} labelStyle={{ fontSize: 16, fontFamily: 'Montserrat-Bold' }} mode="outlined" onPress={handleCancel2} >Cancel</Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   mainView: {
//     width: windowWidth * 1,
//     height: windowHeight * 0.15,
//     // backgroundColor: 'green',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   card: {
//     width: windowWidth * 0.85,
//     height: windowHeight * 0.13,
//     display: "flex",
//     // flexDirection: 'row',
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     // marginBottom: 5,
//     // marginTop: 15,
//     alignSelf: 'center',
//     elevation: 8,
//     overflow: 'hidden'
//   },
//   text: {
//     fontSize: 14,
//     color: COLORS.primary,
//     // marginBottom: 4,
//     fontFamily: 'Montserrat-SemiBold'
//   },
//   cardView: {
//     width: '100%',
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: "center",
//     // backgroundColor: COLORS.primary,

//   },
//   left: {
//     width: '32%',
//     minHeight: '100%',
//     maxHeight: '100%',
//     borderRightWidth: 2.5,
//     borderStyle: 'dashed',
//     borderRightColor: COLORS.white,
//     backgroundColor: COLORS.primaryAccent,
//     // borderTopRightRadius: 50,
//     // borderBottomRightRadius: 50,
//     marginTop: 'auto',
//     display: 'flex',
//     justifyContent: 'space-evenly',
//     alignItems: 'flex-start',
//     paddingRight: 10
//     // marginBottom: 'auto'
//     // justifyContent: 'center'
//   },
//   right: {
//     marginLeft: 10,
//     width: '60%',
//     height: '100%',
//     display: 'flex',
//     justifyContent: 'space-evenly',
//     // backgroundColor:'red',
//     marginTop: 'auto'
//     // alignItems: 'center'
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalView: {
//     width: windowWidth * 0.9,
//     // height: windowHeight * 0.5,
//     display: 'flex',
//     padding: 30,
//     paddingBottom: 50,
//     paddingTop: 30,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalCard: {
//     width: '100%',
//     height: 150,
//     backgroundColor: COLORS.primary,
//     display: 'flex',
//     justifyContent: 'center',
//     borderRadius: 15
//   },
//   modalText: {
//     fontSize: 16,
//     marginHorizontal: 10,
//     marginBottom: 10,
//     // marginLeft: 10,
//     alignSelf: 'flex-start',
//     fontFamily: 'Montserrat-Regular',
//     color: '#FFFFFF'
//   },
//   input: {
//     width: '100%',
//     padding: 10,
//     borderWidth: 1,
//     borderColor: 'gray',
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',

//   }
// });






// New one  ;






import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function DataCard(props) {

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [amount, setAmount] = useState(null);
  // console.log("searchQuery", props.item)

  const handlePress = () => {
    // setModalVisible(true);
    navigation.navigate('UserProfile', props);
  };

  const handleSubmit = () => {
    // console.log('Submitted amount'. ${amount} for ${props.item[8]});
    if (amount) {
      setModalVisible2(true);
      // setModalVisible(false);
    }
    else {
      ToastAndroid.show('Please enter amount', ToastAndroid.SHORT);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit2 = () => {
    // console.log(Submitted amount: ${amount} for ${props.item[8]});
    // if (amount) {
    setModalVisible2(false);
    setModalVisible(false);
    setAmount(null);
    // }
    // else {
    ToastAndroid.show('Amount Collected Successfully.', ToastAndroid.SHORT);
    // }
  };

  const handleCancel2 = () => {
    setModalVisible2(false);
  };

  const HighlightedText = ({ name, query, keyName }) => {
    if (!query) {
      return <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{keyName}: </Text>{name}</Text>;
    }
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = name.split(regex); 
    return (
      <Text style={[styles.text, { color: COLORS.darkGrey }]}>
        <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{keyName}: </Text>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? ( 
            <Text key={index} style={{ backgroundColor: 'yellow' }}>{part}</Text> 
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const HighlightedAccNo = ({ name, query, keyName }) => {
    if (!query) {
      return <Text style={[styles.text, { color: COLORS.darkGrey }]}><Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{keyName}: </Text>{name}</Text>;
    }
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = name.split(regex); 
    return (
      <Text style={[styles.text, { color: COLORS.darkGrey }]}>
        <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{keyName}: </Text>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? ( 
            <Text key={index} style={{ backgroundColor: 'yellow' }}>{part}</Text> 
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };



  return (
    <View style={styles.mainView}>

      <Pressable onPress={() => { handlePress() }} key={props.index} style={styles.card}>
        <View style={styles.cardView}>
          <View style={styles.left}>
            <Text style={[styles.text, { color: COLORS.white, alignSelf: 'center', fontFamily: 'Montserrat-Bold', fontSize: 16, }]}> {props.index}</Text>
          </View>
          <View style={styles.right}>
            {Object.entries(props.item).map(([key, value], subIndex) => (
              value !== null && (
                <View key={subIndex} style={{ marginBottom: 5 }}>
                  {key === 'Name in English ' ? (
                    <>
                      <HighlightedText name={value} keyName={key} query={props.searchQuery} />
                    </>
                  ) : (
                    <>
                      {key === 'Account number  ' ? (
                        <HighlightedAccNo name={value} keyName={key} query={props.searchQuery} />
                      ) : (
                        <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{key}:<Text style={[styles.text, { color: COLORS.darkGrey }]}> {value} </Text></Text>
                      )}
                    </>
                  )}
                </View>
              )
            ))}
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
    // marginBottom: 5
  },
  mainView: {
    width: windowWidth * 1,
    height: 'auto',
    // backgroundColor: 'green',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    // marginBottom: 95

  },
  card: {
    width: windowWidth * 0.85,
    height: windowHeight * 0.43,
    display: "flex",
    // flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    // marginBottom: 25,
    // marginTop: 15,
    alignSelf: 'center',
    elevation: 8,
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
    flexDirection: 'column',
    alignItems: "center",
    // backgroundColor: COLORS.primary,

  },
  left: {
    width: '100%',
    minHeight: '20%',
    maxHeight: '20%',
    borderBottomWidth: 2.5,
    borderStyle: 'dashed',
    borderBottomColor: COLORS.white,
    backgroundColor: COLORS.primaryAccent,
    // borderTopRightRadius: 50,
    // borderBottomRightRadius: 50,
    // marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingRight: 10,
    overflow: 'hidden'
    // marginBottom: 'auto'
    // justifyContent: 'center'
  },
  right: {
    marginLeft: 10,
    width: '90%',
    height: '80%',
    display: 'flex',
    justifyContent: 'space-evenly',
    // backgroundColor:'red',
    marginTop: 'auto'
    // alignItems: 'center'
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
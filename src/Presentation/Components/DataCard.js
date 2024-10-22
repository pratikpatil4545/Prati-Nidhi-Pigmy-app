import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ToastAndroid, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function DataCard(props) {

  const navigation = useNavigation();
  // console.log("searchQuery", props.item)

  const handlePress = () => {
    // setModalVisible(true);
    navigation.navigate('UserProfile', props);
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

  const HighlightedAccNo = ({ glCode, accNo, query, keyName }) => {
    const combinedValue = glCode !== '0' ? `${glCode}${accNo}` : accNo; 

    if (!query) {
      return (
        <Text style={[styles.text, { color: COLORS.darkGrey }]}>
          <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>{keyName}: </Text>
          {combinedValue}
        </Text>
      );
    }

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = combinedValue.split(regex);

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
          <View style={[styles.left]}>
            <Text style={[styles.text, { color: COLORS.white, alignSelf: 'center', fontFamily: 'Montserrat-Bold', fontSize: 16 }]}>
              {props.index + 1}
            </Text>
            {/* {props.collectButton && (props.item?.IsAmtToBeAdded === 'True') &&
              <Button
                labelStyle={{ fontFamily: 'Montserrat-Bold', fontSize: 12 }}
                // style={{ marginTop: 30, width: '50%' }}
                mode="contained"
              // onPress={handleGetData}
              >
                Collect Payment {props.item?.IsAmtToBeAdded}
              </Button>
            } */}
          </View>
          <View style={styles.right}>
            {Object.entries(props.item).map(([key, value], subIndex) => (
              // Only render the item if the value is not empty, undefined, or '0'
              value !== '' && value !== undefined && value !== '0' && (
                <View key={subIndex} style={{ marginBottom: 5 }}>
                  {key === 'EnglishName' ? (
                    <HighlightedText name={value} keyName={key} query={props.searchQuery} />
                  ) : key === 'AccountNo' || key === 'GLCode' ? (
                    // Pass both GLCode and AccountNo for highlighting
                    <HighlightedAccNo
                      glCode={props.item.GLCode}
                      accNo={props.item.AccountNo}
                      keyName="AccountNo"
                      query={props.searchQuery}
                    />
                  ) : (
                    <Text style={{ color: COLORS.primary, fontFamily: 'Montserrat-SemiBold' }}>
                      {key}:<Text style={[styles.text, { color: COLORS.darkGrey }]}> {value} </Text>
                    </Text>
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

import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React from 'react'
import { COLORS, windowHeight, windowWidth } from '../../Common/Constants'

export default function Navbar() {
    return (
        <View style={styles.navbar}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
            <Text style={{fontFamily: 'Montserrat-Regular'}}>Navbar</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        width: windowWidth * 1,
        height: windowHeight * 0.06,
        backgroundColor: COLORS.primary
    }
})
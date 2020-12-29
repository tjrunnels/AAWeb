import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState }  from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Animated} from 'react-native';

const ProjectorUI = () => {
    var topBid = 210;
    var percent = (topBid/800) * 100
    var pBarWidth = ''.concat(percent.toFixed(2), '%')

    return (
        <View style={styles.container}>

            {/* Item info */}
                <View style={{height:150, marginBottom:0, backgroundColor: '#fff', width: 850, alignSelf: 'center', marginBottom: 200}}>
                    <Text style={styles.itemDescription}>Current Auction</Text> 
                    <Text style={styles.itemTitle}>Lake Cabin Getaway</Text>
                    <Text style={styles.itemDescription}>Enjoy a weekend in the beautiful hills of North Carolina in this log cabin house.  Any weekend in the month of March, head on up for family, fishing, and fun while supporting the mission of hannah's home</Text> 
                </View>

            {/* Current Bid info
                <View style={{height:100, margin:100, backgroundColor: '#fff'}}>
                        
                        <Text style={styles.bidTags}>Highest Bid:</Text> 
                        <Text style={styles.bidPrice}>$110</Text> 
                        <Text style={styles.bidTags}>Goal: $800</Text> 
                </View> */}
            

            <View style={styles.progressBarBackground}>
                <Animated.View style={[StyleSheet.absoluteFill], {backgroundColor: '#377be6', width: pBarWidth, borderTopLeftRadius: 60, borderBottomLeftRadius: 60 }}>
                    <Text style={styles.progressBarText}>$1,250</Text>
                </Animated.View>
            </View>
        
            <Text style={{textAlign: 'center'}}>{percent}%</Text>
        </View>

    );
}
export default ProjectorUI


const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#ffffff" },

    message: {  marginBottom: 15 },
    input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
    preButtonsText: {color: '#000', fontSize: 25, textAlign: "left", fontWeight: 'bold', padding: 10, marginBottom: 10},
    buttons: { height: 50, backgroundColor: '#6b8bd6', borderRadius:10 , padding: 10, marginBottom: 10, minWidth: 140},
    buttonsText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
    messageauthor: { fontSize: 12, color: '#a8a69e' },
    messageBody: {fontSize: 16, color: '#fff',  borderRadius: 45, padding:8},
    bodyHolder: {borderRadius:10, backgroundColor: '#6b8bd6'},
    
    progressBarBackground: { height: 80, width: '90%', backgroundColor: '#c4c4c4', borderColor: '#000', borderWidth: 0, borderRadius: 60, flexDirection:"row", alignSelf: 'center' },
    progressBarForeground: {backgroundColor: '#377be6', borderTopLeftRadius: 60, borderBottomLeftRadius: 60 , justifyContent: 'center'},
    progressBarText:       {fontSize: 30, fontWeight: "bold", textAlign: 'center', color: '#ffffff', marginTop: 20},

    itemTitle:          { fontSize: 70, fontWeight: "bold", textAlign: 'center'},
    itemDescription:    { fontSize: 20, color: '#676c75', textAlign: 'center'},
    bidPrice:           { fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags:            { fontSize: 20, color: '#7c838f', textAlign: 'center'},

    buttons:            { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 10, width: '90%', alignSelf: 'center'},
    buttonsText:        { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags:         { fontSize: 15, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView:         { marginBottom: 5},


  })
  


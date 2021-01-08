

import React, { useEffect, useState, Component } from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';
import BidUI from './BidUI';

import { withAuthenticator, S3Image } from 'aws-amplify-react-native'; 
import { Authenticator } from 'aws-amplify-react';




const MobileApp = () => {
    const [stage, setStage] = useState(0)

    return (
        <View>
            {stage == 0 ? 
                <View>
                    <Text style={styles.centerTextBoth} onPress={() => {setStage(1)}}>WElcome to the Hnanahs home cacut app</Text>
                </View>
        
                : <Authenticator><Text>hey</Text></Authenticator>
                }

        </View>
    );
};

export default MobileApp



const InitialGreeting = () => {

    return (
        <View style={{textAlign: 'center'}}>
            <Text style={styles.centerTextBoth}>WElcome to the Hnanahs home cacut app</Text>

        </View>
    );
};



const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: "#e8dcdd" },
    message: {  marginBottom: 15 },
    input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
    preButtonsText: {color: '#000', fontSize: 25, textAlign: "left", fontWeight: 'bold', padding: 10, marginBottom: 10},
    buttons: { height: 50, backgroundColor: '#6b8bd6', borderRadius:10 , padding: 10, marginBottom: 10, minWidth: 140},
    buttonsText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
    messageauthor: { fontSize: 12, color: '#a8a69e' },
    messageBody: {fontSize: 16, color: '#fff',  borderRadius: 45, padding:8},
    bodyHolder: {borderRadius:10, backgroundColor: '#6b8bd6'},
    bigText: {fontSize: 25, color: "#3cbcde", padding: 20, fontWeight: 'bold'},
    titleText: {fontSize: 20, color: "#000000", textAlign: 'center',  paddingBottom: 20, fontWeight: 'bold'},
    tomSquare: {fontSize: 10, backgroundColor: "#03dffc", textAlign: 'center', textAlignVertical: 'center', width: 100, height: 100, borderWidth: 3, margin: 4},
    centerTextBoth: {textAlign: 'center', textAlignVertical: 'center', paddingTop:40},
    centerTextBothBID: {fontSize: 23, textAlign: 'center', textAlignVertical: 'center', paddingTop:35},
  
    bidList: {margin: 10, maxHeight: 200},
    smolBean: {fontSize: 18, textAlign: 'center'},
    rowTitle: { fontSize: 20, fontWeight: 'bold', paddingTop: 20 },
  
    paddleSquareOn:    {fontSize: 10, backgroundColor: "#6cba96", textAlign: 'center', textAlignVertical: 'center', width: 100, height: 100, borderWidth: 3, margin: 4},
    paddleSquareOff:   {fontSize: 10, backgroundColor: "#bd766a", textAlign: 'center', textAlignVertical: 'center', width: 100, height: 100, borderWidth: 3, margin: 4},
  
  
  });
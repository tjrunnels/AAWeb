import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState }  from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Animated, Image} from 'react-native';

import InsetShadow from 'react-native-inset-shadow'

//from backend 
import {listBids, setRandomItem, evaluateOneBid, evaluateAllBids } from './Backend'

//from amazon
import { Item, Bids} from './models';
import { DataStore } from '@aws-amplify/datastore';



//tomdo: delete.  for testing
var testItem = new Item({
    "Title": "Test Item",
    "Description": "Ever wondered what the sunset looks like offshore?  Well you can find out with this exclusive boat excursion.  Just you, a guest, and the captain will sail out an hour before sunset and come back in 30 minutes after, drinks included.",
    "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"],
    "ItemToBids": []
  })
  
// const initialState = { amount: 0, user: '' }


const ProjectorUI = () => {

    const [bids, setBids] = useState([0]);
    const [currentItem, setCurrentItem] = useState(testItem); //tomdo: take out testItem
    const [maxBid, setMaxBid] = useState({amount: 0, user: ''})
    const [goal, setGoal] = useState(800)


    let [percent, setPercent] = useState(5);
    let animation = useRef(new Animated.Value(0));



    useEffect(() => {
        listBids(setBids) 
        
        
            console.log("useEffect for [] running... note: should happen just once")
            const bidSubscription = DataStore.observe(Bids).subscribe(msg => {
              listBids(setBids)
              //these are the only three opTypes: INSERT, UPDATE, and DELETE
              if (msg.opType == 'INSERT') {
                console.log(msg.opType, "element:", msg.element);
                //evaluateOneBid(msg.element)
              }
                if (msg.opType == 'UPDATE')
                console.log("Updated: ", msg.element.id, " to: ", msg.element);
              else if (msg.opType == 'DELETE')
                console.log("Deleted: ", msg.element.id)
              
            });
            const itemSubscription = DataStore.observe(Item).subscribe(msg => {
              if (msg.opType == 'INSERT') {
                console.log("Just recieved new item:", msg.element.Title);
                setCurrentItem(msg.element);

              }
            })
          }, [])


    //currentItem effect
    useEffect(() => {
        evaluateAllBids(currentItem, bids, setMaxBid)
        //update goal
    }, [currentItem])
  
    //bids effect
    useEffect(() => {
        evaluateOneBid(bids[bids.length - 1], currentItem, maxBid,setMaxBid)
    }, [bids])

    
    var shadowWidth =  ''.concat((100-percent).toFixed(2), '%')
    var shadowMargin =  ''.concat((percent).toFixed(2), '%')     

    //maxbid effect
    useEffect(() => {
        let temp = ((maxBid.amount/goal) * 100) //tomdo: change 800 to goal 
        if(temp < 5) { temp = 5}
        setPercent(temp)
        shadowWidth =  ''.concat((100-percent).toFixed(2), '%')
        shadowMargin =  ''.concat((percent).toFixed(2), '%')
        console.log("ProjectorUI: useEffect for maxBid run")
    }, [maxBid])


      //for progress bar animation
    useEffect(() => {
        Animated.timing(animation.current, {
        toValue: percent,
        duration: 300
        }).start();
    },[percent])

    let pBarWidth = animation.current.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp"
    })




    return (
        <View style={styles.container}>

            {/* Item info */}
                <View style={{height:150, marginBottom:0, backgroundColor: '#fff', width: 850, alignSelf: 'center', marginBottom: 200, marginTop: 30}}>
                    <Text style={styles.itemDescription}>Current Auction</Text> 
                    <Text style={styles.itemTitle} onPress={() => {setRandomItem(setCurrentItem)}}>{currentItem.Title}</Text>
                    <Text style={styles.itemDescription}>{currentItem.Description}</Text> 
                </View>

            {/* Current Bid info
                <View style={{height:100, margin:100, backgroundColor: '#fff'}}>
                        
                        <Text style={styles.bidTags}>Highest Bid:</Text> 
                        <Text style={styles.bidPrice}>$110</Text> 
                        <Text style={styles.bidTags}>Goal: $800</Text> 
                </View> */}
            
            <View style={styles.progressBar}>
              

                <View style={styles.progressBarBackground}>
                    <Animated.View style={[StyleSheet.absoluteFill], {backgroundColor: '#377be6', width: pBarWidth, borderTopLeftRadius: 60, borderBottomLeftRadius: 60 }}>
                        <Text style={styles.progressBarText}>${maxBid.amount}</Text>
                    </Animated.View>
                </View>
                <InsetShadow left={false} right={false} bottom={false} shadowRadius={20} shadowOpacity={.60} containerStyle={{width: shadowWidth, height: '100%',position: 'absolute', left: 0, top: 0, marginLeft: shadowMargin, borderTopRightRadius: 60, borderBottomRightRadius: 60,  }}>
                    <View></View>
                </InsetShadow>
            </View>

            <Text style={styles.goalText}>Goal: ${goal}</Text>
            
            <View style={styles.imageView}>
                <Image source={{uri: currentItem.Photos[0]}} style={styles.imageStyle}/> 
                <Image source={{uri: "https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/logCabinImageDemo.jpeg"}} style={styles.imageStyle}/> 
                <Image source={{uri: "https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"}} style={styles.imageStyle}/> 
            </View>
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
    

    progressBar:           {  height:80, margin: 40},
    progressBarBackground: { height: '100%', width: '100%',  position: 'absolute', left: 0, top: 0, backgroundColor: '#c4c4c4', borderColor: '#000', borderWidth: 0, borderRadius: 60, alignSelf: 'center', flexDirection:"row" },
    progressBarForeground: { height: '100%', left: 0, top: 0, backgroundColor: '#377be6', borderTopLeftRadius: 40, borderBottomLeftRadius: 60 , justifyContent: 'center'},
    progressBarText:       {fontSize: 40, fontWeight: "bold", textAlign: 'center', color: '#ffffff', marginTop: 15},
    
    goalText:              {fontSize: 50, fontWeight: "bold", textAlign: 'center', color: '#000000', marginTop: 20, marginBottom: 65},

    imageView:          { flexDirection: "row", justifyContent: "space-between" },  
    imageStyle:         { width: 610, height: 380 }, //627 × 385

    itemTitle:          { fontSize: 70, fontWeight: "bold", textAlign: 'center', marginBottom: 10},
    itemDescription:    { fontSize: 30, color: '#676c75', textAlign: 'center', margin: 10 },
    bidPrice:           { fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags:            { fontSize: 20, color: '#7c838f', textAlign: 'center'},

    buttons:            { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 10, width: '90%', alignSelf: 'center'},
    buttonsText:        { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags:         { fontSize: 15, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView:         { marginBottom: 5},


  })
  


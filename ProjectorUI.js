import React, { useEffect, useRef, useState }  from 'react';
import { StyleSheet, Text, View, Animated, Image} from 'react-native';

import InsetShadow from 'react-native-inset-shadow'

//from backend 
import {listBids, setRandomItem, evaluateOneBid, evaluateAllBids, addGoal, pushNewBid } from './Backend'

//from amazon
import { Item, Bids, Goal, Increment} from './models';
import { DataStore } from '@aws-amplify/datastore';

import WaitUI from './waitUI'



//tomdo: delete.  for testing
var testItem = new Item({
    "Title": "Test Item",
    "Description": "Ever wondered what the sunset looks like offshore?  Well you can find out with this exclusive boat excursion.  Just you, a guest, and the captain will sail out an hour before sunset and come back in 30 minutes after.",
    "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"],
    "ItemToBids": []
  })
  
// const initialState = { amount: 0, user: '' }
 const initialPopUpState = { username: '', popStyle: {} }


const ProjectorUI = () => {

    const [bids, setBids] = useState([0]);
    const [currentItem, setCurrentItem] = useState(testItem); //tomdo: take out testItem
    const [maxBid, setMaxBid] = useState({amount: 0, user: ''})
    const [goal, setGoal] = useState(800)
    const [increment, setIncrement]  = useState(10)
    const [bidderPopups, setBidderPopups] = useState(initialPopUpState)
    const [waitOverlay, setWaitOverlay] = useState(true)


    let [percent, setPercent] = useState(5);
    let pBarWidthAnimation = useRef(new Animated.Value(0));
    let [pBarStyle, setPBarStyle] = useState({color: '#377be6', radius: 0})

    const[ popImage, setPopImage] = useState()

    let springAnimation = useRef(new Animated.Value(0));
    let fadeAnimation = useRef(new Animated.Value(0));

    
   

    //#region bidderPopUp Functions
    
    function springIn() {
        springAnimation.current.setValue(0);
                                //     : maybe check if the displayed text is the same as username?
        var spring_config = {tension: 2, friction: 3,}
        Animated.spring(springAnimation.current, {
            ...spring_config,
            toValue: 4
        }).start()
    }

    function showBidder(username) {
        var popLeft = (Math.random() * 40) + 50     //small variance 
  
           

        var popTop = (Math.random() * 150) + 50 //top variance plus offset

        var popfontsize = 15;
        if((username.length + 8) > 19 )           //the 8 is for ': $45678'
            popfontsize = Math.floor(300 / (username.length + 8)) //the big number is the maxWidth


        if(Math.random() > .5)  {
            popLeft += (1600 - ((username.length/2) * (popfontsize/0.75)))     //right side of screen, pad against offscreen
        }
        else 
            popLeft += ((username.length/2) * (popfontsize/0.75))


       var popStyle = {
        // position: 'absolute',
        // transform: [{scale: springAnimation.current}],
        fontSize: popfontsize,
        left: popLeft,
        top: popTop,
       }
        lastUsername = username
        var bidderPopup = {username: username, popStyle: popStyle }
        setBidderPopups(bidderPopup)
        springIn()
    }
    var lastUsername;
    useEffect(() => {
        if(bidderPopups.username === lastUsername) return 

        const timer = setTimeout(() => fadeOut(), 4000)
        return () => clearTimeout(timer)  
    },[bidderPopups]);

    function fadeOut() {
        Animated.timing(springAnimation.current, {
          toValue: 0,
          duration: 700
        }).start();
      };
      
    //#endregion

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
              
            })
            const itemSubscription = DataStore.observe(Item).subscribe(msg => {
                if (msg.opType == 'INSERT') {
                    console.log("Just recieved new item:", msg.element.Title);
                    setCurrentItem(msg.element);
                    setWaitOverlay(false)
                }
            })
            const goalSubscription = DataStore.observe(Goal).subscribe(msg => {
                if (msg.opType == 'INSERT') {
                  console.log("Just recieved new goal:", msg.element.price);
                  setGoal(msg.element.price);
  
                }
            })
            const incrementSubscription = DataStore.observe(Increment).subscribe(msg => {
                if (msg.opType == 'INSERT') {
                  console.log("Just recieved new increment:", msg.element.Amount);
                  setIncrement(msg.element.Amount);
  
                }
            })

          }, [])


    function setOffPop() {
        if(popImage == require("./PopImages/popOnce.gif"))
            setPopImage(require("./PopImages/popOnce2.gif"))
        else
            setPopImage(require("./PopImages/popOnce.gif"))
    }

    //currentItem effect
    useEffect(() => {
        evaluateAllBids(currentItem, bids, setMaxBid, "")
        
    }, [currentItem])
  
    //bids effect
    useEffect(() => {
        evaluateOneBid(bids[bids.length - 1], currentItem, maxBid,setMaxBid, "")
    }, [bids])


    //bids effect
    useEffect(() => {
        updateBarWidths()
    }, [goal])



    //maxbid effect
    useEffect(() => {
        updateBarWidths()
        if(maxBid.amount != 0)
            showBidder(maxBid.user + ': $' + maxBid.amount)
        console.log("ProjectorUI: useEffect for maxBid run")
    }, [maxBid])

    function updateBarWidths () {
        let pCent = ((maxBid.amount/goal) * 100) 
        if(pCent < 5) { pCent = 5}
        setPercent(pCent)
    }

    //for progress bar animation
    useEffect(() => {
  
        if(percent >= 100) {
            percent = 100
            setPBarStyle({color:"#42f593", radius: 60})  //green and rounded
            setOffPop()
        }          
        else if (percent > 98)  //blue and rounded
            setPBarStyle({color:"#377be6", radius: 60})
        else                    //blue and flat (normal)
            setPBarStyle({color:"#377be6", radius: 0})


        Animated.timing(pBarWidthAnimation.current, {
            toValue: percent,
            duration: 300
            }).start();

    },[percent])
    




    let pBarWidth = pBarWidthAnimation.current.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp"
    })
    

    
    const fadeContainer = {
        position: 'absolute',
        transform: [{scale: springAnimation.current}],
        textAlign: 'left',
        justifyContent: 'center'
    }
    return (
        <View style={styles.container}>
            <Image source={popImage} style= {styles.popImage}/>

            {waitOverlay ? 
                <WaitUI>

                <TouchableOpacity style={[styles.helpSignoutButton, {backgroundColor: '#eeeeee'}]} onPress={() => { setWaitOverlay(false) }}>
                        <Text style={[styles.helpSignoutText, {color: "#eeeeee"}]}>close</Text>
                </TouchableOpacity>
                </WaitUI>
            : null}

            {/* Item info */}
                <View style={{height:200, marginBottom:0, backgroundColor: '#fff', width: 1000, alignSelf: 'center', marginBottom: 200, marginTop: 30}}>
                    <Text style={styles.currentTags}>Current Auction</Text> 
                    <Text style={styles.itemTitle} >{currentItem.Title}</Text>
                    <Text style={styles.itemDescription}>{currentItem.Description}</Text> 
                </View>



                
            <Animated.View style={[fadeContainer, bidderPopups.popStyle]} >
                <Text style={[styles.fadeText, {fontSize: bidderPopups.popStyle.fontSize}]}>{bidderPopups.username}</Text>
            </Animated.View>
        


                

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              
                <View style={styles.progressBarBackground}></View>
                
                <InsetShadow left={false} right={false} bottom={false} shadowRadius={20} shadowOpacity={.60} containerStyle={{width: '100%', padding: 40, height: '100%',position: 'absolute', left: 0, top: 0, borderTopRightRadius: 60, borderBottomRightRadius: 60, borderTopLeftRadius: 60,  }}>
                    <View></View>
                </InsetShadow>

                <Animated.View style={[StyleSheet.absoluteFill], {backgroundColor: pBarStyle.color, width: pBarWidth, borderTopLeftRadius: 60, borderBottomLeftRadius: 60,  height: '100%', borderTopRightRadius: pBarStyle.radius, borderBottomRightRadius: pBarStyle.radius}}>
                        {(maxBid.amount > 99 && percent < 6) ? <Text style={[styles.progressBarText, {fontSize: 30, marginTop: 20}]}>${maxBid.amount}</Text> :  <Text style={styles.progressBarText}>${maxBid.amount}</Text>}
                </Animated.View>
            </View>



            <View style={{flex: 1, flexDirection:'row', justifyContent: 'space-evenly', marginBottom: 80}}>
                <Text style={[styles.goalText, {position: 'absolute', left:500}]} >Goal: ${goal}</Text>           
                <Text style={[styles.currentWinner, {position: 'absolute', left:1000, top: -5}]}>Current Winner: {maxBid.user}</Text>

            </View>
            {/* Goal Text */}


            {/* Images */}
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
    container: { flex: 1, padding: 20, backgroundColor: "#ffffff", width:1920, height:1080 },

    message: {  marginBottom: 15 },
    input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
    preButtonsText: {color: '#000', fontSize: 25, textAlign: "left", fontWeight: 'bold', padding: 10, marginBottom: 10},
    buttons: { height: 50, backgroundColor: '#6b8bd6', borderRadius:10 , padding: 10, marginBottom: 10, minWidth: 140},
    buttonsText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
    messageauthor: { fontSize: 12, color: '#a8a69e' },
    messageBody: {fontSize: 16, color: '#fff',  borderRadius: 45, padding:8},
    bodyHolder: {borderRadius:10, backgroundColor: '#6b8bd6'},
    
    currentTags:            { fontSize: 25, color: '#676c75', textAlign: 'center', margin: 7 },


    progressBar:           {  height:80, margin: 40},
    progressBarBackground: { height: '100%', width: '100%',  position: 'absolute', left: 0, top: 0, backgroundColor: '#c4c4c4', borderColor: '#000', borderWidth: 0, borderRadius: 60, alignSelf: 'center', flexDirection:"row" },
    progressBarForeground: { height: '100%', left: 0, top: 0, backgroundColor: '#377be6', borderTopLeftRadius: 40, borderBottomLeftRadius: 60 , justifyContent: 'center'},
    progressBarText:       {fontSize: 40, fontWeight: "bold", textAlign: 'center', color: '#ffffff', marginTop: 15},
    
    currentWinner:         {fontSize: 40, fontWeight: "bold", textAlign: 'center', color: '#000000', marginTop: 0, marginBottom: 25},
    goalText:              {fontSize: 50, fontWeight: "bold", textAlign: 'center', color: '#000000', marginTop: -10, marginBottom: 25},

    imageView:          { flexDirection: "row", justifyContent: "space-between" },  
    imageStyle:         { width: 610, height: 380 }, //627 × 385

    itemTitle:          { fontSize: 60, fontWeight: "bold", textAlign: 'center', marginBottom: 10},
    itemDescription:    { fontSize: 27, color: '#676c75', textAlign: 'center', margin: 10 },
    bidPrice:           { fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags:            { fontSize: 20, color: '#7c838f', textAlign: 'center'},

    buttons:            { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 10, width: '90%', alignSelf: 'center'},
    buttonsText:        { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags:         { fontSize: 15, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView:         { marginBottom: 5},

    popImage: { width: 500, height: 500, position: 'absolute', left: 1550 , top: 230 },

    fadeText: { fontSize: 15, color: "#377be6", textAlign: 'right', justifyContent: 'center'},

  })
  


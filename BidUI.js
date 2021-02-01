import React, { useEffect, useState, useRef, Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated, Image} from 'react-native';

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids, Goal, Increment} from './models';


//from backend
import { listBids, listItems, setGoalToNewest , listGoals, listIncrements, evaluateAllBids, evaluateOneBid, pushNewBid, anonymousCheck, setRandomItem, addGoal, addIncrement, setIncrementToNewest} from './Backend'

//dialog box
import DialogInput from 'react-native-dialog-input';



import Amplify, { button } from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

import { Auth } from 'aws-amplify';
import HelpUI from './HelpUI';
import WaitUI from './waitUI';


//inital state and basically declaration of maxBid variable
const initialState = { amount: 0, user: '' }


//tomdo: delete.  for testing
var testItem = new Item({
  "Title": "Test Item",
  "Description": "Ever wondered what the sunset looks like offshore?  Well you can find out with this exclusive boat excursion.  Just you, a guest, and the captain will sail out an hour before sunset and come back in 30 minutes after.",
  "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"],
  "ItemToBids": []
})

const BidUI = () => {

  const [bids, setBids] = useState([]);
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [increments, setIncrements] = useState([])
  const [currentItem, setCurrentItem] = useState(testItem);   //tomdo: change tomItem to null
  const [maxBid, setMaxBid] = useState(initialState)
  const [increment, setIncrement] = useState(100)
  const [currentUser, setCurrentUser] = useState()
  const [goal, setGoal] = useState(100)
  const [customBidDialog, setCustomBidDialog] = useState(false)
  const [helpOverlay, setHelpOverlay] = useState(false)
  const [waitOverlay, setWaitOverlay] = useState(true)
  const [anonSwitch, setAnonSwitch] = useState(false)


  let cancelBarWidthAnimation = useRef(new Animated.Value(0));

  const [showCancel0, setShowCancel0] = useState(false)
    const [cancelWidth0, setCancelWidth0] = useState('0%')
    const [buttonWidth0, setButtonWidth0] = useState('100%')
  const [showCancel1, setShowCancel1] = useState(false)
    const [cancelWidth1, setCancelWidth1] = useState('0%')
    const [buttonWidth1, setButtonWidth1] = useState('100%')
  const [showCancel2, setShowCancel2] = useState(false)
    const [cancelWidth2, setCancelWidth2] = useState('0%')
    const [buttonWidth2, setButtonWidth2] = useState('100%')




  //////////////////////////////////////////
  //    on startup effect
  //////////////////////////////////////////
  useEffect(() => {
    //DataStore.clear()   //tomdo: maybe delete?

      //just for debugging
      console.log("useEffect for [] running... note: should happen just once")

      //get the initial list of Bids from AWS
      listBids(setBids) 
      // listItems(setItems)
      // listGoals(setGoals)
      // listIncrements(setIncrements)


      //subscribe to Bids
      console.log('subscribing....')
      const bidSubscription = DataStore.observe(Bids).subscribe(msg => {
        
        //these are the only three opTypes: INSERT, UPDATE, and DELETE
        if (msg.opType == 'INSERT') {
          listBids(setBids)
          console.log(msg.opType, "element:", msg.element);
          setCustomBidDialog(false) 
          setShowCancel0(false)
          setShowCancel1(false)
          setShowCancel2(false)
        }
        if (msg.opType == 'UPDATE')
          console.log("Updated: ", msg.element.id) //("Updated: ", msg.element.id, " to: ", msg.element);
        else if (msg.opType == 'DELETE')
          console.log("Deleted: ", msg.element.id)
        
      });
      console.log('...done')

      //subscribe to Item
      const itemSubscription = DataStore.observe(Item).subscribe(msg => {
        if (msg.opType == 'INSERT') {
          console.log("Just recieved new item:", msg.element.Title);
          setCurrentItem(msg.element);
          setWaitOverlay(false)
        }
      })

      //subscribe to goal
      const goalSubscription = DataStore.observe(Goal).subscribe(msg => {
        if (msg.opType == 'INSERT') {
          console.log("Just recieved new goal:", msg.element.price);
          setGoal(msg.element.price);

        }
      })
      //subscribe to Increment
      const incrementSubscription = DataStore.observe(Increment).subscribe(msg => {
          if (msg.opType == 'INSERT') {
            console.log("Just recieved new increment:", msg.element.Amount);
            setIncrement(msg.element.Amount);

          }
      })

      
      //get the user
      Auth.currentAuthenticatedUser().then(user => setCurrentUser(user.username));
      

  }, [])

 
      
  //////////////////////////////////////////
  //    currentItem effect
  //////////////////////////////////////////
  useEffect(() => {
    console.log('running useEffect for currentItem')
    evaluateAllBids(currentItem, bids, setMaxBid, currentUser)
    setGoalToNewest(setGoal)
    setIncrementToNewest(setIncrement)

  }, [currentItem])




  //////////////////////////////////////////
  //    bids effect
  //////////////////////////////////////////
  useEffect(() => {
    console.log('running useEffect for bids')
    if(bids.length > 0)
      evaluateOneBid(bids[bids.length - 1], currentItem, maxBid, setMaxBid, currentUser)
  }, [bids])




  const hightestBidderColorSwapStyle  = {
    color: maxBid.user == currentUser ? '#34c776' : null,
  }
  const hightestBidderBackgroundColorSwapStyle  = {
    backgroundColor: maxBid.user == currentUser ? '#34c776' : '#377be6',
  }



useEffect(() => {
  showCancel0? setCancelWidth0('33%') : setCancelWidth0('0%')
  showCancel0? setButtonWidth0('67%') : setButtonWidth0('100%')
}, [showCancel0])

useEffect(() => {
  showCancel1? setCancelWidth1('33%') : setCancelWidth1('0%')
  showCancel1? setButtonWidth1('67%') : setButtonWidth1('100%')
}, [showCancel1])

useEffect(() => {
  showCancel2? setCancelWidth2('33%') : setCancelWidth2('0%')
  showCancel2? setButtonWidth2('67%') : setButtonWidth2('100%')
}, [showCancel2])



  //MARK: - Beginning of UI
  return (
  <View style={styles.container}>


    <TouchableOpacity style={styles.anonIcon}  onPress={() => {setAnonSwitch(!anonSwitch)}}>
    <Text style={styles.anonText}>{anonSwitch ? "Anonymous" : " "}</Text>
      {anonSwitch
        ? <Image style={{width: 40, height: 40}} source={require('./anonOn.png')}></Image>
        : <Image style={{width: 40, height: 40}} source={require('./anonOff.png')}></Image>}
    </TouchableOpacity>

    <TouchableOpacity style={styles.helpIcon}  onPress={() => {setHelpOverlay(!helpOverlay)}}>
      <Image style={{width: 35, height: 35}} source={require('./helpIcon.png')}></Image>
    </TouchableOpacity>
    {helpOverlay ? 
    <HelpUI>
      <TouchableOpacity style={styles.helpCloseButton} onPress={() => { setHelpOverlay(false) }}>
            <Text style={styles.helpButtonText}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.helpSignoutButton} onPress={() => { Auth.signOut().then(data => console.log(data)); setHelpOverlay(false) }}>
            <Text style={styles.helpSignoutText}>Sign Out of {Auth.user.username}</Text>
      </TouchableOpacity>
    </HelpUI>
    : null}

    {waitOverlay ? 
    <WaitUI>

      <TouchableOpacity style={[styles.helpSignoutButton, {backgroundColor: '#eeeeee'}]} onPress={() => { setWaitOverlay(false) }}>
            <Text style={[styles.helpSignoutText, {color: "#eeeeee"}]}>close</Text>
      </TouchableOpacity>
    </WaitUI>
    : null}


                          {/* tomdo: maybe change the width of Title or get rid of it altogether */}
    {/* Item info */}
        <ScrollView style={{maxHeight:200, height:150, marginBottom:30, backgroundColor: '#fff', textAlign: 'center'}}>  
            <Text style={[styles.itemTitle, {width: '90%', marginLeft: '5%'}]} onPress={() => {if(currentItem.Title == "Test Item") { setWaitOverlay(true) }}}>{currentItem.Title}</Text>
            <Text style={styles.itemDescription}>{currentItem.Description.length > 18600 ? currentItem.Description.substring(0,186) + '...' : currentItem.Description}</Text> 
        </ScrollView>

    <DialogInput isDialogVisible={customBidDialog}
        title={"Custom Bid Amount"}
        message={"Enter the price you want to bid"}
        hintInput = {(maxBid.amount + increment).toString()}
        textInputProps = {{autoCorrect: false, autoCapitalize: false, keyboardType: 'number-pad'}}
        submitInput={ (inputText) => {
          pushNewBid(Number.parseInt(inputText), currentItem, currentUser, anonSwitch)
          setCustomBidDialog(false)
        } }
        closeDialog={ () => {setCustomBidDialog(false)}}>
    </DialogInput>  

    {/* Current Bid info */}
    <View style={{height:100, marginBottom:10, backgroundColor: '#fff'}}>
            {/* tomdo: delete addGoal and addIncrement */}
            <Text style={[styles.bidTags, hightestBidderColorSwapStyle]} onPress={() => {addIncrement(increment + 100)}}>{maxBid.user == currentUser? "You are the Highest Bidder" : "Highest Bid:"}</Text> 
            <Text style={[styles.bidPrice, hightestBidderColorSwapStyle]}>{maxBid.amount}</Text> 
            <Text style={styles.bidTags} onPress={() => {addGoal(goal + 500)}}>Goal: ${goal}</Text> 
    </View>

    {/* horizontal line */}
    <View style={{borderBottomColor: '#bcc2cc', borderBottomWidth: 1, margin: 10}}/>







    <View> 
        <View>
          <View style={[styles.buttonView, {marginLeft: cancelWidth0, width: buttonWidth0, }]}>
            <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => 
            {  if(showCancel0) {
                      pushNewBid(((maxBid.amount) + (increment * 1)), currentItem, currentUser, anonSwitch) 
                      setShowCancel0(false)
                  } else {
                    setShowCancel0(true)
                    setShowCancel1(false)
                    setShowCancel2(false)
                  }
             }}>
              <Text style={styles.buttonsText}>{showCancel0? 'Confirm' : 'Bid'}: ${maxBid.amount + increment}{showCancel0? '?' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.buttonTags}>Increase Bid by +{increment}</Text>
          </View>

          <View style={[styles.buttonView, {width: cancelWidth0, position: 'absolute', left: 0, top: 0, }]}>
            <TouchableOpacity style={[styles.buttons, {backgroundColor: '#d93f3f', padding: 0}]} onPress={() => {setShowCancel0(false) }}>
                <Text style={[styles.buttonsText, {marginTop: 10}]}>Cancel</Text>
            </TouchableOpacity>
          </View>     
        </View>


        <View>
          <View style={[styles.buttonView, {marginLeft: cancelWidth1, width: buttonWidth1, }]}>
            <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => 
            { if(showCancel1) {
                      pushNewBid(((maxBid.amount) + (increment * 2)), currentItem, currentUser, anonSwitch) 
                      setShowCancel1(false)
                  } else {
                      setShowCancel0(false)
                      setShowCancel1(true)
                      setShowCancel2(false)
                  } }}>
              <Text style={styles.buttonsText}>{showCancel1? 'Confirm' : 'Bid'}: ${maxBid.amount + (increment * 2)}{showCancel1? '?' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.buttonTags}>Increase Bid by +{(increment * 2)}</Text>
          </View>

          <View style={[styles.buttonView, {width: cancelWidth1, position: 'absolute', left: 0, top: 0, }]}>
            <TouchableOpacity style={[styles.buttons, {backgroundColor: '#d93f3f', padding: 0}]} onPress={() => {setShowCancel1(false) }}>
                <Text style={[styles.buttonsText, {marginTop: 10}]}>Cancel</Text>
            </TouchableOpacity>
          </View>     
        </View>


        <View>
          <View style={[styles.buttonView, {marginLeft: cancelWidth2, width: buttonWidth2, }]}>
            <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => 
            { if(showCancel2) {
                      pushNewBid(((maxBid.amount) + (increment * 4)), currentItem, currentUser, anonSwitch) 
                      setShowCancel2(false)
                  } else {
                    setShowCancel0(false)
                    setShowCancel1(false)
                    setShowCancel2(true)
                  } }}>
              <Text style={styles.buttonsText}>{showCancel2? 'Confirm' : 'Bid'}: ${maxBid.amount + (increment * 4)}{showCancel2? '?' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.buttonTags}>Increase Bid by +{(increment * 4)}</Text>
          </View>

          <View style={[styles.buttonView, {width: cancelWidth2, position: 'absolute', left: 0, top: 0, }]}>
            <TouchableOpacity style={[styles.buttons, {backgroundColor: '#d93f3f', padding: 0}]} onPress={() => {setShowCancel2(false) }}>
                <Text style={[styles.buttonsText, {marginTop: 10}]}>Cancel</Text>
            </TouchableOpacity>
          </View>     
        </View>




        
        <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => 
          { 
            setCustomBidDialog(true) 
            setShowCancel0(false)
            setShowCancel1(false)
            setShowCancel2(false)
          }}>
          <Text style={styles.buttonsText}>Custom Bid</Text>
        </TouchableOpacity>  


      </View>
   
  </View>
  )


};

export default BidUI


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: "#ffffff" },




    itemTitle: {fontSize: 35, fontWeight: "bold", textAlign: 'center', marginTop: 8},
    itemDescription: {fontSize: 15, color: '#676c75', textAlign: 'center', marginTop: 8},
    bidPrice: {fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags: {fontSize: 20, color: '#7c838f', textAlign: 'center'},
    highestBidderText: {fontSize: 20, color: '#38d67f', textAlign: 'center'},

    buttons: { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 5, width: '95%', alignSelf: 'center'},
    buttonsText: { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags: {fontSize: 20, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView: { marginBottom: 5, width: '100%'},
    
    anonIcon: {position: 'absolute', right: 20, top: 30, alignItems: 'flex-end', zIndex: 1, height: 35,},
    anonText: { fontWeight: 'bold', fontSize: 9, marginBottom: -3},
  
    helpIcon: {position: 'absolute', left: 20, top: 45, zIndex: 1, width: 35, height: 35},
    helpCloseButton: { height: 40, backgroundColor: '#377be6', borderRadius:10 , padding: 8, marginTop: 10, width: '70%', alignSelf: 'center'},
    helpSignoutButton: { height: 35, backgroundColor: '#FF9900', borderRadius:10 , padding: 8, marginTop: 100, marginBottom: 40, width: '70%', alignSelf: 'center'},
    helpButtonText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
    helpSignoutText: { color: '#fff', fontSize: 15, textAlign: "center", fontWeight: 'bold'  },
  });
  

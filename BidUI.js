import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef, Component } from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Animated, Image} from 'react-native';

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids, Goal, Increment} from './models';


//from backend
import { listBids, listItems, listGoals, listIncrements, evaluateAllBids, evaluateOneBid, pushNewBid, anonymousCheck, setRandomItem, addGoal, addIncrement} from './Backend'

//dialog box
import DialogInput from 'react-native-dialog-input';



import Amplify, { button } from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

import { Auth } from 'aws-amplify';
import HelpUI from './HelpUI';


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
        listBids(setBids)
        //these are the only three opTypes: INSERT, UPDATE, and DELETE
        if (msg.opType == 'INSERT') {
          console.log(msg.opType, "element:", msg.element);
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
    evaluateAllBids(currentItem, bids, setMaxBid)
  }, [currentItem])




  //////////////////////////////////////////
  //    bids effect
  //////////////////////////////////////////
  useEffect(() => {
    console.log('running useEffect for bids')
    if(bids.length > 0)
      evaluateOneBid(bids[bids.length - 1], currentItem, maxBid, setMaxBid)
  }, [bids])




  const hightestBidderColorSwapStyle  = {
    color: maxBid.user == currentUser ? '#34c776' : null,
  }
  const hightestBidderBackgroundColorSwapStyle  = {
    backgroundColor: maxBid.user == currentUser ? '#34c776' : '#377be6',
  }


  function showConfirmButton () {

    Animated.timing(cancelBarWidthAnimation.current, {
      toValue: 80,
      duration: 350
      }).start();
  }

  function hideConfirmButton () {

    Animated.timing(cancelBarWidthAnimation.current, {
      toValue: 0,
      duration: 350
      }).start(); 
  }

  function handleBidButtonPress(incrementMultiplier) {
    
  }


  let asdfasdf = cancelBarWidthAnimation.current.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
})


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



    {/* Item info */}
        <View style={{height:150, marginBottom:30, backgroundColor: '#fff'}}>  
            <Text style={styles.itemTitle}>{currentItem.Title}</Text>
            <Text style={styles.itemDescription}>{currentItem.Description}</Text> 
        </View>

    <DialogInput isDialogVisible={customBidDialog}
        title={"Custom Bid Amount"}
        message={"Enter the price you want to bid"}
        hintInput = {(maxBid.amount + increment).toString()}
        textInputProps = {{autoCorrect: false, autoCapitalize: false, keyboardType: 'number-pad'}}
        submitInput={ (inputText) => {
          pushNewBid(Number.parseInt(inputText), currentItem, currentUser)
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
                      pushNewBid(((maxBid.amount) + (increment * 1)), currentItem, currentUser) 
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
                      pushNewBid(((maxBid.amount) + (increment * 2)), currentItem, currentUser) 
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
                      pushNewBid(((maxBid.amount) + (increment * 4)), currentItem, currentUser) 
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




 
{/* 
        <View style={styles.buttonView}>
          <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => { pushNewBid((maxBid.amount + (increment * 2)), currentItem, currentUser) }}>
            <Text style={styles.buttonsText}>Bid: ${maxBid.amount + (increment * 2)}</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +{(increment * 2)}</Text>
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={[styles.buttons, hightestBidderBackgroundColorSwapStyle]} onPress={() => { pushNewBid((maxBid.amount + (increment * 4)), currentItem, currentUser) }}>
            <Text style={styles.buttonsText}>Bid: ${maxBid.amount + (increment * 4)}</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +{(increment * 4)}</Text>
        </View>
         */}
        
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




    itemTitle: {fontSize: 35, fontWeight: "bold", textAlign: 'center'},
    itemDescription: {fontSize: 15, color: '#676c75', textAlign: 'center', marginTop: 8},
    bidPrice: {fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags: {fontSize: 20, color: '#7c838f', textAlign: 'center'},
    highestBidderText: {fontSize: 20, color: '#38d67f', textAlign: 'center'},

    buttons: { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 5, width: '95%', alignSelf: 'center'},
    buttonsText: { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags: {fontSize: 20, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView: { marginBottom: 5, width: '100%'},
    
  
    helpIcon: {position: 'absolute', left: 20, top: 40, zIndex: 1, width: 35, height: 35},
    helpCloseButton: { height: 40, backgroundColor: '#377be6', borderRadius:10 , padding: 8, marginTop: 10, width: '70%', alignSelf: 'center'},
    helpSignoutButton: { height: 35, backgroundColor: '#FF9900', borderRadius:10 , padding: 8, marginTop: 100, marginBottom: 40, width: '70%', alignSelf: 'center'},
    helpButtonText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
    helpSignoutText: { color: '#fff', fontSize: 15, textAlign: "center", fontWeight: 'bold'  },
  });
  









// const BidScreen = () => {
//   let [formState, setFormState] = useState(initialState);
//   let [messages, setMessagesLocal] = useState([]);

//   let [topBid, setTopBid] = useState(0);

//   useEffect(() => {

//     const client = new AWSAppSyncClient({
//         url: awsconfig.aws_appsync_graphqlEndpoint,
//         region: awsconfig.aws_appsync_region,
//         auth: {
//           type: AUTH_TYPE.API_KEY, // or type: awsconfig.aws_appsync_authenticationType,
//           apiKey: awsconfig.aws_appsync_apiKey,
//         }
//       });


//     console.log("useEffect for [] running... note: should happen just once")
//     fetchmessages();
//     const observable = client.subscribe({ query: gql(subscriptions.onCreateMessage)})
//         .subscribe({      
//         next: data => {
//           console.log("subscription:next running...")
//           fetchmessages();
//         },
//         error: error => {
//           console.warn(error);
//         }
//       });
//   }, [])

//   //when messages changes
//   useEffect(() => {
//     console.log("useEffect for messages running...")
//     try{
//       console.log("messages length:", messages.length);

//       //establish a local variable that can quickly change
//       var localTopBid = topBid; 

//       //if messages loaded correctly
//       if(messages.length != 0){ 
//         messages.forEach((item, index) => {
//           console.log("evaluating bid: ", item.bid, typeof item.bid, ' > ', topBid, typeof topBid, '(technically...', localTopBid)
//           //if the bid is not null, compare to max
//           if(item.bid != null && item.bid > localTopBid){
//             console.log("increaseing topBid to: ", item.bid)
//             localTopBid = item.bid
//           }
//         }) ;
//       }
//       else
//         localTopBid = 0;
//       //after running through all messages, localTopBid should be the max 
//       setTopBid(localTopBid);
//     } catch (err){ console.log('error finding and setting top bid') }
//   }, [messages]);

//   function setInput(key, value) {
//     setFormState({ ...formState, [key]: value })
//   }

//   async function fetchmessages() {
//     try {
//       const messageData = await API.graphql(graphqlOperation(queries.listMessages))
//       const initial_messages = messageData.data.listMessages.items;
//       setMessagesLocal(initial_messages); 
      
//     } catch (err) { console.log('error fetching messages') }
//   }
  

//   async function addMessageClient() {
//     try {
//       const message = { ...formState }
//       setMessagesLocal([...messages, message])
//       setFormState(initialState)
//       console.log("add: ",message);
//       await API.graphql(graphqlOperation(mutations.createMessage, {input: message}))
//     } catch (err) {
//       console.log('error creating message:', err)
//     }
//   }

//   async function addMessageClientC(_author, _body, _bid) {
//     try {
//       let message = {};
//       message.bid = _bid == null? null :  _bid;
//       message.author = _author == null? null : _author;
//       message.body = _body == null? null : _body;

//       setMessagesLocal([...messages, message])
//       console.log("add: ",message);
//       await API.graphql(graphqlOperation(mutations.createMessage, {input: message}))
//     } catch (err) {
//       console.log('error creating message (custom):', err)
//     }
//   }


//   async function deleteMessages() {
//     try {
//       console.log("starting: deleteMEssages....")
//       var i;
//       for (i = messages.length - 1; i >= 0; i--)
//       {
//         let mID =  messages[i].id;
//         await API.graphql(graphqlOperation(mutations.deleteMessage, {input: {id: mID}}))
//       }
//       console.log("worked i guesss....")
//       fetchmessages();
//     } catch (err) { console.log('error fetching messages') }
//   }

//   return (
//   <View style={styles.container}>
//     <View style={{height:300, marginBottom:20, backgroundColor: '#ddd'}}>
//         <Text style={{fontSize: 40, fontWeight: "bold", textAlign: 'center'}}>Bid: {topBid}</Text>
//         <Text style={{textAlign: 'center'}}>{messages.length}</Text>
      
//     </View>

//     <View> 
//         <View style={{flexDirection: "row"}}>
//           <Text style={styles.preButtonsText}>Increase by 05:</Text>
//           <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 5)); }}>
//             <Text style={styles.buttonsText}>Bid {topBid + 5}</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={{flexDirection: "row"}}>
//           <Text style={styles.preButtonsText}>Increase by 10:</Text>
//           <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 10)); }}>
//           <Text style={styles.buttonsText}>Bid {topBid + 10}</Text>
//         </TouchableOpacity> 
//         </View>
//         <View style={{flexDirection: "row"}}>
//           <Text style={styles.preButtonsText}>Increase by 20:</Text>
//           <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 20)); }}>
//             <Text style={styles.buttonsText}>Bid {topBid + 20}</Text>
//           </TouchableOpacity>  
//         </View>
        
        
//         <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 69)); }}>
//           <Text style={styles.buttonsText}>Custom:{'\t'}*not scripted yet*</Text>
//         </TouchableOpacity>  

//         <TouchableOpacity style={styles.buttons} onPress={() => { deleteMessages() }}>
//           <Text style={styles.buttonsText}>Delete All (just for testing)</Text>
//         </TouchableOpacity>    
        
//       </View>
   
//   </View>
//   )
  
// };


import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, Component } from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids, Goal, Increment} from './models';


//from backend
import { listBids, evaluateAllBids, evaluateOneBid, pushNewBid, anonymousCheck, setRandomItem, addGoal, addIncrement} from './Backend'


import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

import { Auth } from 'aws-amplify';


//inital state and basically declaration of maxBid variable
const initialState = { amount: 0, user: '' }


//tomdo: delete.  for testing
var testItem = new Item({
  "Title": "Test Item",
  "Description": "Ever wondered what the sunset looks like offshore?  Well you can find out with this exclusive boat excursion.  Just you, a guest, and the captain will sail out an hour before sunset and come back in 30 minutes after, drinks included.",
  "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"],
  "ItemToBids": []
})

const BidUI = () => {

  const [bids, setBids] = useState([]);
  const [currentItem, setCurrentItem] = useState(testItem);   //tomdo: change tomItem to null
  const [maxBid, setMaxBid] = useState(initialState)
  const [increment, setIncrement] = useState(100)
  const [currentUser, setCurrentUser] = useState()
  const [goal, setGoal] = useState(100)



  //////////////////////////////////////////
  //    on startup effect
  //////////////////////////////////////////
  useEffect(() => {
    //DataStore.clear()   //tomdo: maybe delete?

      //just for debugging
      console.log("useEffect for [] running... note: should happen just once")

      //get the initial list of Bids from AWS
      listBids(setBids) 

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
















  




  //MARK: - Beginning of UI
  return (
  <View style={styles.container}>

    {/* Item info */}
        <View style={{height:150, marginBottom:30, backgroundColor: '#fff'}}>
            <Text style={styles.itemTitle}>{currentItem.Title}</Text>
            <Text style={styles.itemDescription}>{currentItem.Description}</Text> 
        </View>

    {/* Current Bid info */}
    <View style={{height:100, marginBottom:10, backgroundColor: '#fff'}}>
            {/* tomdo: delete addGoal and addIncrement */}
            <Text style={styles.bidTags} onPress={() => {addIncrement(increment + 100)}}>Highest Bid:</Text> 
            <Text style={styles.bidPrice}>{maxBid.amount}</Text> 
            <Text style={styles.bidTags} onPress={() => {addGoal(goal + 500)}}>Goal: ${goal}</Text> 
    </View>

    {/* horizontal line */}
    <View style={{borderBottomColor: '#bcc2cc', borderBottomWidth: 1, margin: 20}}/>

    <View> 
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.buttons} onPress={() => { pushNewBid(((maxBid.amount) + increment), currentItem, currentUser) }}>
            <Text style={styles.buttonsText}>Bid: ${maxBid.amount + increment}</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +{increment}</Text>
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.buttons} onPress={() => { pushNewBid((maxBid.amount + (increment * 2)), currentItem, currentUser) }}>
            <Text style={styles.buttonsText}>Bid: ${maxBid.amount + (increment * 2)}</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +{(increment * 2)}</Text>
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.buttons} onPress={() => { pushNewBid((maxBid.amount + (increment * 4)), currentItem, currentUser) }}>
            <Text style={styles.buttonsText}>Bid: ${maxBid.amount + (increment * 4)}</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +{(increment * 4)}</Text>
        </View>
        
        
        <TouchableOpacity style={styles.buttons} onPress={() => { setRandomItem(setCurrentItem) }}>
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

    buttons: { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 10, width: '90%', alignSelf: 'center'},
    buttonsText: { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags: {fontSize: 15, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView: { marginBottom: 5},
  

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


import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, Component } from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';

const BidUI = () => {

  return (
  <View style={styles.container}>

    {/* Item info */}
        <View style={{height:150, marginBottom:30, backgroundColor: '#fff'}}>
            <Text style={styles.itemTitle}>Lake Cabin Getaway</Text>
            <Text style={styles.itemDescription}>Enjoy a weekend in the beautiful hills of North Carolina in this log cabin house.  Any weekend in the month of March, head on up for family, fishing, and fun while supporting the mission of hannah's home</Text> 
        </View>

    {/* Current Bid info */}
    <View style={{height:100, marginBottom:10, backgroundColor: '#fff'}}>
            
            <Text style={styles.bidTags}>Highest Bid:</Text> 
            <Text style={styles.bidPrice}>$110</Text> 
            <Text style={styles.bidTags}>Goal: $800</Text> 
    </View>

    {/* horizontal line */}
    <View style={{borderBottomColor: '#bcc2cc', borderBottomWidth: 1, margin: 20}}/>

    <View> 
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.buttons}>
            <Text style={styles.buttonsText}>Bid: $115</Text>
          </TouchableOpacity>
        <Text style={styles.buttonTags}>Increase Bid by +5</Text>
        </View>

        <View style={styles.buttonView}>
          {/* <Text style={styles.preButtonsText}>Increase by 05:</Text> */}
          <TouchableOpacity style={styles.buttons}>
            <Text style={styles.buttonsText}>Bid: $120</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +10</Text>

        </View>

        <View style={styles.buttonView}>
          {/* <Text style={styles.preButtonsText}>Increase by 05:</Text> */}
          <TouchableOpacity style={styles.buttons}>
            <Text style={styles.buttonsText}>Bid: $130</Text>
          </TouchableOpacity>
          <Text style={styles.buttonTags}>Increase Bid by +20</Text>

        </View>
        
        
        <TouchableOpacity style={styles.buttons} >
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


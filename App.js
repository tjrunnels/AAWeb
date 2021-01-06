import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, Component } from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';

//from my code
import BidUI from './BidUI'
import ProjectorUI from './ProjectorUI'

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids, Goal, Increment} from './models';

//dialog box
import DialogInput from 'react-native-dialog-input';


import { withAuthenticator, S3Image } from 'aws-amplify-react-native'; 


//backend functions
import {listBids, pushNewRandomBid, evaluateAllBids, evaluateOneBid, anonymousCheck, printTopItemFromAWS,
         setRandomItem, printTopBidsFromAWS, deleteBids, addLakeHouseItem, addFirstPitchItem, addGoal, addIncrement, pushNewBid } from './Backend'


const signUpConfig = {
  hideAllDefaults: true,
  signUpFields: [
    {
      label: 'Email',
      key: 'email',
      required: true,
      displayOrder: 1,
      type: 'string',
    },
    {
      label: 'Name',
      key: 'name',
      required: true,
      displayOrder: 3,
      type: 'string',
    },
    {
      label: 'Password',
      key: 'password',
      required: true,
      displayOrder: 2,
      type: 'password',
    },
    {
      label: 'Username',
      key: 'username',
      required: true,
      displayOrder: 4,
      type: 'string',
    },
  ],
}

// async function listBids(setBids) {
//   const thisbids = await DataStore.query(Bids, Predicates.ALL)
//   setBids(thisbids);
//   console.log('Backend: listBids finished')
// }

const initialState = { amount: 0, user: '' } 

function App() {

    const [bids, setBids] = useState([0]);
    const [currentItem, setCurrentItem] = useState();
    const [maxBid, setMaxBid] = useState(initialState)
    const [goal, setGoal] = useState(800)
    const [increment, setIncrement] = useState(100)
    const [currentPaddle, setCurrentPaddle] = useState(1)
    const [thisDialogVisible, setThisDialogVisible] = useState(false)

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

    //currentItem effect
    useEffect(() => {
      evaluateAllBids(currentItem, bids, setMaxBid)
    }, [currentItem])

     //bids effect
     useEffect(() => {
      evaluateOneBid(bids[bids.length - 1], currentItem, maxBid,setMaxBid)
    }, [bids])

    
  function returnBidAtIncrement(incCount) {
    return (maxBid.amount + (increment * incCount))
  }
  



  function returnMaxBid(bids, id) {
    var thisBids = bids.filter(function(element) {
      return element.itemID == id
    })
    if(thisBids != null) {
      console.log("comparing...")
      thisBids.array.forEach(element => {
        console.log(element.Amount, ' and')
      });
      console.log("max is ", Math.max(...thisBids))
      return Math.max(...thisBids)
    }
    else {
      return "no bids"
    }
  }

  return (

       <View style={styles.container}>
         {/* <S3Image imgKey={"logCabinImageDemo.jpeg"} style={{ width: 300, height: 100 }}  onLoad={url => console.log("loaded", url)} /> */}
         {/* <Image source={{uri: "https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/logCabinImageDemo.jpeg"}} style={{ width: 300, height: 100 }}/> */}
        {/* <Text style= {styles.titleText}>{currentItem == null ? "" : currentItem.Title}</Text>
        <Text>{currentItem == null ? "" : currentItem.Description}</Text> */}
        {currentItem == null ? <View styles={{height: 0}}/> : <Image source={{uri: currentItem.Photos[0]}} style={{ width: 300, height: 100 }}/> }
        <Text style={styles.smolBean}>Item: {currentItem == null ? "" : currentItem.Title.substring(0,20)},     MaxBid:{maxBid.amount},   Goal: {goal},    Increment: {increment}</Text>

        {/* Item Tools */}
        <Text style={styles.rowTitle}>Item tools</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addLakeHouseItem(); addGoal(800); addIncrement(100);}}
                  >LakeHouse</Text>
          </View>

          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addFirstPitchItem(); addGoal(1600); addIncrement(200); }}
                  >FirstPitch</Text>
          </View>

          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                onPress={() => {setRandomItem(setCurrentItem)}}
              >Random Item</Text>
          </View>
        </View>

        {/* Bid Tools */}
        <Text style={styles.rowTitle}>Bid tools</Text>
        <View style={{flexDirection: 'row'}}>
          {/* ----------------------------- bid buttons ----------------------------- */}
          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                   onPress={() => {;}}
              >Custom Bid !!!</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * .5)),currentItem,currentPaddle)}}
                  >{(maxBid.amount + (increment * .5))}</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 1)),currentItem,currentPaddle)}}
                  >..{(maxBid.amount + (increment * 1))}..</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 1.5)),currentItem,currentPaddle)}}
                  >{(maxBid.amount + (increment * 1.5))}</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 2)),currentItem,currentPaddle)}}
                  >..{(maxBid.amount + (increment * 2))}..</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 2.5)),currentItem,currentPaddle)}}
                  >{(maxBid.amount + (increment * 2.5))}</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 3)),currentItem,currentPaddle)}}
                  >..{(maxBid.amount + (increment * 3))}..</Text>
              </View>
          {/* <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 3.5)),currentItem,currentPaddle)}}
                  >{(maxBid.amount + (increment * 3.5))}</Text>
              </View> */}
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 4)),currentItem,currentPaddle)}}
                  >..{(maxBid.amount + (increment * 4))}..</Text>
              </View>
          {/* <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBothBID}
                    onPress={() => {pushNewBid((maxBid.amount + (increment * 4.5)),currentItem,currentPaddle)}}
                  >{(maxBid.amount + (increment * 4.5))}</Text>
              </View> */}
          {/* ----------------------------- bid buttons ----------------------------- */}


          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                onPress={deleteBids}
              >Delete All Bids</Text>
          </View>
        </View>


        {/* Other Tools */}
        <Text style={styles.rowTitle}>Other tools</Text>
        <View style={{flexDirection: 'row'}}>

          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addGoal(goal * 1.5)}}
                  >Goal + 1/2</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addGoal(goal * 2)}}
                  >Goal + Goal</Text>
              </View>
          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                   onPress={() => {;}}
              >.</Text>
          </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addIncrement(increment * 1.5)}}
                  >Inc {(increment * 1.5)}</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addIncrement(increment * 0.5)}}
                  >Inc {(increment * 0.5)}</Text>
              </View>
          <View style={styles.tomSquare}>
                  <Text style = {styles.centerTextBoth}
                    onPress={() => {addIncrement(increment + 0.25)}}
                  >Inc {(increment * 0.25)}</Text>
              </View>
          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                   onPress={() => {;}}
              >.</Text>
              </View>
          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                   onPress={() => {;}}
              >Hardset MaxBid !!!</Text>
              </View>
        </View>

        {/* Paddle Chooser */}
        <Text style={styles.rowTitle}>Other tools</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.tomSquare}>
              <Text style = {styles.centerTextBoth}
                   onPress={() => {setThisDialogVisible(true)}}
              >Paddle switcher !!!</Text>
          </View>
        </View>

        {/* <Text onPress={() => {printTopItemFromAWS(currentItem, setCurrentItem)}} style={styles.bigText}>Get Items</Text> */}
        
        <DialogInput isDialogVisible={thisDialogVisible}
            title={"DialogInput 1"}
            message={"Message for DialogInput #1"}
            hintInput = {(maxBid.amount + increment).toString()}
            textInputProps = {{autoCorrect: false, autoCapitalize: false, keyboardType: 'number-pad'}}
            submitInput={ (inputText) => {console.log(inputText); setThisDialogVisible(false)} }
            closeDialog={ () => {setThisDialogVisible(false)}}>
        </DialogInput>    


        <Text>{
            "Max Bid:" + maxBid.user + " at " + maxBid.amount
        }</Text>

        <View style={{flexDirection: 'row'}}>
        <View style= {styles.bidList}>
          <Text>---All Bids---</Text>
            <Text>There are: {bids.length}</Text>
          {/* {bids.map((item, i) => {
              return (
                <Text key={i} >Bid Item: {item.Amount}</Text>
              )
          }).sort(function (a,b) { return a.Amount < b.Amount })} */}
        </View>

        <View style= {styles.bidList}>
          <Text>---Current Item Bids---</Text>
          {bids
            .filter(function (bid) { 
              if(currentItem != null) 
                return bid.itemID == currentItem.id
              else
                return false
            })
            .map((item, i) => {
                return (
                  <Text key={i} >Bid Item: {item.Amount}</Text>
                )
            })
            .sort(function (a,b) { return a.Amount < b.Amount })}
        </View>

      </View>
    </View>

  );
}


//tomdo: change
export default App //withAuthenticator(BidUI, {includeGreetings: true});





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

});

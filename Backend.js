//for config
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids} from './models';


export async function listBids(setBids) {
    const thisbids = await DataStore.query(Bids, Predicates.ALL)
    setBids(thisbids);
    console.log('Backend: listBids finished')
  }
  

export async function pushNewBid(currentItem) {
    var bidAmount = Math.floor(Math.random() * 1000);
    var anon = (bidAmount > 500)
    await DataStore.save(
      new Bids({
        "Username": "Lorem ipsum dolor sit amet",
        "Amount": bidAmount,
        "Anonymous": anon,
        "itemID": currentItem.id
      })
    );
    console.log("Backend: new bid added");
  }

const initialState = { amount: 0, user: '' }

export function evaluateAllBids(currentItem, bids, setMaxBid) {
    if(currentItem != null) {
      var id = currentItem.id
      var thisBids = bids
          .filter(function (bid) { 
            if(currentItem != null) 
              return bid.itemID == currentItem.id
            else
              return false
          })
      console.log("thisBids length: ", thisBids.length)

      if(thisBids.length != 0) {
        console.log("comparing...")
        
        var thisMaxBid = 0
        var thisMaxBidUsername = ""
        thisBids.forEach(element => {
          if(element.Amount > thisMaxBid) {
            thisMaxBid = element.Amount
            thisMaxBidUsername = anonymousCheck(element)
          }
          console.log(element.Amount, element.Amount.type,  ' and')
        });
        setMaxBid({amount: thisMaxBid, user: thisMaxBidUsername})
      }
      else {
        console.log( "no bids")
        setMaxBid(initialState)
      }
      thisBids = []
      console.log("Backend: evaluteAllBids finished")
    }
  }


 export  function evaluateOneBid(bid, currentItem, maxBid, setMaxBid) {
    if(currentItem != null) {
      if(bid.itemID == currentItem.id && bid.Amount > maxBid.amount) {
        setMaxBid({amount: bid.Amount, user: anonymousCheck(bid)})
        alert(anonymousCheck(bid), " just bid ", bid.Amount)
      }
    }
    else {
      console.log('no item')
    }
    console.log("Backend: evalateOneBid finished for: ", bid.id)
  }


 export  function anonymousCheck(element) {
    if(element.Anonymous) {
      return 'Anonymous'
    }
    else
      return element.Username
  }


   


  export async function printTopItemFromAWS(currentItem, setCurrentItem) {
    let thisItems = await DataStore.query(Item);
    if(currentItem == null)
      setCurrentItem(thisItems[0])
    console.log(thisItems.length, thisItems[0].Title);
  }

  export async function setRandomItem(setCurrentItem) {
    let thisItems = await DataStore.query(Item);
    console.log(thisItems.length, ": items queried");
    let randItem = Math.floor(Math.random() * (thisItems.length))
    setCurrentItem(thisItems[randItem])
    console.log(thisItems.length, ": random chose ", thisItems[randItem].Title);
  }

  export async function printTopBidsFromAWS() {
    let thisBids = await DataStore.query(Bids);
    if (thisBids.length != 0)
      console.log("there are ", thisBids.length, " bids, first is: ", thisBids[0].Amount);
    else
      console.log("bids empty")
    
  }



  export async function deleteBids() {
    await DataStore.delete(Bids, Predicates.ALL);  
    console.log("Backend: all bids deleted");
  }




  export async function addLakeHouseItem() {
    await DataStore.save(
      new Item({
        "Title": "Lake House Weekend Getaway",
        "Description": "Enjoy a weekend in the beautiful hills of North Carolina in this log cabin house.  Any weekend in the month of March, head on up for family, fishing, and fun while supporting the mission of hannah's home",
        "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/logCabinImageDemo.jpeg"],
        "ItemToBids": []
      })
    );
    console.log("item added: Lake House");
  }

 

  export async function addFirstPitchItem() {
    await DataStore.save(
      new Item({
        "Title": "First Pitch at Roger Dean",
        "Description": "Live out your Tee Ball fantasy of making it to the big leauges by giving the first pitch at an upcoming Marlin's game at Roger Dean Stadium and then have front row seats for the rest of the game",
        "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/baseball.jpg"],
        "ItemToBids": []
      })
    );
    console.log("item added: Pitch");
  }
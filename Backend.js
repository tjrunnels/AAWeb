//for config
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

//from admin UI
import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Item, Bids, Goal, Increment} from './models';



export async function listBids(setBids) {
  const thisbids = await DataStore.query(Bids, Predicates.ALL)
  setBids(thisbids);
  console.log('Backend: listBids finished')
}

export async function listItems(setItems) {
  const thisItems = await DataStore.query(Item, Predicates.ALL)
  listItems(thisItems);
  console.log('Backend: listItems finished')
}


export async function listGoals() {
  const thisGoals = await DataStore.query(Goal, Predicates.ALL)
  console.log('Backend: listGoals finished')
  return thisGoals 
}

export async function setGoalToNewest(setGoal) {
  var allGoals = await listGoals()
  if(allGoals.length == 0)
    return new Goal({ "price" : 1})
  let newestGoal = allGoals[0]
  allGoals.forEach(element => {
    if(element.SubmittedAt > newestGoal.SubmittedAt)
        newestGoal = element
  });
  
  console.log('Backend: newestGoal finished: ', newestGoal)

  setGoal(newestGoal.price)
}

export async function listIncrements() {
  const thisIncrements = await DataStore.query(Increment, Predicates.ALL)
  console.log('Backend: listIncrements finished')
  return thisIncrements
}

export async function setIncrementToNewest(setIncrement) {
  var allIncrements = await listIncrements()
  if(allIncrements.length == 0)
    return new Increment({ "Amount" : 1})
  let newestIncrement = allIncrements[0]
  allIncrements.forEach(element => {
    if(element.SubmittedAt > newestIncrement.SubmittedAt)
        newestIncrement = element
  });
  
  console.log('Backend: setIncrementToNewest finished: ', newestIncrement)

  setIncrement(newestIncrement.Amount)
}
  

export async function pushNewRandomBid(currentItem) {
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




 export async function pushNewBid(amount, currentItem, currentUser, anonymous) {
    var bidAmount = amount
    if(bidAmount > 10000000)
      bidAmount = 0

    await DataStore.save(
      new Bids({
        "Username": currentUser,
        "Amount": bidAmount,
        "Anonymous": anonymous,
        "itemID": currentItem.id,
        "SubmittedAt" : new Date().toISOString()
      })
    );
    console.log("new bid added");
  }





const initialState = { amount: 0, user: '' }

  //////////////////////////////////////////
  //    - evaluate all bids - 
  //    looks at the 'bids' hook which is a list of ALL bids in AWS,
  //    filters them by if they are part of the 'currentItem',
  //    and sets the 'maxBid' hook's .Amount property 
  //////////////////////////////////////////
//tomdo:   does hardset bid need to be incoporated in evalueateALL ???
export function evaluateAllBids(currentItem, bids, setMaxBid, currentUser) {
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
        var thisMaxBidSubmittedAt = "2016"
        thisBids.forEach(element => {
          if(element.Amount == thisMaxBid) {
            if((element.SubmittedAt < thisMaxBidSubmittedAt)) {   // < less than means older
              // c:  same code as d
              thisMaxBid = element.Amount
              thisMaxBidUsername = (currentUser == element.Username ? element.Username : anonymousCheck(element))
              thisMaxBidSubmittedAt = element.SubmittedAt
            }
          }

          else if(element.Amount > thisMaxBid) {
            // d:  same code as c
            thisMaxBid = element.Amount
            thisMaxBidUsername = (currentUser == element.Username ? element.Username : anonymousCheck(element))
            thisMaxBidSubmittedAt = element.SubmittedAt
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

  //////////////////////////////////////////
  //    - evaluate one bids -
  //    looks at the bid (which is a msg.element),
  //    sees if it is part of the 'currentItem',
  //    and updates the 'maxBid' if this new bid is higher (should bascially always be)
  //////////////////////////////////////////
 export  function evaluateOneBid(bid, currentItem, maxBid, setMaxBid, currentUser) {
    if(currentItem != null && bid != null) {
      if(bid.itemID == currentItem.id) {
        if(bid.Amount == maxBid.amount) {
          if( (bid.SubmittedAt < maxBid.SubmittedAt)) {   // < less than means older
            // a:  same code as b
            var thisMaxBidUsername = (currentUser == bid.Username ? bid.Username : anonymousCheck(bid))
            setMaxBid({amount: bid.Amount, user: thisMaxBidUsername, SubmittedAt: bid.SubmittedAt})
          }
        }
      
        else if(bid.Amount > maxBid.amount || bid.Username == "HSForwardtech") {       //then we need to replace with new maxbid)
          // b:  same code as a
          var thisMaxBidUsername = (currentUser == bid.Username ? bid.Username : anonymousCheck(bid))
          setMaxBid({amount: bid.Amount, user: thisMaxBidUsername, SubmittedAt: bid.SubmittedAt})
        }
      }
    }
    else {
      console.log('no item')
    }
    console.log("Backend: evalateOneBid finished for: ", bid != null? bid.id : "")
  }

  //////////////////////////////////////////
  //    - Anonymous Check -
  //    to be called whenever the bid.user is printed,
  //    since it will either return bid.user or 'anonymous' if the bid is sent anonymously
  //////////////////////////////////////////
 export  function anonymousCheck(element) {
    if(element.Anonymous) {
      return "Anonymous"
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

  export async function addNewItem(thisItem) {
    await DataStore.save(thisItem).then(console.log("saved: ", thisItem.Title))
    console.log("item added: ", thisItem.Title);
  }


  export async function addGoal(amount) {
    await DataStore.save(
        new Goal({
            "price": amount,
            "SubmittedAt": new Date().toISOString()
        })
    );
    console.log("Goal added");
  }


  export async function addIncrement(amount) {
    await DataStore.save(
        new Increment({
            "Amount": amount,
            "SubmittedAt": new Date().toISOString()
        })
    );
    console.log("Increment added");
  }

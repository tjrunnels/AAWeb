import { Item} from './models';





export function itemData() {
  var KingsmillItem = new Item({
    "Title": "Kingmill Resort Stay",
    "Description": "When it comes to Kingsmill, we're not just another resort. We're like another world nestled into Williamsburg, Virginia—a top golf and spa destination. With our unparalleled range of accommodations, stunning James River setting, three must-play championship golf courses (one with exclusive access for The Club at Kingsmill members) and a boundless range of recreational activities and leisure pursuits—including tennis—right on the grounds, Kingsmill is a relaxing, fun, and memorable luxury waterfront escape. 3 days 2 night stay, unlimited golf, round trip airfare: $1500 Value ",
    "Photos": ["https://hhaabucket150930-staging.s3.us-east-2.amazonaws.com/kingsmill.jpg"],
    "ItemToBids": []
  })
  var KingsmillGoal = 1700;
  var KingsmillIncrement = 100;
  var Kingsmill = {
    item: KingsmillItem,
    goal: KingsmillGoal,
    increment: KingsmillIncrement
}
  return [Kingsmill,Kingsmill];
} 
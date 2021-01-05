// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Increment, Goal, Bids, Item } = initSchema(schema);

export {
  Increment,
  Goal,
  Bids,
  Item
};
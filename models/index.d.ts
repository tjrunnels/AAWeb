import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Increment {
  readonly id: string;
  readonly Amount?: number;
  readonly SubmittedAt?: string;
  constructor(init: ModelInit<Increment>);
  static copyOf(source: Increment, mutator: (draft: MutableModel<Increment>) => MutableModel<Increment> | void): Increment;
}

export declare class Goal {
  readonly id: string;
  readonly price?: number;
  readonly SubmittedAt?: string;
  constructor(init: ModelInit<Goal>);
  static copyOf(source: Goal, mutator: (draft: MutableModel<Goal>) => MutableModel<Goal> | void): Goal;
}

export declare class Bids {
  readonly id: string;
  readonly itemID: string;
  readonly Username?: string;
  readonly SubmittedAt?: string;
  readonly Amount?: number;
  readonly Anonymous?: boolean;
  constructor(init: ModelInit<Bids>);
  static copyOf(source: Bids, mutator: (draft: MutableModel<Bids>) => MutableModel<Bids> | void): Bids;
}

export declare class Item {
  readonly id: string;
  readonly Title?: string;
  readonly Description?: string;
  readonly Photos?: (string | null)[];
  readonly ItemToBids?: (Bids | null)[];
  constructor(init: ModelInit<Item>);
  static copyOf(source: Item, mutator: (draft: MutableModel<Item>) => MutableModel<Item> | void): Item;
}
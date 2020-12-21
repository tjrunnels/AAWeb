import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





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
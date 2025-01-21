import { Schema, type } from "@colyseus/schema";

/**
 *  PLAYER SCHEMA
 */
class EquippedItem extends Schema {
  @type('string') itermName: string;
}

class Unit extends Schema {
  // TODO: strings here should be enums
  @type('string') unitClass: string; //  hero | item
  @type('string') unitType: string; //  archer, voidmonk...
  @type('string') unitId: string; //  used to locate the unit in the board. eg: P213 -> 13th unit deployed by second player
  @type('number') maxHealth: number;
  @type('number') currentHealth: number;
  @type('boolean') isKO: boolean;
  @type('string') attackType: string; //  physiucal | magical
  @type('number') attackDamage: number;
  @type('number') physicalDamageResistance: number;
  @type('number') magicalDamageResistance: number;
  @type([EquippedItem]) equippedItems: EquippedItem[];
  @type('string') spriteLink: string; // path based on items
}
class Faction extends Schema {
  @type('string') factionName: string;
  @type([Unit]) unitsOnBoard: Unit[];
  @type([Unit]) unitsInHand: Unit[];
  @type([Unit]) unitsInDeck: Unit[];
  @type('number') cristalAHealth: number;
  @type('number') cristalBHealth: number;
}

class Player extends Schema {
  @type('string') playerId: string;
  @type(Faction) faction: Faction;
}

/**
 *  TURN SCHEMA
 */
class TurnAction extends Schema {
  @type('string') activeUnit: string; // unit id, like P101
  @type('string') targetUnit: string; // unit id, like P101. When shuffling, the targetUnit can be the deck
  @type('string') action: string; // attack, heal, shuffle
  @type('number') actionNumber: number; // order in the turn
}

class Turn extends Schema {
  @type('number') turnNumber: number;
  @type('string') activePlayer: string; // TODO: userId, not room client id
  @type([TurnAction]) actions: TurnAction[];
}
export default class RoomState extends Schema {
  @type([Player]) players: Player[];
  @type([Turn]) gameState: Turn[];
}
/**
 * EquippedItem Interface
 */
export interface EquippedItem {itemName: string;}

/**
 * Unit Interface
 */
export interface Unit {
  unitClass: "hero" | "item";
  unitType: string; // enum?
  unitId: string;
  boardPostion: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: "physical" | "magical";
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number; // If > 0, the unit can heal
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  equippedItems: EquippedItem[]; // Array of equipped items
  spriteLink: string;
}

/**
 * Faction Interface
 */
export interface Faction {
  factionName: string;
  unitsOnBoard: Unit[];
  unitsInHand: Unit[];
  unitsInDeck: Unit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * Player Interface
 */
export interface Player {
  playerId: string;
  faction: Faction;
}

/**
 * TurnAction Interface
 */
export interface TurnAction {
  activeUnit: string; // Unit id
  targetUnit: string; // Unit id or deck
  action: "attack" | "heal" | "shuffle"; // Enum for action type
  actionNumber: number; // Order in the turn
}

/**
 * Turn Interface
 */
export interface Turn {
  turnNumber: number;
  activePlayer: string; // userId
  actions: TurnAction[];
}

/**
 * Game Interface
 */
export default interface IGame {
  players: Player[];
  gameState: Turn[];
}

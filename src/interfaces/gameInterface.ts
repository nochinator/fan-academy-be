import { Types } from "mongoose";
import { EGameStatus } from "../enums/game.enums";

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
  unitsOnBoard?: Unit[];
  unitsInHand?: Unit[];
  unitsInDeck?: Unit[];
  cristalOneHealth?: number;
  cristalTwoHealth?: number;
}

/**
 * userData Interface
 */
export interface UserData {
  userId: Types.ObjectId;
  userName: string;
  picture: string;
}

/**
 * user Interface
 */
export interface User {
  userData: Types.ObjectId; // userId. Populates from user
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
  actions: TurnAction[];
}

/**
 * Game Interface
 */
export default interface IGame {
  _id: Types.ObjectId;
  players: User[];
  gameState: Turn[];
  // board: string;
  winCondition?: string;
  winner?: string; // userId
  status: EGameStatus
  createdAt: Date;
  activePlayer: Types.ObjectId | null; // userId

  // REVIEW: start and end dates? and one more field for last turn sent
}

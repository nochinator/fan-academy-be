import { Types } from "mongoose";
import { EGameStatus } from "../enums/game.enums";

/**
 * Unit Interface
 */
export interface IUnit {
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
  dragonScale: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
}

/**
 * Faction Interface
 */
export interface IFaction {
  factionName: string;
  unitsOnBoard: IUnit[];
  unitsInHand: IUnit[];
  unitsInDeck: IUnit[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * userData Interface
 */
export interface IUserData {
  userId: Types.ObjectId;
  userName: string;
  picture: string;
}

/**
 * user Interface
 */
export interface IPlayer {
  userData: Types.ObjectId; // userId. Populates from user
  faction: IFaction;
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  activeUnit: string; // Unit id
  targetUnit: string; // Unit id or deck
  action: "attack" | "heal" | "shuffle"; // Enum for action type
  actionNumber: number; // Order in the turn
}

/**
 * Game Interface
 */
export default interface IGame {
  _id: Types.ObjectId;
  players: IPlayer[];
  gameState: ITurnAction[];
  winCondition?: string;
  winner?: string; // userId
  status: EGameStatus
  createdAt: Date;
  activePlayer: Types.ObjectId | null; // userId

  // REVIEW: start and end dates? and one more field for last turn sent
}

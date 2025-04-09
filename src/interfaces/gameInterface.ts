import { Types } from "mongoose";
import { EAction, EAttackType, EClass, EFaction, EGameStatus, EHeroes, EItems } from "../enums/game.enums";

/**
 * Item Interface
 */
export interface IItem {
  class: EClass;
  faction: EFaction;
  unitId: string; // userId_itemName_itemNumber
  itemType: EItems;
  boardPosition: number // 45-51
}

/**
 * Hero Interface
 */
export interface IHero {
  class: EClass;
  faction: EFaction;
  unitType: EHeroes;
  unitId: string; // userId_unitName_unitNumber
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: EAttackType;
  power: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
}

/**
 * Faction Interface
 */
export interface IFaction {
  userId: string;
  factionName: EFaction;
  unitsInHand: (IHero | IItem)[];
  unitsInDeck: (IHero | IItem)[];
  cristalOneHealth: number;
  cristalTwoHealth: number;
}

/**
 * userData Interface
 */
export interface IPlayerData {
  userData: Types.ObjectId;
  faction: EFaction;
}

/**
 * TurnAction Interface
 */
export interface ITurnAction {
  activeUnit?: string; // Unit id
  targetUnit: string; // Unit id or deck
  action: EAction;
  actionNumber: number; // Order in the turn
}

/**
 * Player Interface
 */
export interface IPlayerState {
  playerId: Types.ObjectId;
  factionData: IFaction;
}

/**
 * GameState Interface
 */
export interface IGameState {
  player1: IPlayerState;
  player2?: IPlayerState;
  boardState: IHero[];
  action?: ITurnAction;
}

/**
 * Game Interface
 */
export default interface IGame {
  _id: Types.ObjectId;
  players: IPlayerData[];
  gameState: IGameState[];
  currentState?: IGameState;
  winCondition?: string;
  winner?: string; // userId
  status: EGameStatus
  createdAt: Date;
  activePlayer: Types.ObjectId | null; // userId

  // REVIEW: start and end dates? and one more field for last turn sent
}

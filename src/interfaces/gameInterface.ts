import { Types } from "mongoose";
import { EAction, EAttackType, EFaction, EGameStatus, EItems } from "../enums/game.enums";

/**
 * Item Interface
 */
export interface IItem {
  class: 'item';
  itemId: string; // userId_itemName_itemNumber
  itemType: EItems;
  boardPosition: number // Needs a check when dragging to be applied to the unit if possible
  isActive: boolean
}

/**
 * Hero Interface
 */
export interface IHero {
  class: 'hero';
  faction: EFaction;
  unitType: string; // TODO: enum?
  unitId: string; // userId_ unitName_ unitNumber
  boardPosition: number;
  maxHealth: number;
  currentHealth: number;
  isKO: boolean;
  movement: number;
  range: number;
  attackType: EAttackType;
  rangeAttackDamage: number;
  meleeAttackDamage: number;
  healingPower: number; // If > 0, the unit can heal
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean; // either dragonscale or soulstone
  runeMetal: boolean;
  shiningHelm: boolean;
  isActive: boolean
  // belongsTo: string; // user id
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

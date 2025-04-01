import { Types } from "mongoose";
import { EAction, EAttackType, EFaction, EGameStatus, EItems } from "../enums/game.enums";

/**
 * Item Interface
 */
export interface IItem {
  class: 'hero' | 'item'
  itemType: EItems;
  boardPosition: 45 | 46 | 47 | 48 | 49 | 50 | 51 // Needs a check when dragging to be applied to the unit if possible
}

/**
 * Hero Interface
 */
export interface IHero {
  unitClass: "hero";
  unitType: string; // TODO: enum?
  unitId: string; // eg: p101 -> player 1 archer for ex
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
  dragonScale: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  // belongsTo: string; // user id
}

/**
 * Faction Interface
 */
export interface IFaction {
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

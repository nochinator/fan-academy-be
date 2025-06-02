import { Types } from "mongoose";
import { EActionClass, EActionType, EAttackType, EClass, EFaction, EGameStatus, EHeroes, EItems, ETiles } from "../enums/game.enums";

/**
 * Crystal Interface
 */
export interface ICrystal {
  belongsTo: number;
  maxHealth: number;
  currentHealth: number;
  isDestroyed: boolean;
  isLastCrystal: boolean;
  boardPosition: number;
}

/**
 * Item Interface
 */
export interface IItem {
  class: EClass;
  faction: EFaction;
  unitId: string; // userId_itemName_itemNumber
  itemType: EItems;
  boardPosition: number; // 45-51
  belongsTo: number;
  canHeal: boolean;
  dealsDamage: boolean;
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
  lastBreath: boolean;
  movement: number;
  attackRange: number;
  healingRange: number;
  attackType: EAttackType;
  power: number;
  powerModifier: number;
  physicalDamageResistance: number;
  magicalDamageResistance: number;
  factionBuff: boolean;
  runeMetal: boolean;
  shiningHelm: boolean;
  superCharge: boolean;
  belongsTo: number;
  canHeal: boolean;
  unitsConsumed?: number;
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
  actorPosition?: number;
  targetPosition?: number; // an item can be a target for shuffle
  action: EActionType,
  actionClass: EActionClass
}

/**
 * Player Interface
 */
export interface IPlayerState {
  playerId: Types.ObjectId;
  factionData: IFaction;
}

/**
 * Tile Interface
 */
export interface ITile {
  row: number;
  col: number;
  tileType: ETiles;
  x: number;
  y: number;
  boardPosition: number;
  occupied: boolean;
  obstacle: boolean;
  hero?: IHero | undefined;
}

/**
 * GameState Interface
 */
export interface IGameState {
  player1: IPlayerState;
  player2?: IPlayerState;
  boardState: ITile[];
  action?: ITurnAction;
}

/**
 * Game Interface
 */
export default interface IGame {
  _id: Types.ObjectId;
  players: IPlayerData[];
  gameState: IGameState[][];
  currentState?: IGameState[];
  previousTurn?: IGameState[];
  winCondition?: string;
  winner?: string; // userId
  status: EGameStatus;
  createdAt: Date;
  activePlayer: Types.ObjectId | null; // userId

  // REVIEW: start and end dates? and one more field for last turn sent
}

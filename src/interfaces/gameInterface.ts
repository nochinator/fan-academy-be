import { Types } from "mongoose";
import { EActionClass, EActionType, EAttackType, EClass, EFaction, EGameStatus, EHeroes, EItems, ETiles, EWinConditions } from "../enums/game.enums";

/**
 * Game Over Interface
 */
export interface IGameOver {
  winCondition: EWinConditions,
  winner: string
}

/**
 * Turn message Interface
 */
export interface ITurnMessage {
  _id: Types.ObjectId,
  currentTurn: IGameState[],
  turnNumber: number,
  newActivePlayer: Types.ObjectId,
  gameOver?: IGameOver
}

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
  unitsLeft: number;
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
  turnNumber: number,
  previousTurn: IGameState[];
  gameOver?: IGameOver,
  status: EGameStatus;
  createdAt: Date;
  finishedAt: Date;
  lastPlayedAt: Date;
  activePlayer: Types.ObjectId | null; // userId
}

import { ObjectId } from "mongoose";
import { EFaction, EGameStatus, EWinConditions } from "../enums/game.enums";

interface IUnitStats {
  base: number;
  buffs: number;
  debuffs: number;
}; // TODO: find better name

interface IBaseGameUnit {
  unitId: number;
  isPlayerOne: boolean; // REVIEW: Defines who can attack / be attacked by. For units, defines whether the unit is looking to the right or to the left. Maybe it would be better typed as player: 1 | 2 ?
};

interface IGameCrystal {
  hp: number;
  isDestroyed: boolean
}

interface IGameItem extends IBaseGameUnit {
  type: string; // TODO: enum. Types: buff, attack, healing, attack + healing
  value: number;
  areaOfEffect?: number;
}

// At first I thought of splitting the units by faction, but I think it might be better to have a mapping function where all the units and items are together, differentiated by id. So the council_knight is id 001, the impaler id 051, and so on

// For units, we will need a function that updated the game image every time the HP changes or the unit is buffed or debuffed
interface IGameUnit extends IBaseGameUnit {
  currentLocation: string; // eg: cell 'A1'
  movement: number;

  maxHP: number; // can be modified by buffs
  currentHP: number; // can't be above max HP

  isKO: boolean;
  turnKO: number; // TODO: turn in which the unit was KO'd. need to implement a check at the  beginning of the player turn. If more than two turns have passed and the unit has not been revived, remove unit from board

  attack: IUnitStats;
  healing: IUnitStats; // REVIEW: should we make this optional, or add a isHealer boolean?
  attackType: 'physical' | 'magical'; // TODO: enum
  range: number; // I think it's shared for attack and healing

  physicalDefense: IUnitStats;
  magicalDefense: IUnitStats;

  equippedItems: number[]; // These are the ids of any items the unit has equipped. Affects character portrait
}

/* Instead of having an array for all the cells, we have an array for all the units in play (which will be a shorter array). Each unit contains their location in the board, which image should be displayed and which direction should it be facing
*/
interface IBoardState {
  board: [IGameCrystal | IGameItem | IGameUnit];
  playerOneDeck: IBaseGameUnit[];
  playerOneDiscard: IBaseGameUnit[];
  playerTwoDeck: IBaseGameUnit[];
  playerTwoDiscard: IBaseGameUnit[];
};

interface IAction {
  actingUnit: number; // REVIEW: ids?
  actionType: string; // TODO: enum,
  target?: number;
};

interface ITurn {
  turnNumber: number;
  boardState: IBoardState;
  actions: IAction[];
};

interface IPlayer  {
  userId: string;
  username: string;
  email: string;
  faction: EFaction;
  timeLeft: number; // time left in seconds?
}

interface IGame {
  _id: ObjectId;
  status: EGameStatus;
  players: string[];
  player1: IPlayer;
  player2: IPlayer;
  winCondition?: EWinConditions;
  winner?: {
    userId: string;
    username: string;
  };
  turnNumber: number;
  activePlayer: string; // userId // this can also be saved to the user collection
  turns: ITurn[];
};

export default IGame;
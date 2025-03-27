
import mongoose, { Types } from "mongoose";
import IGame from "../interfaces/gameInterface";
import { EFaction } from "../enums/game.enums";

const { Schema, model } = mongoose;

/**
 * Unit Schema
 */
const UnitSchema = new Schema({
  unitClass: {
    type: String,
    enum: ["hero", "item"],
    required: true
  }, // Enum for unitClass
  unitType: {
    type: String,
    required: true
  }, // Enum could be added here as well
  unitId: {
    type: String,
    required: true
  },
  boardPosition: {
    type: Number,
    default: 0
  },
  maxHealth: {
    type: Number,
    required: true
  },
  currentHealth: {
    type: Number,
    required: true
  },
  isKO: {
    type: Boolean,
    default: false
  },
  movement: {
    type: Number,
    required: true
  },
  range: {
    type: Number,
    required: true
  },
  attackType: {
    type: String,
    enum: ["physical", "magical"],
    required: true
  },
  rangeAttackDamage: {
    type: Number,
    required: true
  },
  meleeAttackDamage: {
    type: Number,
    required: true
  },
  healingPower: {
    type: Number,
    default: 0
  }, // If > 0 can heal
  physicalDamageResistance: {
    type: Number,
    default: 0
  },
  magicalDamageResistance: {
    type: Number,
    default: 0
  },
  dragonScale: {
    type: Boolean,
    required: true
  },
  runeMetal: {
    type: Boolean,
    required: true
  },
  shiningHelm: {
    type: Boolean,
    required: true
  }
});

/**
 * Faction Schema
 */
const FactionSchema = new Schema({
  factionName: {
    type: String,
    enum: Object.values(EFaction),
    required: true
  },
  unitsInHand: {
    type: [UnitSchema],
    default: []
  },
  unitsInDeck: {
    type: [UnitSchema],
    default: []
  },
  cristalOneHealth: {
    type: Number,
    required: false // FIXME:
  },
  cristalTwoHealth: {
    type: Number,
    required: false // FIXME:
  }
});

/**
 * user Schema
 */
const UserSchema = new Schema({
  userData: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  faction: {
    type: String,
    enum: Object.values(EFaction),
    required: true
  }
});

/**
 * TurnAction Schema
 */
const TurnActionSchema = new Schema({
  activeUnit: {
    type: String,
    required: true
  }, // Unit id
  targetUnit: {
    type: String,
    required: true
  }, // Unit id or deck
  action: {
    type: String,
    enum: ["attack", "heal", "shuffle"],
    required: true
  },
  actionNumber: {
    type: Number,
    required: true
  }
});

/**
 * PlayerState Schema
 */
const PlayerStateSchema = new Schema({
  playerId: {
    type: Types.ObjectId,
    required: true
  },
  factionData: {
    type: FactionSchema,
    required: true
  }
});

/**
 * GameState Schema
 */
const GameStateSchema = new Schema({
  player1: {
    type: PlayerStateSchema,
    required: true
  },
  player2: {
    type: PlayerStateSchema,
    required: false
  },
  boardState: {
    type: [UnitSchema],
    default: []
  },
  action: {
    type: TurnActionSchema,
    required: false
  }
});

/**
 * RoomState Schema
 */
const GameSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  players: {
    type: [UserSchema],
    default: []
  },
  gameState: {
    type: [GameStateSchema],
    default: []
  },
  currentState: {
    type: GameStateSchema,
    required: false
  },
  winCondition: {
    type: String,
    required: false
  },
  winner: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  activePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  } // userId
});

export default model<IGame>("Game", GameSchema);
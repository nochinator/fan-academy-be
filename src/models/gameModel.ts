import mongoose, { Types } from 'mongoose';
import IGame from '../interfaces/gameInterface';
import { EAction, EAttackType, EFaction, ETiles } from '../enums/game.enums';

const { Schema, model } = mongoose;

/**
 * Item Schema
 */
const ItemSchema = new Schema({
  faction: {
    type: String,
    required: true
  },
  unitId: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true
  },
  boardPosition: {
    type: Number,
    required: true
  },
  belongsTo: {
    type: Number,
    required: true,
    default: 1
  }
}, { _id: false });

/**
 * Hero Schema
 */
const HeroSchema = new Schema({
  unitType: {
    type: String,
    required: true
  },
  unitId: {
    type: String,
    required: true
  },
  boardPosition: {
    type: Number,
    default: 51
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
    enum: EAttackType,
    required: true
  },
  power: {
    type: Number,
    required: true
  },
  physicalDamageResistance: {
    type: Number,
    default: 0
  },
  magicalDamageResistance: {
    type: Number,
    default: 0
  },
  factionBuff: {
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
  },
  belongsTo: {
    type: Number,
    required: true,
    default: 1
  }
}, { _id: false });

/**
 * UnitOrItem Schema since Mongoose doesn't allow arrays of mixed schemas
 */
const UnitOrItemSchema = new Schema(
  {
    class: {
      type: String,
      enum: ['hero', 'item'],
      required: true
    }
  },
  {
    discriminatorKey: 'class',
    _id: false
  }
);

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
    type: [UnitOrItemSchema], // REVIEW: doesn't enforce data validation
    default: []
  },
  unitsInDeck: {
    type: [UnitOrItemSchema],
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
}, { _id: false });

(FactionSchema.path('unitsInHand') as mongoose.Schema.Types.DocumentArray).discriminator('hero', HeroSchema);
(FactionSchema.path('unitsInHand') as mongoose.Schema.Types.DocumentArray).discriminator('item', ItemSchema);
(FactionSchema.path('unitsInDeck') as mongoose.Schema.Types.DocumentArray).discriminator('hero', HeroSchema);
(FactionSchema.path('unitsInDeck') as mongoose.Schema.Types.DocumentArray).discriminator('item', ItemSchema);

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
}, { _id: false });

/**
 * TurnAction Schema
 */
const TurnActionSchema = new Schema({
  activeUnit: {
    type: UnitOrItemSchema,
    required: true
  },
  targetUnit: {
    type: UnitOrItemSchema,
    required: true
  },
  action: {
    type: String,
    enum: EAction,
    required: true
  },
  actionNumber: {
    type: Number,
    required: true
  }
}, { _id: false });

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
}, { _id: false });

/**
 * Tile Schema
 */
const TileSchema = new Schema({
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  boardPosition: {
    type: Number,
    required: true
  },
  tileType: {
    type: String,
    enum: ETiles,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  occupied: {
    type: Boolean,
    required: true
  },
  obstacle: {
    type: Boolean,
    required: true
  },
  hero: {
    type: HeroSchema,
    required: false
  }
}, { _id: false });

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
    type: [TileSchema],
    default: []
  },
  action: {
    type: TurnActionSchema,
    required: false
  }
}, { _id: false });

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
    type: [[GameStateSchema]],
    default: []
  },
  lastTurnState: {
    type: [GameStateSchema],
    required: false
  },
  currentState: {
    type: [GameStateSchema],
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

export default model<IGame>('Game', GameSchema);
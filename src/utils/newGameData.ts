import { EAttackType, EClass, EFaction, EHeroes, EItems, ETiles } from "../enums/game.enums";
import { ICoordinates, IFaction, IHero, IItem, ITile } from "../interfaces/gameInterface";
import { mapTemplates } from "./mapTemplates";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(userId: string, playerFaction: EFaction): IFaction {
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: createCouncilFactionData(userId),
    [EFaction.DARK_ELVES]: createElvesFactionData(userId)
  };

  return faction[playerFaction];
}

export function createCouncilFactionData(userId: string): IFaction {
  const unitsInDeck = createCouncilDeck(userId);
  const unitsInHand =  unitsInDeck.splice(0, 6);
  const factionName = EFaction.COUNCIL;
  const unitsLeft = 13;

  return {
    userId,
    factionName,
    unitsInDeck,
    unitsInHand,
    unitsLeft
  };
}

function createCouncilDeck(userId: string): (IHero | IItem)[] {
  const deck = [];

  for (let index = 0; index < 3; index++) {
    const archer = createCouncilArcherData( { unitId: `${userId}_archer_${index}` });
    const knight = createCouncilKnightData( { unitId: `${userId}_knight_${index}` });
    const wizard = createCouncilWizardData( { unitId: `${userId}_wizard_${index}` });
    const cleric = createCouncilClericData( { unitId: `${userId}_cleric_${index}` });

    const shiningHelm = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData( {
      unitId: `${userId}_dragonScale_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.DRAGON_SCALE
    });

    deck.push(archer, knight, wizard, cleric, shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    // Heals 1000 hp. Can revive at 1/2 power
    const healingPotion = createItemData( {
      unitId: `${userId}_healingPotion_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.HEALING_POTION,
      canHeal: true
    });
    const inferno = createItemData( {
      //  High-damage attack spell that does 350 magical damage in a 3x3 area.
      // Can remove knocked-out enemies from the field.
      unitId: `${userId}_inferno_${index}`,
      faction: EFaction.COUNCIL,
      dealsDamage: true,
      itemType: EItems.INFERNO
    });
    const superCharge = createItemData( {
      // Triples the attack power of the next attack for the chosen unit
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SUPERCHARGE
    });

    deck.push(healingPotion, inferno, superCharge);
  }

  // Unique unit
  const ninja = createCouncilNinjaData( { unitId: `${userId}_ninja` });
  deck.push(ninja);

  const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}

export function createElvesFactionData(userId: string): IFaction {
  const unitsInDeck = createElvesDeck(userId);
  const unitsInHand =  unitsInDeck.splice(0, 6);
  const factionName = EFaction.DARK_ELVES;
  const unitsLeft = 13;
  return {
    userId,
    factionName,
    unitsInDeck,
    unitsInHand,
    unitsLeft
  };
}

function createElvesDeck(userId: string): (IHero | IItem)[] {
  const deck = [];

  for (let index = 0; index < 3; index++) {
    const impaler = createElvesImpalerData( { unitId: `${userId}_impaler_${index}` });
    const voidMonk = createElvesVoidMonkData( { unitId: `${userId}_voidMonk_${index}` });
    const necromancer = createElvesNecromancerData( { unitId: `${userId}_necromancer_${index}` });
    const priestess = createElvesPriestessData( { unitId: `${userId}_priestess_${index}` });

    const shiningHelm = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData( {
      // Increases magical resistance by 20% and max health by 10%
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData( {
      unitId: `${userId}_soulStone_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_STONE
    });

    deck.push(impaler, voidMonk, necromancer, priestess, shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    const manaVial = createItemData( {
      // Heals for 1000 hp and increases max HP by 50
      //  Does not revive
      unitId: `${userId}_manaVial_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.MANA_VIAL,
      canHeal: true
    });

    const soulHarvest = createItemData( {
      // Does damage to enemies while raising your fallen heroes and adding to their maximum health.
      // Health gained by each unit is equal to the total life lost by enemy units divided by the number of friendly units plus 3 rounded to the nearest 5.
      // The equation for this is H = 1/(3+U) x D, where H is Health gained by each allied unit, D is Damage dealt, U = Amount of allied units on the field, and R = Any real number. H is rounded to the nearest 5 at the end.
      //   For example, if there were 3 allied units, and the harvest dealt 400 damage, then H = 1/(3+3) x 400, which is 1/6 x 400, which is 66.66...., which rounds to 65.
      //   As a second example, if there were 7 allied units, and the harvest dealt 780 damage, then H = 1/(3+7) x 780, which is 1/10 x 780, which is 78, which rounds to 80
      unitId: `${userId}_soulHarvest_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_HARVEST,
      dealsDamage: true
    });

    const superCharge = createItemData( {
      // Triples the attack power of the next attack for the chosen unit
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SUPERCHARGE
    });

    deck.push(manaVial, soulHarvest, superCharge);
  }

  // Unique unit
  const wraith = createElvesWraithData( { unitId: `${userId}_wraith` });
  deck.push(wraith);

  const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}

/**
 *
 * HERO DATA
 *
 */

function createGenericCouncilData(data: Partial<IHero>): {
  class: EClass,
  faction: EFaction,
  unitId: string,
  boardPosition: number,
  isKO: boolean,
  factionBuff: boolean,
  runeMetal: boolean,
  shiningHelm: boolean,
  superCharge: boolean,
  belongsTo: number,
  lastBreath: boolean,
  powerModifier: number,
  row: number,
  col: number,
  isDebuffed: boolean
} {
  return {
    class: EClass.HERO,
    faction: EFaction.COUNCIL,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    powerModifier: data.powerModifier ?? 0,
    row: data.row ?? 0,
    col: data.col ?? 0,
    isDebuffed: data.isDebuffed ?? false
  };
}

export function createCouncilArcherData(data: Partial<IHero>): IHero {
  // Melee damage = 1/2 power
  const baseHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.ARCHER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilWizardData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    unitType: EHeroes.WIZARD,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilKnightData(data: Partial<IHero>): IHero {
  const baseHealth = 1000;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.KNIGHT,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilClericData(data: Partial<IHero>): IHero {
  // Heals for x3, revives for x2 power
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.CLERIC,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 2,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilNinjaData(data: Partial<IHero>): IHero {
  // Melee is x2 power
  // Can teleport
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.NINJA,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 3,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

function createGenericElvesData(data: Partial<IHero>): {
  class: EClass,
  faction: EFaction,
  unitId: string,
  boardPosition: number,
  isKO: boolean,
  factionBuff: boolean,
  runeMetal: boolean,
  shiningHelm: boolean,
  superCharge: boolean,
  belongsTo: number,
  lastBreath: boolean,
  powerModifier: number,
  row: number,
  col: number,
  isDebuffed: boolean
} {
  return {
    class: EClass.HERO,
    faction: EFaction.DARK_ELVES,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    powerModifier: data.powerModifier ?? 0,
    row: data.row ?? 0,
    col: data.col ?? 0,
    isDebuffed: data.isDebuffed ?? false
  };
}

export function createElvesImpalerData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const power = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.IMPALER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesPriestessData(data: Partial<IHero>): IHero {
  // Heals for x2, revives for 1/2 power
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.PRIESTESS,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2, // TODO: applies debuff
    healingRange: 3,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true
    ,
    ...createGenericElvesData(data)
  };
}

export function createElvesVoidMonkData(data: Partial<IHero>): IHero {
  // AOE damage in cone (above, below and behind hit unit) for 66.6% of power
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 20;
  const magicalDamageResistance = 20;

  return {
    unitType: EHeroes.VOIDMONK,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesNecromancerData(data: Partial<IHero>): IHero {
  // Transforms KO units (friend or foe) into phantoms
  const baseHealth = 800;
  const power = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.NECROMANCER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesWraithData(data: Partial<IHero>): IHero {
  // Can consume up to 3 KO'd units to level up: +150 hp and +50 power per unit
  // Can be deployed on a KO'd unit (does not consume it)
  const baseHealth = 650;
  const power = 250;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 10;

  return {
    unitType: EHeroes.WRAITH,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: data.power ?? power,
    basePower: power,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    unitsConsumed: data.unitsConsumed ?? 0,
    ...createGenericElvesData(data)
  };
}

export function createElvesPhantomData(data: Partial<IHero>): IHero {
  // Cannot be equipped, buffed or healed, disappears if KO'd
  return {
    unitType: EHeroes.PHANTOM,
    baseHealth: 100,
    maxHealth: 100,
    currentHealth: data.currentHealth ?? 100,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    power: 100,
    basePower: 100,
    physicalDamageResistance: 0,
    basePhysicalDamageResistance: 0,
    magicalDamageResistance: 0,
    baseMagicalDamageResistance: 0,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createItemData(data: Partial<IItem>): IItem {
  return {
    class: EClass.ITEM,
    faction: data.faction!,
    unitId: data.unitId!,
    itemType: data.itemType!,
    boardPosition: data.boardPosition ?? 51,
    belongsTo: data.belongsTo ?? 1,
    canHeal: data.canHeal ?? false,
    dealsDamage: data.dealsDamage ?? false
  };
}

// Fisher-Yates shuffle algorithm
export function shuffleArray(array: (IHero | IItem)[]): (IHero | IItem)[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  array.forEach((unit, index) => {
    if (index < 6) {
      unit.boardPosition = 45 + index; // First 6 units get positions 45 to 50 on the board (the player's hand)
    } else {
      unit.boardPosition = 51; // Remaining units get 51 (deck, hidden)
    }
  });

  return array;
}

/**
 *
 * Create map
 *
 */
/**
 * Creates a new map randomly choosing from a series of templates
 */
export function createNewGameBoardState(): ITile[] {
  const randomIndexNumber = Math.floor(Math.random() * mapTemplates.length);
  const mapData = mapTemplates[randomIndexNumber];
  const newBoard: ITile[] = [];
  const centerPoints = calculateAllCenterPoints();

  let boardPosition = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const { x, y } = centerPoints[boardPosition];
      const specialTile = mapData.find((tile) => tile.col === col && tile.row === row);
      const isCrystalTile = specialTile?.tileType === ETiles.CRYSTAL;
      const tile = createTileData({
        row,
        col,
        x,
        y,
        boardPosition,
        tileType: specialTile ? specialTile.tileType : ETiles.BASIC,
        occupied: false,
        obstacle: isCrystalTile ? true : false,
        ...isCrystalTile ? {
          crystal: {
            belongsTo: col > 4 ? 2 : 1,
            maxHealth: 4500,
            currentHealth: 4500,
            isDestroyed: false,
            isLastCrystal: false,
            boardPosition,
            row,
            col,
            debuffLevel: 0
          }
        } : {}
      });
      newBoard.push(tile);
      boardPosition++;
    }}

  return newBoard;
}

export function calculateAllCenterPoints(): ICoordinates[] {
  // Adding coordinates for the board tiles
  const centerPoints: ICoordinates[] = calculateBoardCenterPoints();

  // Adding coordinates for the items in the player's hand
  const leftMostItem = {
    x: 700,
    y: 745
  };

  for (let item = 0; item < 6; item++) {
    centerPoints.push({
      x: leftMostItem.x,
      y: leftMostItem.y
    });

    leftMostItem.x += 80;
  }

  // Adding coordinates for the deck (door)
  centerPoints.push({
    x: 435,
    y: 720
  });

  return centerPoints;
}

export function calculateBoardCenterPoints(): ICoordinates[] {
  const topLeft = {
    x: 545,
    y: 225,
    row: 0,
    col: 0
  };

  const result: ICoordinates[] = [];
  let boardPosition = 0;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const x = topLeft.x + col * 90;
      const y = topLeft.y + row * 90;

      result.push({
        x,
        y,
        row,
        col,
        boardPosition
      });

      boardPosition++;
    }
  }
  return result;
}

export function createTileData(data: ITile): ITile {
  const tileType = ETiles.BASIC;
  const occupied = false;
  const obstacle = false;
  const hero = undefined;
  const crystal = undefined;

  return {
    row: data.row,
    col: data.col,
    x: data.x,
    y: data.y,
    boardPosition: data.boardPosition,
    tileType: data.tileType ?? tileType,
    occupied: data.occupied ?? occupied,
    obstacle: data.obstacle ?? obstacle,
    hero: data.hero ?? hero,
    crystal: data.crystal ?? crystal
  };
}
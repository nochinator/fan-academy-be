import { EAttackType, EClass, EFaction, EHeroes, EItems, ETiles } from "../enums/game.enums";
import { ICoordinates, IFaction, IHero, IItem, ITile } from "../interfaces/gameInterface";
import { mapTemplates } from "./mapTemplates";

/**
 * Creates a starting state for a given faction, randomizing the assets in deck and dealing a starting hand
 */
export function createNewGameFactionState(userId: string, playerFaction: EFaction): IFaction {
  const faction: Record<string, IFaction> = {
    [EFaction.COUNCIL]: createCouncilFactionData(userId),
    [EFaction.DARK_ELVES]: createElvesFactionData(userId),
    [EFaction.DWARVES]: createDwarvesFactionData(userId)
  };

  return faction[playerFaction];
}

export function createCouncilFactionData(userId: string): IFaction {
  const unitsInDeck = createCouncilDeck(userId);
  const unitsInHand = unitsInDeck.splice(0, 6);
  const factionName = EFaction.COUNCIL;

  return {
    userId,
    factionName,
    unitsInDeck,
    unitsInHand
  };
}

function createCouncilDeck(userId: string): (IHero | IItem)[] {
  const unitsDeck = [];
  const itemsDeck = [];

  for (let index = 0; index < 3; index++) {
    const archer = createCouncilArcherData({ unitId: `${userId}_archer_${index}` });
    const knight = createCouncilKnightData({ unitId: `${userId}_knight_${index}` });
    const wizard = createCouncilWizardData({ unitId: `${userId}_wizard_${index}` });
    const cleric = createCouncilClericData({ unitId: `${userId}_cleric_${index}` });

    const shiningHelm = createItemData({
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData({
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData({
      unitId: `${userId}_dragonScale_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.DRAGON_SCALE
    });

    unitsDeck.push(archer, knight, wizard, cleric);
    itemsDeck.push(shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    const healingPotion = createItemData({
      unitId: `${userId}_healingPotion_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.HEALING_POTION,
      canHeal: true
    });
    const inferno = createItemData({
      unitId: `${userId}_inferno_${index}`,
      faction: EFaction.COUNCIL,
      dealsDamage: true,
      itemType: EItems.INFERNO
    });
    const superCharge = createItemData({
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.COUNCIL,
      itemType: EItems.SUPERCHARGE
    });

    itemsDeck.push(healingPotion, inferno, superCharge);
  }

  const ninja = createCouncilNinjaData({ unitId: `${userId}_ninja` });
  unitsDeck.push(ninja);

  const shuffledDeck = shuffleDeck(unitsDeck, itemsDeck);

  return shuffledDeck;
}

export function createElvesFactionData(userId: string): IFaction {
  const unitsInDeck = createElvesDeck(userId);
  const unitsInHand = unitsInDeck.splice(0, 6);
  const factionName = EFaction.DARK_ELVES;
  return {
    userId,
    factionName,
    unitsInDeck,
    unitsInHand
  };
}

function createElvesDeck(userId: string): (IHero | IItem)[] {
  const unitsDeck = [];
  const itemsDeck = [];

  for (let index = 0; index < 3; index++) {
    const impaler = createElvesImpalerData({ unitId: `${userId}_impaler_${index}` });
    const voidMonk = createElvesVoidMonkData({ unitId: `${userId}_voidMonk_${index}` });
    const necromancer = createElvesNecromancerData({ unitId: `${userId}_necromancer_${index}` });
    const priestess = createElvesPriestessData({ unitId: `${userId}_priestess_${index}` });

    const shiningHelm = createItemData({
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SHINING_HELM
    });

    const runeMetal = createItemData({
      unitId: `${userId}_runeMetal_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.RUNE_METAL
    });

    const factionBuff = createItemData({
      unitId: `${userId}_soulStone_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_STONE
    });

    unitsDeck.push(impaler, voidMonk, necromancer, priestess);
    itemsDeck.push(shiningHelm, runeMetal, factionBuff);
  }

  for (let index = 0; index < 2; index++) {
    const manaVial = createItemData({
      unitId: `${userId}_manaVial_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.MANA_VIAL,
      canHeal: true
    });

    const soulHarvest = createItemData({
      unitId: `${userId}_soulHarvest_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SOUL_HARVEST,
      dealsDamage: true
    });

    const superCharge = createItemData({
      unitId: `${userId}_superCharge_${index}`,
      faction: EFaction.DARK_ELVES,
      itemType: EItems.SUPERCHARGE
    });

    itemsDeck.push(manaVial, soulHarvest, superCharge);
  }

  const wraith = createElvesWraithData({ unitId: `${userId}_wraith` });
  unitsDeck.push(wraith);

  const shuffledDeck = shuffleDeck(unitsDeck, itemsDeck);

  return shuffledDeck;
}

/**
 *
 * DWARVES FACTION DATA
 *
 */

export function createDwarvesFactionData(userId: string): IFaction {
  const unitsInDeck = createDwarvesDeck(userId);
  const unitsInHand = unitsInDeck.splice(0, 6);
  const factionName = EFaction.DWARVES;
  return {
    userId,
    factionName,
    unitsInDeck,
    unitsInHand
  };
}

function createDwarvesDeck(userId: string): (IHero | IItem)[] {
  const unitsDeck = [];
  const itemsDeck = [];

  for (let index = 0; index < 3; index++) {
    const paladin = createDwarfPaladinData({ unitId: `${userId}_paladin_${index}` });
    const grenadier = createDwarfGrenadierData({ unitId: `${userId}_grenadier_${index}` });
    const gunner = createDwarfGunnerData({ unitId: `${userId}_gunner_${index}` });
    const engineer = createDwarfEngineerData({ unitId: `${userId}_engineer_${index}` });

    const sword = createItemData({
      unitId: `${userId}_RuneMetal_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.RUNE_METAL
    });

    const armor = createItemData({
      unitId: `${userId}_dragonScale_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.DRAGON_SCALE
    });

    const helm = createItemData({
      unitId: `${userId}_shiningHelm_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.SHINING_HELM
    });

    unitsDeck.push(paladin, grenadier, gunner, engineer);
    itemsDeck.push(sword, armor, helm);
  }

  for (let index = 0; index < 2; index++) {
    const scroll = createItemData({
      unitId: `${userId}_scroll_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.SUPERCHARGE
    });

    const dwarvenBrew = createItemData({
      unitId: `${userId}_dwarvenBrew_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.DWARVEN_BREW,
      canHeal: true
    });

    const pulverizer = createItemData({
      unitId: `${userId}_pulverizer_${index}`,
      faction: EFaction.DWARVES,
      itemType: EItems.PULVERIZER,
      dealsDamage: true
    });

    itemsDeck.push(scroll, dwarvenBrew, pulverizer);
  }

  const annihilator = createDwarfAnnihilatorData({ unitId: `${userId}_annihilator` });
  unitsDeck.push(annihilator);

  const shuffledDeck = shuffleDeck(unitsDeck, itemsDeck);

  return shuffledDeck;
}

function createGenericDwarvesData(data: Partial<IHero>): {
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
  row: number,
  col: number,
  annihilatorDebuff: boolean,
  priestessDebuff: boolean,
  isShielded: boolean,
  isDrunk: boolean,
  paladinAura: number,
  attackTile: number,
  manaVial?: boolean,
  speedTile?: number
} {
  return {
    class: EClass.HERO,
    faction: EFaction.DWARVES,
    unitId: data.unitId!,
    boardPosition: data.boardPosition ?? 51,
    isKO: data.isKO ?? false,
    lastBreath: data.lastBreath ?? false,
    factionBuff: data.factionBuff ?? false,
    runeMetal: data.runeMetal ?? false,
    shiningHelm: data.shiningHelm ?? false,
    superCharge: data.superCharge ?? false,
    belongsTo: data.belongsTo ?? 1,
    row: data.row ?? 0,
    col: data.col ?? 0,
    annihilatorDebuff: data.annihilatorDebuff ?? false,
    priestessDebuff: data.priestessDebuff ?? false,
    isShielded: data.isShielded ?? false,
    isDrunk: data.isDrunk ?? false,
    paladinAura: data.paladinAura ?? 0,
    attackTile: data.attackTile ?? 0,
    manaVial: data.manaVial ?? false,
    speedTile: data.speedTile ?? 0
  };
}

export function createDwarfPaladinData(data: Partial<IHero>): IHero {
  const baseHealth = 900;
  const basePower = 200;
  const physicalDamageResistance = 10;
  const magicalDamageResistance = 10;

  return {
    unitType: EHeroes.PALADIN,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 1,
    healingRange: 2,
    attackType: EAttackType.PHYSICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true,
    ...createGenericDwarvesData(data)
  };
}

export function createDwarfGrenadierData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.GRENADIER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericDwarvesData(data)
  };
}

export function createDwarfGunnerData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.GUNNER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 0,
    attackType: EAttackType.PHYSICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericDwarvesData(data)
  };
}

export function createDwarfEngineerData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.ENGINEER,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 1,
    healingRange: 3,
    attackType: EAttackType.PHYSICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericDwarvesData(data)
  };
}

export function createDwarfAnnihilatorData(data: Partial<IHero>): IHero {
  const baseHealth = 650;
  const basePower = 300;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.ANNIHILATOR,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 3,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericDwarvesData(data)
  };
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
  row: number,
  col: number,
  annihilatorDebuff: boolean,
  priestessDebuff: boolean,
  isShielded: boolean,
  isDrunk: boolean,
  paladinAura: number,
  attackTile: number,
  speedTile?: number
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
    row: data.row ?? 0,
    col: data.col ?? 0,
    annihilatorDebuff: data.annihilatorDebuff ?? false,
    priestessDebuff: data.priestessDebuff ?? false,
    isShielded: data.isShielded ?? false,
    isDrunk: data.isDrunk ?? false,
    paladinAura: data.paladinAura ?? 0,
    attackTile: data.attackTile ?? 0,
    speedTile: data.speedTile ?? 0
  };
}

export function createCouncilArcherData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 300;
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
    basePower,
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
  const basePower = 200;
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
    basePower,
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
  const basePower = 200;
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
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilClericData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
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
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true,
    ...createGenericCouncilData(data)
  };
}

export function createCouncilNinjaData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
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
    basePower,
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
  row: number,
  col: number,
  annihilatorDebuff: boolean,
  priestessDebuff: boolean,
  isShielded: boolean,
  isDrunk: boolean,
  paladinAura: number,
  attackTile: number,
  manaVial?: boolean,
  speedTile?: number
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
    row: data.row ?? 0,
    col: data.col ?? 0,
    annihilatorDebuff: data.annihilatorDebuff ?? false,
    priestessDebuff: data.priestessDebuff ?? false,
    isShielded: data.isShielded ?? false,
    isDrunk: data.isDrunk ?? false,
    paladinAura: data.paladinAura ?? 0,
    attackTile: data.attackTile ?? 0,
    manaVial: data.manaVial ?? false,
    speedTile: data.speedTile ?? 0
  };
}

export function createElvesImpalerData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 300;
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
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesPriestessData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
  const physicalDamageResistance = 0;
  const magicalDamageResistance = 0;

  return {
    unitType: EHeroes.PRIESTESS,
    baseHealth: data.baseHealth ?? baseHealth,
    maxHealth: data.maxHealth ?? baseHealth,
    currentHealth: data.currentHealth ?? baseHealth,
    movement: 2,
    attackRange: 2,
    healingRange: 3,
    attackType: EAttackType.MAGICAL,
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: true,
    ...createGenericElvesData(data)
  };
}

export function createElvesVoidMonkData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
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
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesNecromancerData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 200;
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
    basePower,
    basePhysicalDamageResistance: physicalDamageResistance,
    baseMagicalDamageResistance: magicalDamageResistance,
    physicalDamageResistance: data.physicalDamageResistance ?? physicalDamageResistance,
    magicalDamageResistance: data.magicalDamageResistance ?? magicalDamageResistance,
    canHeal: false,
    ...createGenericElvesData(data)
  };
}

export function createElvesWraithData(data: Partial<IHero>): IHero {
  const baseHealth = 800;
  const basePower = 250;
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
    basePower,
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
  return {
    unitType: EHeroes.PHANTOM,
    baseHealth: 100,
    maxHealth: 100,
    currentHealth: data.currentHealth ?? 100,
    movement: 3,
    attackRange: 1,
    healingRange: 0,
    attackType: EAttackType.MAGICAL,
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
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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

  const crystalsTypeArray = [ETiles.CRYSTAL_SMALL, ETiles.CRYSTAL, ETiles.CRYSTAL_BIG];

  let boardPosition = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const { x, y } = centerPoints[boardPosition];
      const specialTile = mapData.find((tile) => tile.col === col && tile.row === row);

      let crystalData;
      const isCrystalTile = specialTile?.tileType && crystalsTypeArray.includes(specialTile.tileType);

      if (isCrystalTile) {
        const crystalHp = getCrystalHp(specialTile.tileType);

        crystalData = {
          belongsTo: col > 4 ? 2 : 1,
          maxHealth: crystalHp,
          currentHealth: crystalHp,
          isDestroyed: false,
          isLastCrystal: specialTile.tileType === ETiles.CRYSTAL_BIG,
          boardPosition,
          row,
          col,
          debuffAmount: 0,
          debuffLevel: 0,
          annihilatorDebuff: false,
          isShielded: false,
          paladinAura: 0,
          physicalDamageResistance: 0,
          magicalDamageResistance: 0,
        };
      }

      const tile = createTileData({
        row,
        col,
        x,
        y,
        boardPosition,
        tileType: specialTile ? specialTile.tileType : ETiles.BASIC,
        obstacle: isCrystalTile ? isCrystalTile : false,
        ...isCrystalTile ? { crystal: crystalData } : {}
      });
      newBoard.push(tile);
      boardPosition++;
    }
  }

  return newBoard;
}

export function getCrystalHp(tileType: ETiles) {
  let health;

  switch (tileType) {
    case ETiles.CRYSTAL_SMALL:
      health = 3000;
      break;
    case ETiles.CRYSTAL:
      health = 4500;
      break;
    case ETiles.CRYSTAL_BIG:
      health = 9000;
      break;
    default:
      health = 4500;
      break;
  }

  return health;
}

export function calculateAllCenterPoints(): ICoordinates[] {
  const centerPoints: ICoordinates[] = calculateBoardCenterPoints();

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
    obstacle: data.obstacle ?? obstacle,
    hero: data.hero ?? hero,
    crystal: data.crystal ?? crystal,
  };
}
function shuffleDeck(unitsDeck: IHero[], itemsDeck: IItem[]) {
  const shuffledUnits = shuffleArray(unitsDeck);

  const startingHeroes: (IHero | IItem)[] = shuffledUnits.splice(0, 3);
  const shuffledDeck = shuffleArray([...shuffledUnits, ...itemsDeck]);

  const mappedDeck = [...startingHeroes, ...shuffledDeck].map((elem, index) => {
    if (index < 6) {
      elem.boardPosition = 45 + index;
    } else {
      elem.boardPosition = 51;
    }
    return elem;
  });

  return mappedDeck;
}
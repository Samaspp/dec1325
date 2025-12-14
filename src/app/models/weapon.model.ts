/**
 * CSGO WEAPON MODELS
 * 
 * LLD: Data structures for CSGO weapon inventory
 * 
 * Purpose:
 * - Define weapon properties and types
 * - Categorize weapons (rifles, pistols, melee, grenades)
 * - Store weapon metadata (damage, type, animation)
 * 
 * Weapon Types:
 * - GUN: Shooting mechanics with bullets
 * - MELEE: Slashing/stabbing animations
 * - GRENADE: Explosive blast effect
 */

export enum WeaponType {
  GUN = 'gun',
  MELEE = 'melee',
  GRENADE = 'grenade'
}

export enum WeaponCategory {
  RIFLE = 'rifle',
  PISTOL = 'pistol',
  SMG = 'smg',
  SNIPER = 'sniper',
  SHOTGUN = 'shotgun',
  MELEE = 'melee',
  GRENADE = 'grenade'
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  category: WeaponCategory;
  damage: number;
  headshotMultiplier: number;
  icon: string; // CSS class for weapon icon
  sound?: string; // Sound effect (future)
}

/**
 * CSGO Weapon Inventory
 * Authentic weapons from CS:GO
 */
export const CSGO_WEAPONS: Weapon[] = [
  // Rifles
  {
    id: 'ak47',
    name: 'AK-47',
    type: WeaponType.GUN,
    category: WeaponCategory.RIFLE,
    damage: 36,
    headshotMultiplier: 4,
    icon: 'weapon-ak47'
  },
  {
    id: 'm4a4',
    name: 'M4A4',
    type: WeaponType.GUN,
    category: WeaponCategory.RIFLE,
    damage: 33,
    headshotMultiplier: 4,
    icon: 'weapon-m4a4'
  },
  {
    id: 'm4a1s',
    name: 'M4A1-S',
    type: WeaponType.GUN,
    category: WeaponCategory.RIFLE,
    damage: 38,
    headshotMultiplier: 4,
    icon: 'weapon-m4a1s'
  },
  // Snipers
  {
    id: 'awp',
    name: 'AWP',
    type: WeaponType.GUN,
    category: WeaponCategory.SNIPER,
    damage: 115,
    headshotMultiplier: 1,
    icon: 'weapon-awp'
  },
  // Pistols
  {
    id: 'deserteagle',
    name: 'Desert Eagle',
    type: WeaponType.GUN,
    category: WeaponCategory.PISTOL,
    damage: 53,
    headshotMultiplier: 2.5,
    icon: 'weapon-deagle'
  },
  {
    id: 'glock18',
    name: 'Glock-18',
    type: WeaponType.GUN,
    category: WeaponCategory.PISTOL,
    damage: 28,
    headshotMultiplier: 2,
    icon: 'weapon-glock'
  },
  // SMGs
  {
    id: 'mp9',
    name: 'MP9',
    type: WeaponType.GUN,
    category: WeaponCategory.SMG,
    damage: 26,
    headshotMultiplier: 2,
    icon: 'weapon-mp9'
  },
  // Shotgun
  {
    id: 'nova',
    name: 'Nova',
    type: WeaponType.GUN,
    category: WeaponCategory.SHOTGUN,
    damage: 26,
    headshotMultiplier: 1.5,
    icon: 'weapon-nova'
  },
  // Melee
  {
    id: 'knife',
    name: 'Knife',
    type: WeaponType.MELEE,
    category: WeaponCategory.MELEE,
    damage: 65,
    headshotMultiplier: 1,
    icon: 'weapon-knife'
  },
  {
    id: 'bayonet',
    name: 'Bayonet',
    type: WeaponType.MELEE,
    category: WeaponCategory.MELEE,
    damage: 65,
    headshotMultiplier: 1,
    icon: 'weapon-bayonet'
  },
  // Grenades
  {
    id: 'hegrenade',
    name: 'HE Grenade',
    type: WeaponType.GRENADE,
    category: WeaponCategory.GRENADE,
    damage: 98,
    headshotMultiplier: 1,
    icon: 'weapon-hegrenade'
  },
  {
    id: 'molotov',
    name: 'Molotov',
    type: WeaponType.GRENADE,
    category: WeaponCategory.GRENADE,
    damage: 40,
    headshotMultiplier: 1,
    icon: 'weapon-molotov'
  }
];

/**
 * Hit Zone Interface
 * Defines clickable areas on target
 */
export interface HitZone {
  name: 'head' | 'body' | 'legs';
  multiplier: number;
}

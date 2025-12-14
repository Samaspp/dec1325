/**
 * CSGO WEAPONS COMPONENT
 * 
 * LLD: Interactive CSGO-themed weapon selection and combat system
 * 
 * Features:
 * - Weapon inventory with horizontal scrolling
 * - Target character with dialogue and hit zones
 * - Weapon-specific kill mechanics (shooting, slashing, exploding)
 * - Headshot detection with ghost applause animation
 * - Health system with visual feedback
 * - Death animations varying by weapon type
 * 
 * Architecture:
 * - Component manages weapon selection state
 * - Click handlers route to appropriate attack method
 * - Hit detection uses pixel position calculations
 * - Animations triggered via CSS classes
 */

import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Weapon, CSGO_WEAPONS, WeaponType, HitZone } from '../../models/weapon.model';

interface TargetState {
  health: number;
  maxHealth: number;
  isAlive: boolean;
  isGhost: boolean;
  lastHitZone: string;
  dialogue: string;
}

@Component({
  selector: 'app-csgo-weapons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csgo-weapons.component.html',
  styleUrl: './csgo-weapons.component.css'
})
export class CsgoWeaponsComponent implements OnInit, OnDestroy {
  weapons: Weapon[] = CSGO_WEAPONS;
  selectedWeapon: Weapon | null = null;
  
  target: TargetState = {
    health: 100,
    maxHealth: 100,
    isAlive: true,
    isGhost: false,
    lastHitZone: '',
    dialogue: "Hi, I'm a 5-day work week! Try your luck!"
  };

  // Animation states
  isShooting = false;
  isSlashing = false;
  isExploding = false;
  showMuzzleFlash = false;
  showBloodEffect = false;
  showApplause = false;
  showSoul = false;

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Auto-select first weapon
    if (this.weapons.length > 0) {
      this.selectedWeapon = this.weapons[0];
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Select weapon from inventory
   */
  selectWeapon(weapon: Weapon): void {
    this.selectedWeapon = weapon;
  }

  /**
   * Attack target with selected weapon
   * Routes to appropriate attack method based on weapon type
   */
  attackTarget(event: MouseEvent): void {
    if (!this.selectedWeapon || !this.target.isAlive) {
      return;
    }

    const hitZone = this.detectHitZone(event);
    
    switch (this.selectedWeapon.type) {
      case WeaponType.GUN:
        this.shootTarget(hitZone);
        break;
      case WeaponType.MELEE:
        this.slashTarget(hitZone);
        break;
      case WeaponType.GRENADE:
        this.explodeTarget();
        break;
    }
  }

  /**
   * Detect which zone was hit (head, body, legs)
   */
  private detectHitZone(event: MouseEvent): HitZone {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const height = rect.height;

    // Head is top 25%, body is middle 50%, legs is bottom 25%
    if (clickY < height * 0.25) {
      return { name: 'head', multiplier: this.selectedWeapon!.headshotMultiplier };
    } else if (clickY < height * 0.75) {
      return { name: 'body', multiplier: 1 };
    } else {
      return { name: 'legs', multiplier: 0.75 };
    }
  }

  /**
   * Gun shooting mechanics
   */
  private shootTarget(hitZone: HitZone): void {
    this.isShooting = true;
    this.showMuzzleFlash = true;
    this.showBloodEffect = true;

    const damage = this.selectedWeapon!.damage * hitZone.multiplier;
    const isHeadshot = hitZone.name === 'head';

    this.dealDamage(damage, isHeadshot, hitZone.name);

    // Reset animations
    setTimeout(() => {
      this.isShooting = false;
      this.showMuzzleFlash = false;
      this.showBloodEffect = false;
    }, 300);
  }

  /**
   * Melee slashing mechanics
   */
  private slashTarget(hitZone: HitZone): void {
    this.isSlashing = true;
    this.showBloodEffect = true;

    const damage = this.selectedWeapon!.damage;
    this.dealDamage(damage, false, hitZone.name);

    setTimeout(() => {
      this.isSlashing = false;
      this.showBloodEffect = false;
    }, 500);
  }

  /**
   * Grenade explosion mechanics
   */
  private explodeTarget(): void {
    this.isExploding = true;

    const damage = this.selectedWeapon!.damage;
    this.dealDamage(damage, false, 'body');

    setTimeout(() => {
      this.isExploding = false;
    }, 800);
  }

  /**
   * Apply damage to target
   */
  private dealDamage(damage: number, isHeadshot: boolean, zone: string): void {
    this.target.health = Math.max(0, this.target.health - damage);
    this.target.lastHitZone = zone;

    if (this.target.health <= 0) {
      this.killTarget(isHeadshot);
    } else {
      // Update dialogue on hit
      const phrases = [
        "Ouch! That hurt!",
        "Is that all you got?",
        "I'm still standing!",
        "You'll need more than that!",
        "Getting tired yet?"
      ];
      this.target.dialogue = phrases[Math.floor(Math.random() * phrases.length)];
    }
  }

  /**
   * Handle target death
   */
  private killTarget(isHeadshot: boolean): void {
    this.target.isAlive = false;
    this.target.isGhost = true;
    this.showSoul = true;
    if (isHeadshot) {
      this.target.dialogue = "Wow, nice shot! *applause* ";
    
    } else {
      this.target.dialogue = "You got me... well played!";
    }

    // Show soul rising after 1 second
    setTimeout(() => {
      this.showSoul = true;
    }, 1000);
  }

  /**
   * Handle soul click - navigate to next page
   */
  onSoulClick(): void {
    // Navigate to Hogwarts Flying page
    this.router.navigate(['/hogwarts-flying']);
  }

  /**
   * Respawn target with full health
   */
  private respawnTarget(): void {
    this.showSoul = false;
    this.target = {
      health: 100,
      maxHealth: 100,
      isAlive: true,
      isGhost: false,
      lastHitZone: '',
      dialogue: "Back for round 2? Bring it on!"
    };
  }

  /**
   * Scroll inventory left
   */
  scrollInventoryLeft(): void {
    if (!this.isBrowser) return;
    const container = document.querySelector('.weapon-inventory-scroll') as HTMLElement;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }

  /**
   * Scroll inventory right
   */
  scrollInventoryRight(): void {
    if (!this.isBrowser) return;
    const container = document.querySelector('.weapon-inventory-scroll') as HTMLElement;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }

  /**
   * Get health bar width percentage
   */
  get healthPercentage(): number {
    return (this.target.health / this.target.maxHealth) * 100;
  }

  /**
   * Get health bar color based on health level
   */
  get healthBarColor(): string {
    if (this.healthPercentage > 60) return '#00ff00';
    if (this.healthPercentage > 30) return '#ffaa00';
    return '#ff0000';
  }
}

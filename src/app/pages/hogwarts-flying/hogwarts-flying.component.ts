/**
 * HOGWARTS FLYING GAME COMPONENT
 * 
 * LLD: Interactive Harry Potter themed broomstick flying game
 * 
 * Features:
 * - Mouse-controlled broomstick flight
 * - Speed based on distance from player
 * - Incoming spells with different effects
 * - Mystery boxes to collect
 * - House selection (Slytherin, Gryffindor, Hufflepuff, Ravenclaw)
 * - Scratch card rewards system
 * - Hogwarts Legacy inspired art style
 * 
 * Game Mechanics:
 * - Player follows mouse cursor
 * - Spells spawn and move towards player
 * - Hit detection for spells and boxes
 * - Game over on spell hit (with effect animation)
 * - Win condition: reach finish line
 * - Rewards revealed through scratch cards
 */

import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  HogwartsHouse,
  HOUSE_CONFIGS,
  HouseConfig,
  Player,
  GameState,
  Spell,
  SpellType,
  SPELL_EFFECTS,
  MysteryBox,
  Reward,
  POSSIBLE_REWARDS
} from '../../models/hogwarts.model';

@Component({
  selector: 'app-hogwarts-flying',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hogwarts-flying.component.html',
  styleUrl: './hogwarts-flying.component.css'
})
export class HogwartsFlyingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('exportCanvas') exportCanvas!: ElementRef<HTMLCanvasElement>;
  
  HogwartsHouse = HogwartsHouse;
  houseConfigs = HOUSE_CONFIGS;
  
  player: Player = {
    x: 100,
    y: 300,
    velocityX: 0,
    velocityY: 0,
    rotation: 0,
    isStunned: false,
    isBurning: false,
    isFrozen: false,
    isExploding: false,
    house: HogwartsHouse.SLYTHERIN,
    lives: 5,
    maxLives: 5
  };

  gameState: GameState = {
    isPlaying: false,
    isGameOver: false,
    isFinished: false,
    showScratchCards: false,
    collectedBoxes: [],
    distance: 0,
    finishLine: 3000,
    collectedRewards: []
  };

  spells: Spell[] = [];
  mysteryBoxes: MysteryBox[] = [];
  rewards: Reward[] = [];
  
  mouseX = 0;
  mouseY = 0;
  
  currentEffect = '';
  showHouseSelector = false;
  
  // Scratch card functionality
  scratchingRewardId: string | null = null;
  private scratchCanvases: Map<string, HTMLCanvasElement> = new Map();
  private scratchContexts: Map<string, CanvasRenderingContext2D> = new Map();

  private animationFrameId?: number;
  private spellSpawnInterval?: any;
  private boxSpawnInterval?: any;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Game starts when user clicks start
  }

  ngAfterViewInit(): void {
    // Initialize scratch canvases after rewards are shown
    if (this.gameState.showScratchCards) {
      this.initializeScratchCards();
    }
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isBrowser || !this.gameState.isPlaying) return;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.isGameOver = false;
    this.gameState.isFinished = false;
    this.gameState.distance = 0;
    this.gameState.collectedBoxes = [];
    this.gameState.collectedRewards = [];
    this.spells = [];
    this.mysteryBoxes = [];
    this.player.x = 100;
    this.player.y = 300;
    this.player.lives = 5;
    this.currentEffect = '';

    this.startGameLoop();
    this.startSpellSpawning();
    this.startBoxSpawning();
  }

  /**
   * Main game loop
   */
  private startGameLoop(): void {
    if (!this.isBrowser) return;

    const gameLoop = () => {
      if (!this.gameState.isPlaying) return;

      this.updatePlayer();
      this.updateSpells();
      this.updateMysteryBoxes();
      this.checkCollisions();
      this.checkWinCondition();

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Update player position based on mouse
   */
  private updatePlayer(): void {
    if (this.player.isStunned || this.player.isFrozen) return;

    // Calculate direction to mouse
    const dx = this.mouseX - this.player.x;
    const dy = this.mouseY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Speed increases with distance
    const maxSpeed = 8;
    const speed = Math.min(distance / 30, maxSpeed);

    if (distance > 10) {
      this.player.velocityX = (dx / distance) * speed;
      this.player.velocityY = (dy / distance) * speed;

      // Calculate rotation angle
      this.player.rotation = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Update position
    this.player.x += this.player.velocityX;
    this.player.y += this.player.velocityY;

    // Boundaries
    this.player.x = Math.max(50, Math.min(window.innerWidth - 50, this.player.x));
    this.player.y = Math.max(50, Math.min(window.innerHeight - 250, this.player.y));

    // Update distance traveled
    this.gameState.distance += Math.abs(this.player.velocityX) * 0.5;
  }

  /**
   * Spawn spells periodically
   */
  private startSpellSpawning(): void {
    if (!this.isBrowser) return;

    this.spellSpawnInterval = setInterval(() => {
      if (!this.gameState.isPlaying) return;

      const spellTypes = Object.values(SpellType);
      const randomType = spellTypes[Math.floor(Math.random() * spellTypes.length)];
      const spellEffect = SPELL_EFFECTS[randomType];

      const spell: Spell = {
        id: `spell-${Date.now()}-${Math.random()}`,
        type: randomType,
        x: window.innerWidth + 50,
        y: Math.random() * (window.innerHeight - 300) + 50,
        speed: 3 + Math.random() * 3,
        effect: spellEffect.effect,
        color: spellEffect.color
      };

      this.spells.push(spell);
    }, 1500);
  }

  /**
   * Spawn mystery boxes
   */
  private startBoxSpawning(): void {
    if (!this.isBrowser) return;

    this.boxSpawnInterval = setInterval(() => {
      if (!this.gameState.isPlaying) return;

      const box: MysteryBox = {
        id: `box-${Date.now()}-${Math.random()}`,
        x: window.innerWidth + 50,
        y: Math.random() * (window.innerHeight - 300) + 50,
        collected: false
      };

      this.mysteryBoxes.push(box);
    }, 2500);
  }

  /**
   * Update spell positions
   */
  private updateSpells(): void {
    this.spells = this.spells.filter(spell => {
      spell.x -= spell.speed;
      return spell.x > -50;
    });
  }

  /**
   * Update mystery box positions
   */
  private updateMysteryBoxes(): void {
    this.mysteryBoxes = this.mysteryBoxes.filter(box => {
      if (!box.collected) {
        box.x -= 2;
      }
      return box.x > -50;
    });
  }

  /**
   * Check collisions
   */
  private checkCollisions(): void {
    // Check spell collisions
    for (const spell of this.spells) {
      const distance = Math.sqrt(
        Math.pow(spell.x - this.player.x, 2) +
        Math.pow(spell.y - this.player.y, 2)
      );

      if (distance < 50) {
        this.handleSpellHit(spell);
        return;
      }
    }

    // Check mystery box collisions
    for (const box of this.mysteryBoxes) {
      if (box.collected) continue;

      const distance = Math.sqrt(
        Math.pow(box.x - this.player.x, 2) +
        Math.pow(box.y - this.player.y, 2)
      );

      if (distance < 50) {
        this.collectMysteryBox(box);
      }
    }
  }

  /**
   * Handle spell hit
   */
  private handleSpellHit(spell: Spell): void {
    // Remove the spell
    this.spells = this.spells.filter(s => s.id !== spell.id);
    
    // Lose a life
    this.player.lives--;
    this.currentEffect = spell.effect;

    // Show effect animation
    switch (spell.type) {
      case SpellType.STUPEFY:
        this.player.isStunned = true;
        break;
      case SpellType.INCENDIO:
        this.player.isBurning = true;
        break;
      case SpellType.GLACIUS:
        this.player.isFrozen = true;
        break;
      case SpellType.CONFRINGO:
        this.player.isExploding = true;
        break;
    }

    // Reset effect after duration
    setTimeout(() => {
      this.player.isStunned = false;
      this.player.isBurning = false;
      this.player.isFrozen = false;
      this.player.isExploding = false;
      this.currentEffect = '';
      
      // Check if game over (no lives left)
      if (this.player.lives <= 0) {
        this.gameOver();
      } else {
        // Reset player position after hit
        this.player.x = 100;
        this.player.y = 300;
      }
    }, SPELL_EFFECTS[spell.type].duration);
  }

  /**
   * Collect mystery box
   */
  private collectMysteryBox(box: MysteryBox): void {
    box.collected = true;
    
    // Randomly assign a reward
    const randomReward = POSSIBLE_REWARDS[Math.floor(Math.random() * POSSIBLE_REWARDS.length)];
    const reward: Reward = { ...randomReward, revealed: false };
    box.reward = reward;
    
    this.gameState.collectedBoxes.push(box);
    this.gameState.collectedRewards.push(reward);
  }

  /**
   * Check if player reached finish line
   */
  private checkWinCondition(): void {
    if (this.gameState.distance >= this.gameState.finishLine) {
      this.winGame();
    }
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.gameState.isPlaying = false;
    this.gameState.isGameOver = true;
    this.stopGame();
  }

  /**
   * Win game
   */
  private winGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isFinished = true;
    this.stopGame();
    this.prepareRewards();
  }

  /**
   * Stop game loops
   */
  private stopGame(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.spellSpawnInterval) {
      clearInterval(this.spellSpawnInterval);
    }
    if (this.boxSpawnInterval) {
      clearInterval(this.boxSpawnInterval);
    }
  }

  /**
   * Prepare rewards from collected boxes
   */
  private prepareRewards(): void {
    this.rewards = [];
    const availableRewards = [...POSSIBLE_REWARDS];

    for (const box of this.gameState.collectedBoxes) {
      if (availableRewards.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableRewards.length);
      const reward = { ...availableRewards[randomIndex] };
      reward.revealed = false;
      this.rewards.push(reward);
      availableRewards.splice(randomIndex, 1);
    }
  }

  /**
   * Show scratch cards
   */
  showRewards(): void {
    this.gameState.showScratchCards = true;
    // Initialize scratch cards after view updates
    setTimeout(() => {
      this.initializeScratchCards();
    }, 100);
  }

  /**
   * Scratch a card to reveal reward (kept for backward compatibility, actual scratching is in scratch method)
   */
  scratchCard(reward: Reward): void {
    reward.revealed = true;
  }

  /**
   * Change Hogwarts house
   */
  changeHouse(house: HogwartsHouse): void {
    this.player.house = house;
    this.showHouseSelector = false;
  }

  /**
   * Toggle house selector
   */
  toggleHouseSelector(): void {
    this.showHouseSelector = !this.showHouseSelector;
  }

  /**
   * Get current house config
   */
  get currentHouse(): HouseConfig {
    return HOUSE_CONFIGS[this.player.house];
  }

  /**
   * Get progress percentage
   */
  get progressPercentage(): number {
    return Math.min((this.gameState.distance / this.gameState.finishLine) * 100, 100);
  }

  /**
   * Check if all rewards are revealed
   */
  get allRewardsRevealed(): boolean {
    return this.rewards.length > 0 && this.rewards.every(r => r.revealed);
  }

  /**
   * Restart game
   */
  restartGame(): void {
    this.player.isStunned = false;
    this.player.isBurning = false;
    this.player.isFrozen = false;
    this.player.isExploding = false;
    this.currentEffect = '';
    this.startGame();
  }

  /**
   * Navigate to questionnaire
   */
  goToQuestionnaire(): void {
    this.router.navigate(['/questionnaire']);
  }

  /**
   * Navigate to next page (kept for backward compatibility)
   */
  nextPage(): void {
    this.router.navigate(['/questionnaire']);
  }

  /**
   * Get reward icon text based on type
   */
  getRewardIconText(type: string): string {
    const iconMap: Record<string, string> = {
      'gift_card': 'GIFT CARD',
      'clothing': 'CLOTHING',
      'accessory': 'ACCESSORY',
      'date': 'DATE',
      'experience': 'EXPERIENCE',
      'personal': 'PERSONAL',
      'misc': 'MISC'
    };
    return iconMap[type] || 'REWARD';
  }

  /**
   * Initialize scratch cards
   */
  initializeScratchCards(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.rewards.forEach(reward => {
        const canvas = document.getElementById(`canvas-${reward.id}`) as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Fill with scratch-off layer
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(0, 0, 200, 250);
            
            // Add "SCRATCH" text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText('SCRATCH', 100, 120);
            ctx.fillText('TO REVEAL', 100, 150);
            
            this.scratchCanvases.set(reward.id, canvas);
            this.scratchContexts.set(reward.id, ctx);
          }
        }
      });
    }, 100);
  }

  /**
   * Start scratching
   */
  startScratching(event: MouseEvent, reward: Reward): void {
    if (reward.revealed) return;
    this.scratchingRewardId = reward.id;
  }

  /**
   * Scratch the card
   */
  scratch(event: MouseEvent, reward: Reward): void {
    if (this.scratchingRewardId !== reward.id || reward.revealed) return;

    const ctx = this.scratchContexts.get(reward.id);
    const canvas = this.scratchCanvases.get(reward.id);
    
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check if enough scratched
    this.checkScratchProgress(reward);
  }

  /**
   * Stop scratching
   */
  stopScratching(): void {
    this.scratchingRewardId = null;
  }

  /**
   * Check scratch progress
   */
  checkScratchProgress(reward: Reward): void {
    const canvas = this.scratchCanvases.get(reward.id);
    const ctx = this.scratchContexts.get(reward.id);
    
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, 200, 250);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const scratchedPercent = (transparent / (200 * 250)) * 100;
    
    if (scratchedPercent > 50) {
      reward.revealed = true;
    }
  }

  /**
   * Export reward card
   */
  exportRewardCard(): void {
    if (!this.isBrowser) return;

    const canvas = this.exportCanvas.nativeElement;
    canvas.width = 1100;
    canvas.height = Math.max(900, 500 + this.rewards.length * 75); // Dynamic height based on rewards
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw Minecraft-style background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#654321');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixelated border
    ctx.fillStyle = '#4A2511';
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

    // Inner border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('REWARDS UNLOCKED', canvas.width / 2, 110);
    ctx.shadowColor = 'transparent';

    // Draw character (hoodie guy with birthday cap HOLDING cake)
    this.drawCharacterWithCake(ctx, 120, 200);
    
    // Player info box under character
    ctx.fillStyle = 'rgba(74, 37, 17, 0.8)';
    ctx.fillRect(100, 520, 250, 120);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 520, 250, 120);
    
    // Player name
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Player: Kiyoshi Jasper', 225, 550);
    
    // Gifts collected
    ctx.font = '18px Georgia';
    ctx.fillStyle = '#F5DEB3';
    ctx.fillText(`Gifts Collected: ${this.rewards.length}`, 225, 585);
    
    // Remaining lives
    const heartsDisplay = '❤️'.repeat(this.player.lives) + '🖤'.repeat(this.player.maxLives - this.player.lives);
    ctx.fillText(`Lives: ${heartsDisplay}`, 225, 615);

    // Draw rewards list with better spacing
    ctx.textAlign = 'left';
    let yPos = 220;

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 26px Georgia';
    ctx.fillText('Rewards Unlocked:', 400, yPos);
    
    yPos += 45;
    
    this.rewards.forEach((reward, index) => {
      // Reward card background
      ctx.fillStyle = index % 2 === 0 ? '#F5DEB3' : '#DEB887';
      ctx.fillRect(400, yPos - 25, 630, 65);
      
      // Border for each reward
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.strokeRect(400, yPos - 25, 630, 65);
      
      // Reward name
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 19px Georgia';
      ctx.fillText(`${index + 1}. ${reward.name}`, 415, yPos);
      
      // Reward description with wrapping
      ctx.fillStyle = '#4A2511';
      ctx.font = '15px Georgia';
      const maxWidth = 600;
      const words = reward.description.split(' ');
      let line = '';
      let lineY = yPos + 22;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 415, lineY);
          line = word + ' ';
          lineY += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 415, lineY);
      
      yPos += 75;
    });

    // Footer with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Happy Birthday Joy!', canvas.width / 2, canvas.height - 70);

    // Download
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'birthday-rewards-joy.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Draw character with birthday cap and cake
   */
  drawCharacterWithCake(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const scale = 1.5; // Make character bigger and prettier
    
    // Birthday cap (vibrant and stylish)
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.moveTo(x + 60 * scale, y);
    ctx.lineTo(x + 30 * scale, y + 40 * scale);
    ctx.lineTo(x + 90 * scale, y + 40 * scale);
    ctx.fill();
    
    // Cap stripes for detail
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 40 * scale, y + 20 * scale);
    ctx.lineTo(x + 80 * scale, y + 20 * scale);
    ctx.stroke();
    
    // Cap pom-pom with sparkle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 60 * scale, y, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Head (perfectly round and smooth)
    ctx.fillStyle = '#e8b896';
    ctx.beginPath();
    ctx.arc(x + 60 * scale, y + 70 * scale, 38 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a07c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Stylish hair on head (fuller coverage)
    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    // Left side hair
    ctx.arc(x + 35 * scale, y + 50 * scale, 15 * scale, 0, Math.PI * 2);
    // Right side hair
    ctx.arc(x + 85 * scale, y + 50 * scale, 15 * scale, 0, Math.PI * 2);
    // Top hair coverage
    ctx.arc(x + 50 * scale, y + 40 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.arc(x + 70 * scale, y + 40 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.arc(x + 60 * scale, y + 35 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Beautiful eyes (anime-style)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 48 * scale, y + 67 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.arc(x + 72 * scale, y + 67 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights (double sparkle)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 50 * scale, y + 65 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 74 * scale, y + 65 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 46 * scale, y + 69 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 70 * scale, y + 69 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Close-trimmed SPOTTED beard (handsome stubble style)
    ctx.fillStyle = '#3d2817';
    // Draw individual beard dots for spotted effect
    const beardDots = [
      // Left jawline
      { x: 28, y: 88 }, { x: 32, y: 85 }, { x: 25, y: 92 }, { x: 30, y: 95 },
      { x: 35, y: 90 }, { x: 38, y: 93 }, { x: 33, y: 98 }, { x: 28, y: 100 },
      // Right jawline
      { x: 92, y: 88 }, { x: 88, y: 85 }, { x: 95, y: 92 }, { x: 90, y: 95 },
      { x: 85, y: 90 }, { x: 82, y: 93 }, { x: 87, y: 98 }, { x: 92, y: 100 },
      // Chin area
      { x: 50, y: 100 }, { x: 55, y: 102 }, { x: 60, y: 104 }, { x: 65, y: 102 },
      { x: 70, y: 100 }, { x: 58, y: 100 }, { x: 62, y: 101 }, { x: 52, y: 98 },
      { x: 68, y: 98 }, { x: 56, y: 105 }, { x: 64, y: 105 }, { x: 60, y: 107 },
      // Under chin
      { x: 48, y: 103 }, { x: 72, y: 103 }, { x: 54, y: 106 }, { x: 66, y: 106 }
    ];
    
    for (const dot of beardDots) {
      ctx.beginPath();
      ctx.arc(x + dot.x * scale, y + dot.y * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Close-trimmed spotted mustache
    const mustacheDots = [
      // Left mustache
      { x: 38, y: 84 }, { x: 42, y: 83 }, { x: 46, y: 84 }, { x: 40, y: 86 },
      { x: 44, y: 85 }, { x: 48, y: 85 }, { x: 50, y: 84 },
      // Right mustache
      { x: 82, y: 84 }, { x: 78, y: 83 }, { x: 74, y: 84 }, { x: 80, y: 86 },
      { x: 76, y: 85 }, { x: 72, y: 85 }, { x: 70, y: 84 }
    ];
    
    for (const dot of mustacheDots) {
      ctx.beginPath();
      ctx.arc(x + dot.x * scale, y + dot.y * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Nose
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(x + 60 * scale, y + 78 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 130, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(x + 33 * scale, y + 78 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.arc(x + 87 * scale, y + 78 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Happy smile (below mustache)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 60 * scale, y + 90 * scale, 12 * scale, 0.3, Math.PI - 0.3, false);
    ctx.stroke();

    // Hoodie body (stylish black)
    ctx.fillStyle = '#1f1f1f';
    ctx.beginPath();
    ctx.roundRect(x + 22 * scale, y + 108 * scale, 76 * scale, 85 * scale, 12);
    ctx.fill();
    ctx.strokeStyle = '#5A5A5A';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Hoodie zipper
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 60 * scale, y + 115 * scale);
    ctx.lineTo(x + 60 * scale, y + 180 * scale);
    ctx.stroke();
    
    // Zipper pull
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(x + 60 * scale, y + 115 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Hoodie strings
    ctx.strokeStyle = '#A0A0A0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 48 * scale, y + 112 * scale);
    ctx.lineTo(x + 48 * scale, y + 125 * scale);
    ctx.moveTo(x + 72 * scale, y + 112 * scale);
    ctx.lineTo(x + 72 * scale, y + 125 * scale);
    ctx.stroke();

    // Magical house cape
    ctx.fillStyle = this.currentHouse.capeColor;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(x + 27 * scale, y + 118 * scale);
    ctx.lineTo(x + 93 * scale, y + 118 * scale);
    ctx.quadraticCurveTo(x + 103 * scale, y + 160 * scale, x + 98 * scale, y + 188 * scale);
    ctx.lineTo(x + 22 * scale, y + 188 * scale);
    ctx.quadraticCurveTo(x + 17 * scale, y + 160 * scale, x + 27 * scale, y + 118 * scale);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#1a4d1a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arms positioned to hold cake
    ctx.fillStyle = '#1f1f1f';
    
    // Left arm bent to hold cake
    ctx.beginPath();
    ctx.roundRect(x + 3 * scale, y + 120 * scale, 20 * scale, 45 * scale, 8);
    ctx.fill();
    ctx.strokeStyle = '#5A5A5A';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Right arm bent to hold cake
    ctx.beginPath();
    ctx.roundRect(x + 97 * scale, y + 120 * scale, 20 * scale, 45 * scale, 8);
    ctx.fill();
    ctx.stroke();
    
    // Hands holding cake (skin tone)
    ctx.fillStyle = '#e8b896';
    
    // Left hand
    ctx.beginPath();
    ctx.arc(x + 18 * scale, y + 168 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a07c';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Right hand
    ctx.beginPath();
    ctx.arc(x + 102 * scale, y + 168 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // === CAKE IN HANDS (DRAWN IN FRONT) ===
    this.drawCake(ctx, x + 30 * scale, y + 145 * scale, scale * 0.8);
    // =====================================

    // Legs (stylish fit)
    ctx.fillStyle = '#2d2d2d';
    ctx.beginPath();
    ctx.roundRect(x + 36 * scale, y + 193 * scale, 21 * scale, 52 * scale, 9);
    ctx.roundRect(x + 63 * scale, y + 193 * scale, 21 * scale, 52 * scale, 9);
    ctx.fill();
    ctx.strokeStyle = '#5A5A5A';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Stylish sneakers
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.roundRect(x + 31 * scale, y + 245 * scale, 30 * scale, 13 * scale, 7);
    ctx.roundRect(x + 59 * scale, y + 245 * scale, 30 * scale, 13 * scale, 7);
    ctx.fill();
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Shoe laces
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 38 * scale, y + 248 * scale);
    ctx.lineTo(x + 54 * scale, y + 248 * scale);
    ctx.moveTo(x + 66 * scale, y + 248 * scale);
    ctx.lineTo(x + 82 * scale, y + 248 * scale);
    ctx.stroke();
  }

  /**
   * Draw vanilla cake
   */
  drawCake(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
    // Cake base (3 layers for detail)
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.roundRect(x, y + 30 * scale, 60 * scale, 15 * scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.roundRect(x + 5 * scale, y + 15 * scale, 50 * scale, 15 * scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#F0E68C';
    ctx.stroke();
    
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.roundRect(x + 10 * scale, y, 40 * scale, 15 * scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#D2B48C';
    ctx.stroke();

    // Frosting swirls on top
    ctx.fillStyle = '#FFE4E1';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x + 15 * scale + i * 10 * scale, y, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFB6C1';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Candle (bigger and prettier)
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.roundRect(x + 25 * scale, y - 20 * scale, 8 * scale, 20 * scale, 2);
    ctx.fill();
    ctx.strokeStyle = '#C71585';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flame with glow
    ctx.shadowColor = 'rgba(255, 99, 71, 0.8)';
    ctx.shadowBlur = 10 * scale;
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(x + 29 * scale, y - 28 * scale);
    ctx.lineTo(x + 24 * scale, y - 20 * scale);
    ctx.lineTo(x + 34 * scale, y - 20 * scale);
    ctx.fill();
    
    // Inner flame
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x + 29 * scale, y - 26 * scale);
    ctx.lineTo(x + 26 * scale, y - 22 * scale);
    ctx.lineTo(x + 32 * scale, y - 22 * scale);
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
}

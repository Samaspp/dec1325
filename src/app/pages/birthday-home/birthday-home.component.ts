import { Component, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BalloonComponent } from '../../components/balloon/balloon.component';
import { PhysicsEngineService } from '../../services/physics-engine.service';
import { 
  Balloon, 
  BalloonState, 
  BalloonColor,
  Position,
  ImpactEffect
} from '../../models/balloon.model';

/**
 * BIRTHDAY HOME PAGE COMPONENT
 * 
 * Epic celebration page with pixel-art anime characters on green meadow
 */

// Anime character interface for pixel art drawing
interface AnimeCharacter {
  id: number;
  name: string;
  anime: string;
  quote: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pose: string;
}

@Component({
  selector: 'app-birthday-home',
  standalone: true,
  imports: [CommonModule, BalloonComponent],
  templateUrl: './birthday-home.component.html',
  styleUrls: ['./birthday-home.component.css']
})
export class BirthdayHomeComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('charactersCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Balloon management
  balloons: Balloon[] = [];
  
  // Canvas/viewport dimensions
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  
  // Animation control
  private animationFrameId: number = 0;
  private lastFrameTime: number = 0;
  
  // Configuration constants
  private readonly INITIAL_BALLOON_COUNT = 29;
  private readonly BALLOON_RADIUS = 25;
  private readonly BALLOON_MASS = 1.0;
  private readonly BALLOON_ELASTICITY = 0.8;
  
  // Platform detection
  private isBrowser: boolean;
  
  // Character hover state
  hoveredCharacter: number | null = null;
  tooltipX: number = 0;
  tooltipY: number = 0;
  
  // Actual drawn bounds for each character (for accurate hover detection)
  // Stored as { minX, minY, maxX, maxY } in SCREEN coordinates
  private characterBounds: Map<number, { minX: number; minY: number; maxX: number; maxY: number }> = new Map();
  
  // Tracking current character drawing bounds (in canvas 2450x800 space)
  private currentDrawBounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;

  // Pixel art anime characters with SCATTERED positions at different heights showing personalities
  animeCharacters: AnimeCharacter[] = [
    // Row 1 - Back/Top of meadow (higher y = further from camera, drawn higher up)
    { id: 1, name: 'Eikichi Onizuka', anime: 'Great Teacher Onizuka', quote: 'The greatest lesson is to never give up!', x: 20, y: 280, width: 200, height: 520, pose: 'smoking' },
    { id: 2, name: 'Naruto Uzumaki', anime: 'Naruto', quote: 'Believe it! Dattebayo!', x: 350, y: 270, width: 200, height: 512, pose: 'running' },
    { id: 3, name: 'Eren Yeager', anime: 'Attack on Titan', quote: 'I will keep moving forward!', x: 400, y: -260, width: 260, height: 520, pose: 'titan' },
    { id: 4, name: 'Ichigo Kurosaki', anime: 'Bleach', quote: 'I will protect everyone!', x: 800, y: 250, width: 180, height: 656, pose: 'sword' },
    { id: 5, name: 'Maomao', anime: 'Apothecary Diaries', quote: 'Poison is just medicine in wrong dose.', x: 1450, y: 150, width: 200, height: 300, pose: 'mixing' },
    { id: 6, name: 'Monkey D. Luffy', anime: 'One Piece', quote: 'Im gonna be King of the Pirates!', x: 1600, y: 240, width: 260, height: 540, pose: 'eating' },
    { id: 7, name: 'Roronoa Zoro', anime: 'One Piece', quote: 'HAPPY BIRTHDAY JOY!', x: 1950, y: 250, width: 280, height: 520, pose: 'placard' },
    
    // Row 2 - Middle of meadow (medium y values)
    { id: 8, name: 'Tanjiro Kamado', anime: 'Demon Slayer', quote: 'I will not give up!', x: 150, y: -120, width: 180, height: 540, pose: 'waterBreathing' },
    { id: 9, name: 'Nezuko Kamado', anime: 'Demon Slayer', quote: 'Hmm hmm!', x: 300, y: -180, width: 150, height: 320, pose: 'sitting' },
    { id: 10, name: 'Kirito', anime: 'Sword Art Online', quote: 'This is not just a game.', x: 650, y: 0, width: 180, height: 544, pose: 'dualWield' },
    { id: 11, name: 'Asuna', anime: 'Sword Art Online', quote: 'I will fight by your side!', x: 1000, y:100, width: 180, height: 544, pose: 'rapier' },
    { id: 12, name: 'Levi Ackerman', anime: 'Attack on Titan', quote: 'Tch. Filthy.', x: 1300, y: -150, width: 180, height: 464, pose: 'cleaning' },
    { id: 13, name: 'Mikasa Ackerman', anime: 'Attack on Titan', quote: 'Eren...', x: 1550, y: -80, width: 180, height: 496, pose: 'scarf' },
    { id: 14, name: 'Sakura Haruno', anime: 'Naruto', quote: 'Shannaro!', x: 1850, y: -130, width: 220, height: 496, pose: 'punch' },
    
    // Row 3 - Front of meadow (lower y = closer to camera, drawn at bottom)
    { id: 15, name: 'Sasuke Uchiha', anime: 'Naruto', quote: 'I am an avenger.', x: 100, y: -490, width: 240, height: 560, pose: 'chidori' },
    { id: 16, name: 'Zenitsu Agatsuma', anime: 'Demon Slayer', quote: 'I want to live peacefully!', x: 650, y: -400, width: 300, height: 160, pose: 'sleeping' },
    { id: 17, name: 'Inosuke Hashibira', anime: 'Demon Slayer', quote: 'PIG ASSAULT!', x: 920, y: -400, width: 200, height: 560, pose: 'charging' },
    { id: 18, name: 'Nami', anime: 'One Piece', quote: 'Money makes the world go round!', x: 1100, y: -380, width: 220, height: 496, pose: 'map' },
    { id: 19, name: 'Sanji', anime: 'One Piece', quote: 'A true gentleman!', x: 1400, y: -500, width: 240, height: 528, pose: 'cooking' },
    { id: 20, name: 'Rukia Kuchiki', anime: 'Bleach', quote: 'Dance, Sode no Shirayuki!', x: 1700, y: -395, width: 240, height: 464, pose: 'ice' },
    { id: 21, name: 'Goku', anime: 'Dragon Ball Z', quote: 'Kamehameha!', x: 2000, y: -470, width: 260, height: 540, pose: 'kamehameha' },
    { id: 22, name: 'Vegeta', anime: 'Dragon Ball Z', quote: 'Prince of all Saiyans!', x: 2300, y: -390, width: 180, height: 592, pose: 'arms-crossed' }
  ];
  
  private characterCanvas: HTMLCanvasElement | null = null;
  private characterCtx: CanvasRenderingContext2D | null = null;
  
  constructor(
    private physicsEngine: PhysicsEngineService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * LLD: COMPONENT INITIALIZATION
   * 
   * Flow:
   * 1. Calculate viewport dimensions
   * 2. Generate initial balloon set
   * 3. Start animation loop
   * 
   * Note: Only runs in browser environment (SSR compatible)
   * 
   * Called once when component loads
   */
  ngOnInit(): void {
    // Only initialize if running in browser (not during SSR)
    if (this.isBrowser) {
      this.updateCanvasDimensions();
      this.generateBalloons();
      this.startAnimationLoop();
    }
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser && this.canvasRef) {
      this.initCharacterCanvas();
      this.drawAllCharacters();
    }
  }
  
  // Helper methods for template
  getCharacterName(id: number): string {
    const char = this.animeCharacters.find(c => c.id === id);
    return char ? char.name : '';
  }
  
  getCharacterAnime(id: number): string {
    const char = this.animeCharacters.find(c => c.id === id);
    return char ? char.anime : '';
  }
  
  getCharacterQuote(id: number): string {
    const char = this.animeCharacters.find(c => c.id === id);
    return char ? char.quote : '';
  }
  
  // Initialize canvas for character drawing
  private initCharacterCanvas(): void {
    this.characterCanvas = this.canvasRef.nativeElement;
    this.characterCtx = this.characterCanvas.getContext('2d');
    
    // Set canvas size to viewport width
    this.updateCanvasSize();
    
    // Enable pixel-perfect rendering
    if (this.characterCtx) {
      this.characterCtx.imageSmoothingEnabled = false;
    }
    
    // Redraw on window resize
    if (this.isBrowser) {
      window.addEventListener('resize', () => {
        this.updateCanvasSize();
        this.drawAllCharacters();
      });
    }
  }
  
  private updateCanvasSize(): void {
    if (!this.characterCanvas) return;
    this.characterCanvas.width = window.innerWidth;
    this.characterCanvas.height = 800; // 4x size for big recognizable characters
  }
  
  // Mouse move handler for character hover detection with viewport scaling
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.characterCanvas) return;
    
    const rect = this.characterCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check if mouse is over any character using actual drawn bounds
    let found = false;
    for (const char of this.animeCharacters) {
      const bounds = this.characterBounds.get(char.id);
      if (!bounds) continue;
      
      if (mouseX >= bounds.minX && mouseX <= bounds.maxX && 
          mouseY >= bounds.minY && mouseY <= bounds.maxY) {
        this.hoveredCharacter = char.id;
        this.tooltipX = event.clientX + 15;
        this.tooltipY = event.clientY - 80;
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.hoveredCharacter = null;
    }
  }

  /**
   * LLD: UPDATE CANVAS DIMENSIONS
   * 
   * Algorithm: Get viewport size from window object
   * Used for boundary collision detection
   * 
   * SSR Compatible: Only accesses window in browser
   */
  private updateCanvasDimensions(): void {
    if (this.isBrowser) {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
    } else {
      // Default dimensions for SSR
      this.canvasWidth = 1920;
      this.canvasHeight = 1080;
    }
  }

  /**
   * LLD: BALLOON GENERATION
   * 
   * Algorithm: Create initial set of balloons with random properties
   * 
   * Steps for each balloon:
   * 1. Generate unique ID
   * 2. Assign random color from palette
   * 3. Calculate random spawn position (avoid edges)
   * 4. Generate random velocity using physics engine
   * 5. Set physical properties (mass, radius, elasticity)
   * 6. Initialize state as ACTIVE
   * 
   * Collision Avoidance:
   * - Spawn balloons with minimum spacing
   * - If overlap detected, regenerate position
   */
  private generateBalloons(): void {
    const colors = Object.values(BalloonColor);
    
    for (let i = 0; i < this.INITIAL_BALLOON_COUNT; i++) {
      let position: Position;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Try to find non-overlapping position
      do {
        position = {
          x: this.BALLOON_RADIUS + Math.random() * (this.canvasWidth - 2 * this.BALLOON_RADIUS),
          y: this.BALLOON_RADIUS + Math.random() * (this.canvasHeight - 2 * this.BALLOON_RADIUS)
        };
        attempts++;
      } while (this.isPositionOverlapping(position) && attempts < maxAttempts);
      
      // Create balloon object with sequential number
      const balloon: Balloon = {
        id: `balloon-${i}-${Date.now()}`,
        number: i + 1, // Balloon numbers 1-29
        position: position,
        velocity: this.physicsEngine.generateRandomVelocity(0.5, 2.5),
        radius: this.BALLOON_RADIUS,
        color: colors[Math.floor(Math.random() * colors.length)],
        state: BalloonState.ACTIVE,
        mass: this.BALLOON_MASS,
        elasticity: this.BALLOON_ELASTICITY,
        createdAt: Date.now()
      };
      
      this.balloons.push(balloon);
    }
  }

  /**
   * LLD: POSITION OVERLAP CHECK
   * 
   * Algorithm: Check if position overlaps with existing balloons
   * Used during balloon generation to prevent initial overlaps
   * 
   * @param position Position to check
   * @returns True if overlapping with any balloon
   */
  private isPositionOverlapping(position: Position): boolean {
    return this.balloons.some(balloon => {
      const distance = this.physicsEngine.calculateDistance(position, balloon.position);
      return distance < (this.BALLOON_RADIUS * 2 + 10); // 10px minimum spacing
    });
  }

  /**
   * LLD: ANIMATION LOOP
   * 
   * Algorithm: Main game loop using requestAnimationFrame
   * 
   * Flow:
   * 1. Calculate delta time since last frame
   * 2. Update physics for all balloons
   * 3. Detect and resolve collisions
   * 4. Check boundary collisions
   * 5. Clean up popped balloons
   * 6. Request next frame
   * 
   * Performance: 60 FPS target, delta time for frame-rate independence
   */
  private startAnimationLoop(): void {
    this.lastFrameTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 16.67; // Normalize to 60 FPS
    this.lastFrameTime = currentTime;
    
    // Update physics for all active balloons
    this.updateBalloonPhysics(deltaTime);
    
    // Detect and resolve collisions
    this.handleCollisions();
    
    // Check boundary collisions
    this.checkBoundaries();
    
    // Clean up popped balloons after animation completes
    this.cleanupPoppedBalloons();
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  /**
   * LLD: PHYSICS UPDATE FOR ALL BALLOONS
   * 
   * Algorithm: Apply physics engine updates to each active balloon
   * 
   * @param deltaTime Time elapsed since last frame
   */
  private updateBalloonPhysics(deltaTime: number): void {
    this.balloons.forEach(balloon => {
      if (balloon.state === BalloonState.ACTIVE) {
        this.physicsEngine.updatePhysics(balloon, deltaTime);
      }
    });
  }

  /**
   * LLD: COLLISION DETECTION & RESOLUTION
   * 
   * Algorithm: N² collision check with optimization
   * 
   * Optimization:
   * - Only check pairs once (i, j where j > i)
   * - Skip non-active balloons
   * - Early exit if no collision
   * 
   * Steps:
   * 1. For each balloon pair
   * 2. Detect collision using physics engine
   * 3. If collision, resolve using momentum conservation
   */
  private handleCollisions(): void {
    const activeBalloons = this.balloons.filter(b => b.state === BalloonState.ACTIVE);
    
    for (let i = 0; i < activeBalloons.length; i++) {
      for (let j = i + 1; j < activeBalloons.length; j++) {
        const collisionResult = this.physicsEngine.detectCollision(
          activeBalloons[i],
          activeBalloons[j]
        );
        
        if (collisionResult.hasCollision) {
          this.physicsEngine.resolveCollision(
            activeBalloons[i],
            activeBalloons[j]
          );
        }
      }
    }
  }

  /**
   * LLD: BOUNDARY COLLISION CHECK
   * 
   * Algorithm: Check screen edge collisions for each balloon
   * Uses physics engine for bounce mechanics
   */
  private checkBoundaries(): void {
    this.balloons.forEach(balloon => {
      this.physicsEngine.checkBoundaryCollision(
        balloon,
        this.canvasWidth,
        this.canvasHeight
      );
    });
  }

  /**
   * LLD: BALLOON POP HANDLER
   * 
   * Algorithm: Handle click event from child balloon component
   * 
   * Flow:
   * 1. Find clicked balloon by ID
   * 2. Change state to POPPING (triggers animation)
   * 3. Calculate pop impact effects on nearby balloons
   * 4. Apply velocity changes to affected balloons
   * 5. Schedule state change to POPPED after animation
   * 
   * Physics:
   * - Pop creates radial shockwave
   * - Nearby balloons receive velocity boost
   * - Force decreases with distance (inverse square)
   * 
   * @param balloonId ID of clicked balloon
   */
  onBalloonClick(balloonId: string): void {
    const balloon = this.balloons.find(b => b.id === balloonId);
    
    if (balloon && balloon.state === BalloonState.ACTIVE) {
      // Change state to popping
      balloon.state = BalloonState.POPPING;
      
      // Calculate impact effects on nearby balloons
      const activeBalloons = this.balloons.filter(
        b => b.state === BalloonState.ACTIVE && b.id !== balloonId
      );
      
      const impacts = this.physicsEngine.calculatePopImpact(
        balloon.position,
        activeBalloons
      );
      
      // Apply impact effects
      this.applyImpactEffects(impacts);
      
      // Schedule state change to POPPED after animation duration
      setTimeout(() => {
        if (balloon) {
          balloon.state = BalloonState.POPPED;
        }
      }, 300); // Match pop animation duration
    }
  }

  /**
   * LLD: APPLY IMPACT EFFECTS
   * 
   * Algorithm: Apply velocity changes from pop shockwave
   * 
   * @param impacts Array of impact effects to apply
   */
  private applyImpactEffects(impacts: ImpactEffect[]): void {
    impacts.forEach(impact => {
      const balloon = this.balloons.find(b => b.id === impact.balloonId);
      if (balloon && balloon.state === BalloonState.ACTIVE) {
        // Add impact velocity to current velocity
        balloon.velocity.vx += impact.velocityChange.vx;
        balloon.velocity.vy += impact.velocityChange.vy;
      }
    });
  }

  /**
   * LLD: CLEANUP POPPED BALLOONS
   * 
   * Algorithm: Remove balloons in POPPED state from array
   * Called each frame to maintain clean state
   */
  private cleanupPoppedBalloons(): void {
    this.balloons = this.balloons.filter(b => b.state !== BalloonState.POPPED);
  }

  /**
   * LLD: NAVIGATION HANDLER
   * 
   * Purpose: Navigate to next celebration page (letter scroll)
   */
  navigateToNext(): void {
    this.router.navigate(['/next-page']);
  }

  /**
   * LLD: COMPONENT CLEANUP
   * 
   * Purpose: Stop animation loop and cleanup resources
   * Prevents memory leaks when component is destroyed
   */
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * UTILITY: Get remaining balloon count
   * Used in template for display
   */
  get remainingBalloonCount(): number {
    return this.balloons.filter(b => b.state === BalloonState.ACTIVE).length;
  }

  /**
   * UTILITY: TrackBy function for *ngFor optimization
   * Prevents unnecessary re-renders of balloon components
   */
  trackByBalloonId(index: number, balloon: Balloon): string {
    return balloon.id;
  }
  
  // ==================== PIXEL ART CHARACTER DRAWING ====================
  
  private drawAllCharacters(): void {
    if (!this.characterCtx || !this.characterCanvas) return;
    const ctx = this.characterCtx;
    const rect = this.characterCanvas.getBoundingClientRect();
    
    // Clear canvas with dynamic width and 800px height (4x size)
    ctx.clearRect(0, 0, this.characterCanvas.width, 800);
    
    // Scale factor to fit 2450px design into current viewport
    const scaleFactor = this.characterCanvas.width / 2450;
    // Scale from canvas pixels to display pixels
    const displayScaleX = rect.width / this.characterCanvas.width;
    const displayScaleY = rect.height / 800;
    
    // Clear stored bounds
    this.characterBounds.clear();
    
    // Save context and apply scale
    ctx.save();
    ctx.scale(scaleFactor, scaleFactor);
    
    // Draw each character at their scattered positions (in original 2450px coordinate space)
    this.animeCharacters.forEach(char => {
      const groundY = 800 - char.y; // Calculate ground position from bottom (800px canvas height)
      
      // Reset bounds tracker for this character
      this.currentDrawBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      
      switch(char.id) {
        case 1: this.drawOnizuka(ctx, char.x, groundY); break;
        case 2: this.drawNaruto(ctx, char.x, groundY); break;
        case 3: this.drawEren(ctx, char.x, groundY); break;
        case 4: this.drawIchigo(ctx, char.x, groundY); break;
        case 5: this.drawMaomao(ctx, char.x, groundY); break;
        case 6: this.drawLuffy(ctx, char.x, groundY); break;
        case 7: this.drawZoroWithPlacard(ctx, char.x, groundY); break;
        case 8: this.drawTanjiro(ctx, char.x, groundY); break;
        case 9: this.drawNezuko(ctx, char.x, groundY); break;
        case 10: this.drawKirito(ctx, char.x, groundY); break;
        case 11: this.drawAsuna(ctx, char.x, groundY); break;
        case 12: this.drawLevi(ctx, char.x, groundY); break;
        case 13: this.drawMikasa(ctx, char.x, groundY); break;
        case 14: this.drawSakura(ctx, char.x, groundY); break;
        case 15: this.drawSasuke(ctx, char.x, groundY); break;
        case 16: this.drawZenitsu(ctx, char.x, groundY); break;
        case 17: this.drawInosuke(ctx, char.x, groundY); break;
        case 18: this.drawNami(ctx, char.x, groundY); break;
        case 19: this.drawSanji(ctx, char.x, groundY); break;
        case 20: this.drawRukia(ctx, char.x, groundY); break;
        case 21: this.drawGoku(ctx, char.x, groundY); break;
        case 22: this.drawVegeta(ctx, char.x, groundY); break;
      }
      
      // Store the bounds converted to screen coordinates
      if (this.currentDrawBounds && this.currentDrawBounds.minX !== Infinity) {
        this.characterBounds.set(char.id, {
          minX: this.currentDrawBounds.minX * scaleFactor * displayScaleX,
          minY: this.currentDrawBounds.minY * scaleFactor * displayScaleY,
          maxX: this.currentDrawBounds.maxX * scaleFactor * displayScaleX,
          maxY: this.currentDrawBounds.maxY * scaleFactor * displayScaleY
        });
      }
    });
    
    // Restore context
    ctx.restore();
  }
  
  // Pixel helper - tracks bounds for accurate hover detection
  private px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    
    // Track bounds
    if (this.currentDrawBounds) {
      this.currentDrawBounds.minX = Math.min(this.currentDrawBounds.minX, x);
      this.currentDrawBounds.minY = Math.min(this.currentDrawBounds.minY, y);
      this.currentDrawBounds.maxX = Math.max(this.currentDrawBounds.maxX, x + w);
      this.currentDrawBounds.maxY = Math.max(this.currentDrawBounds.maxY, y + h);
    }
  }
  
  // Draw circle helper for heads - tracks bounds for accurate hover detection
  private circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Track bounds (circle bounding box)
    if (this.currentDrawBounds) {
      this.currentDrawBounds.minX = Math.min(this.currentDrawBounds.minX, x - radius);
      this.currentDrawBounds.minY = Math.min(this.currentDrawBounds.minY, y - radius);
      this.currentDrawBounds.maxX = Math.max(this.currentDrawBounds.maxX, x + radius);
      this.currentDrawBounds.maxY = Math.max(this.currentDrawBounds.maxY, y + radius);
    }
  }
  
  // ONIZUKA - GTO teacher with blonde hair, sunglasses, cigarette (4X SIZE)
  private drawOnizuka(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // BLONDE SPIKY HAIR
    this.px(ctx, x+100, y-520, 40, 60, '#FFD700');
    this.px(ctx, x+60, y-500, 140, 80, '#FFA500');
    this.px(ctx, x+40, y-420, 180, 60, '#FFD700');
    
    // HEAD/FACE (round)
    this.circle(ctx, x+128, y-340, 72, '#f5c6a5');
    
    // SIGNATURE BLACK SUNGLASSES (wide)
    this.px(ctx, x+72, y-360, 48, 32, '#000');
    this.px(ctx, x+144, y-360, 48, 32, '#000');
    this.px(ctx, x+120, y-352, 24, 12, '#222'); // bridge
    
    // CIGARETTE in mouth
    this.px(ctx, x+200, y-328, 60, 12, '#fff');
    this.px(ctx, x+260, y-328, 16, 12, '#ff4500'); // lit tip
    // Smoke
    this.circle(ctx, x+288, y-340, 12, '#ccc');
    this.circle(ctx, x+304, y-360, 8, '#ddd');
    
    // SMIRK
    this.px(ctx, x+100, y-300, 60, 8, '#8b4513');
    
    // NECK
    this.px(ctx, x+108, y-268, 40, 32, '#f5c6a5');
    
    // BLACK LEATHER JACKET (wide shoulders)
    this.px(ctx, x+32, y-240, 200, 180, '#0a0a0a');
    this.px(ctx, x+40, y-232, 20, 160, '#1a1a1a'); // left highlight
    this.px(ctx, x+192, y-232, 20, 160, '#1a1a1a'); // right highlight
    
    // WHITE SHIRT COLLAR
    this.px(ctx, x+100, y-240, 60, 32, '#fff');
    
    // ARMS
    this.px(ctx, x+20, y-220, 32, 140, '#0a0a0a'); // left arm
    this.px(ctx, x+208, y-220, 32, 140, '#0a0a0a'); // right arm
    // HANDS
    this.px(ctx, x+16, y-80, 40, 32, '#f5c6a5');
    this.px(ctx, x+204, y-80, 40, 32, '#f5c6a5');
    
    // BLUE JEANS
    this.px(ctx, x+60, y-60, 60, 48, '#1e3a5f'); // left leg
    this.px(ctx, x+140, y-60, 60, 48, '#1e3a5f'); // right leg
    
    // BLACK SHOES
    this.px(ctx, x+56, y-12, 64, 16, '#000'); // left shoe
    this.px(ctx, x+140, y-12, 64, 16, '#000'); // right shoe
  }
  
  // NARUTO - Orange jumpsuit, blue headband, whisker marks (4X SIZE)
  private drawNaruto(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // SPIKY BLONDE HAIR
    this.px(ctx, x+108, y-512, 32, 48, '#FFD700');
    this.px(ctx, x+72, y-480, 40, 48, '#FFD700');
    this.px(ctx, x+152, y-480, 40, 48, '#FFD700');
    this.px(ctx, x+60, y-432, 140, 40, '#FFA500');
    
    // ICONIC BLUE HEADBAND
    this.px(ctx, x+48, y-400, 160, 24, '#000080');
    // Metal plate with Konoha symbol
    this.px(ctx, x+92, y-408, 72, 40, '#C0C0C0');
    this.px(ctx, x+112, y-400, 8, 24, '#000'); // scratch
    this.px(ctx, x+136, y-400, 8, 24, '#000');
    
    // HEAD/FACE
    this.circle(ctx, x+128, y-328, 64, '#f5c6a5');
    
    // BIG BLUE EYES
    this.circle(ctx, x+100, y-340, 20, '#00BFFF');
    this.circle(ctx, x+156, y-340, 20, '#00BFFF');
    this.circle(ctx, x+100, y-340, 8, '#000'); // pupils
    this.circle(ctx, x+156, y-340, 8, '#000');
    
    // WHISKER MARKS (3 each side)
    this.px(ctx, x+56, y-348, 32, 8, '#000');
    this.px(ctx, x+56, y-328, 32, 8, '#000');
    this.px(ctx, x+56, y-308, 32, 8, '#000');
    this.px(ctx, x+168, y-348, 32, 8, '#000');
    this.px(ctx, x+168, y-328, 32, 8, '#000');
    this.px(ctx, x+168, y-308, 32, 8, '#000');
    
    // BIG GRIN
    this.px(ctx, x+88, y-288, 80, 12, '#000');
    this.px(ctx, x+96, y-280, 16, 8, '#fff'); // teeth
    this.px(ctx, x+128, y-280, 16, 8, '#fff');
    
    // NECK
    this.px(ctx, x+108, y-264, 40, 32, '#f5c6a5');
    
    // ORANGE JACKET
    this.px(ctx, x+40, y-232, 180, 160, '#FF6600');
    // Black collar
    this.px(ctx, x+60, y-232, 140, 20, '#000');
    // Blue stripe down middle
    this.px(ctx, x+112, y-220, 32, 140, '#000080');
    
    // ARMS
    this.px(ctx, x+28, y-220, 32, 120, '#FF6600');
    this.px(ctx, x+200, y-220, 32, 120, '#FF6600');
    // HANDS holding ramen
    this.px(ctx, x+24, y-100, 40, 32, '#f5c6a5');
    this.px(ctx, x+196, y-100, 40, 32, '#f5c6a5');
    
    // RAMEN BOWL
    this.px(ctx, x+92, y-120, 72, 48, '#fff');
    this.px(ctx, x+100, y-112, 56, 32, '#FFD700'); // noodles
    this.px(ctx, x+120, y-104, 8, 16, '#ff6b6b'); // chopsticks
    
    // ORANGE PANTS
    this.px(ctx, x+64, y-72, 56, 60, '#FF6600');
    this.px(ctx, x+140, y-72, 56, 60, '#FF6600');
    
    // BLUE SANDALS
    this.px(ctx, x+60, y-12, 60, 16, '#000080');
    this.px(ctx, x+140, y-12, 60, 16, '#000080');
  }
  
  // EREN - Titan marks, Survey Corps cape, intense (4X SIZE)
  private drawEren(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // BROWN MESSY HAIR
    this.px(ctx, x+96, y-512, 48, 40, '#4a3728');
    this.px(ctx, x+72, y-472, 96, 48, '#5c4a3a');
    this.px(ctx, x+60, y-424, 120, 32, '#4a3728');
    
    // HEAD/FACE
    this.circle(ctx, x+120, y-352, 64, '#f5c6a5');
    
    // INTENSE GREEN EYES
    this.circle(ctx, x+96, y-360, 20, '#228b22');
    this.circle(ctx, x+144, y-360, 20, '#228b22');
    this.circle(ctx, x+92, y-364, 8, '#32CD32'); // shine
    this.circle(ctx, x+140, y-364, 8, '#32CD32');
    
    // TITAN MARKS under eyes
    this.px(ctx, x+88, y-332, 12, 24, '#8b0000');
    this.px(ctx, x+140, y-332, 12, 24, '#8b0000');
    
    // DETERMINED EXPRESSION
    this.px(ctx, x+104, y-312, 32, 12, '#000');
    
    // NECK
    this.px(ctx, x+100, y-288, 40, 32, '#f5c6a5');
    
    // GREEN SURVEY CORPS CAPE
    this.px(ctx, x+32, y-256, 176, 200, '#2f4f2f');
    // Cape highlights
    this.px(ctx, x+48, y-240, 24, 160, '#3d5e3d');
    
    // WINGS OF FREEDOM EMBLEM (large on back)
    this.px(ctx, x+88, y-208, 64, 72, '#fff');
    this.px(ctx, x+96, y-200, 24, 56, '#1e90ff');
    this.px(ctx, x+120, y-200, 24, 56, '#1e90ff');
    
    // ODM GEAR STRAPS (brown leather)
    this.px(ctx, x+60, y-240, 12, 140, '#8b4513');
    this.px(ctx, x+168, y-240, 12, 140, '#8b4513');
    this.px(ctx, x+80, y-200, 80, 12, '#8b4513');
    // Metal buckles
    this.circle(ctx, x+64, y-192, 12, '#C0C0C0');
    this.circle(ctx, x+176, y-192, 12, '#C0C0C0');
    
    // WHITE PANTS
    this.px(ctx, x+64, y-56, 48, 64, '#fff');
    this.px(ctx, x+128, y-56, 48, 64, '#fff');
    
    // BROWN BOOTS
    this.px(ctx, x+60, y+8, 52, 20, '#4a3728');
    this.px(ctx, x+128, y+8, 52, 20, '#4a3728');
  }
  
  // ICHIGO - Orange hair, massive Zangetsu sword (4X SIZE)
  private drawIchigo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Spiky orange hair (SIGNATURE)
    this.px(ctx, x+40, y-576, 32, 16, '#ff6600');
    this.px(ctx, x+24, y-560, 64, 16, '#ff6600');
    this.px(ctx, x+16, y-544, 80, 32, '#ff6600');
    // Extra spikes
    this.px(ctx, x+8, y-520, 24, 24, '#ff6600');
    this.px(ctx, x+80, y-520, 24, 24, '#ff6600');
    // Face with permanent scowl
    this.circle(ctx, x+48, y-448, 56, '#f5c6a5');
    // Brown determined eyes
    this.circle(ctx, x+32, y-456, 12, '#8b4513');
    this.circle(ctx, x+64, y-456, 12, '#8b4513');
    this.circle(ctx, x+32, y-456, 4, '#000'); // pupils
    this.circle(ctx, x+64, y-456, 4, '#000');
    // Frown
    this.px(ctx, x+36, y-424, 24, 8, '#8b4513');
    // Black shihakusho (Soul Reaper uniform)
    this.px(ctx, x+16, y-392, 96, 160, '#000');
    // White inner robe
    this.px(ctx, x+40, y-392, 32, 48, '#fff');
    // ZANGETSU - Massive cleaver sword (SIGNATURE)
    this.px(ctx, x+112, y-640, 32, 320, '#2f4f4f');
    // Blade tip (angled)
    this.px(ctx, x+104, y-656, 48, 32, '#2f4f4f');
    this.px(ctx, x+136, y-648, 16, 16, '#2f4f4f');
    // Bandage wrapping
    this.px(ctx, x+108, y-320, 40, 64, '#fff');
    // Handle
    this.px(ctx, x+116, y-256, 24, 32, '#8b4513');
    // Legs
    this.px(ctx, x+28, y-232, 28, 96, '#000');
    this.px(ctx, x+64, y-232, 28, 96, '#000');
    // Sandals (waraji)
    this.px(ctx, x+24, y-136, 36, 136, '#8b4513');
    this.px(ctx, x+60, y-136, 36, 136, '#8b4513');
  }
  
  // MAOMAO - Sitting, mixing medicine, traditional dress (4X SIZE)
  private drawMaomao(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Dark green/brown hair with double buns (SIGNATURE)
    this.circle(ctx, x+16, y-464, 24, '#2d4a2d'); // left bun
    this.circle(ctx, x+96, y-464, 24, '#2d4a2d'); // right bun
    this.px(ctx, x+32, y-480, 48, 48, '#2d4a2d'); // main hair
    // Hair pins
    this.px(ctx, x+8, y-472, 8, 24, '#8b4513');
    this.px(ctx, x+96, y-472, 8, 24, '#8b4513');
    // Face (cute, focused on work)
    this.circle(ctx, x+56, y-384, 48, '#f5c6a5');
    // Eyes focused down (examining herbs)
    this.circle(ctx, x+40, y-392, 10, '#8b4513');
    this.circle(ctx, x+72, y-392, 10, '#8b4513');
    // Pupils looking down
    this.circle(ctx, x+40, y-388, 4, '#000');
    this.circle(ctx, x+72, y-388, 4, '#000');
    // Small focused mouth
    this.px(ctx, x+48, y-360, 16, 4, '#ffb6c1');
    // Traditional purple/pink hanfu
    this.px(ctx, x+24, y-336, 80, 80, '#9370db');
    // Pink inner robe showing
    this.px(ctx, x+40, y-336, 32, 32, '#ffb6c1');
    // Wide sleeves
    this.px(ctx, x-8, y-320, 48, 64, '#9370db');
    this.px(ctx, x+80, y-320, 48, 64, '#9370db');
    // Hands (mixing)
    this.circle(ctx, x+120, y-272, 16, '#f5c6a5');
    // Sitting legs (folded - traditional sitting)
    this.px(ctx, x+24, y-256, 96, 48, '#9370db');
    // MORTAR AND PESTLE (SIGNATURE - apothecary)
    this.px(ctx, x+128, y-288, 48, 64, '#696969');
    // Pestle
    this.px(ctx, x+112, y-336, 16, 64, '#8b4513');
    // Green herbs inside
    this.circle(ctx, x+152, y-264, 16, '#228b22');
    this.circle(ctx, x+144, y-272, 8, '#32cd32');
    // Feet peeking
    this.px(ctx, x+32, y-208, 24, 24, '#ffb6c1');
    this.px(ctx, x+72, y-208, 24, 24, '#ffb6c1');
  }
  
  // LUFFY - Straw hat, eating meat, red vest (4X SIZE)
  private drawLuffy(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // ICONIC STRAW HAT
    this.px(ctx, x+80, y-540, 100, 32, '#f4e4a3');
    this.px(ctx, x+60, y-508, 140, 48, '#f4e4a3');
    this.px(ctx, x+48, y-460, 160, 32, '#e6d89e');
    // Red ribbon around hat
    this.px(ctx, x+72, y-480, 112, 20, '#DC143C');
    
    // HEAD/FACE
    this.circle(ctx, x+128, y-380, 72, '#f5c6a5');
    
    // BLACK HAIR peeking under hat
    this.px(ctx, x+80, y-440, 40, 32, '#000');
    this.px(ctx, x+144, y-440, 40, 32, '#000');
    
    // EYES
    this.circle(ctx, x+100, y-392, 16, '#000');
    this.circle(ctx, x+156, y-392, 16, '#000');
    this.circle(ctx, x+96, y-396, 8, '#fff'); // shine
    this.circle(ctx, x+152, y-396, 8, '#fff');
    
    // SIGNATURE SCAR under left eye
    this.px(ctx, x+96, y-352, 8, 40, '#8b0000');
    this.px(ctx, x+96, y-344, 8, 8, '#8b0000');
    this.px(ctx, x+96, y-328, 8, 8, '#8b0000');
    
    // BIG GRIN
    this.px(ctx, x+88, y-340, 80, 16, '#000');
    this.px(ctx, x+112, y-328, 32, 12, '#fff'); // teeth
    
    // NECK
    this.px(ctx, x+108, y-308, 40, 32, '#f5c6a5');
    
    // RED VEST (open)
    this.px(ctx, x+60, y-276, 48, 140, '#DC143C');
    this.px(ctx, x+148, y-276, 48, 140, '#DC143C');
    // Yellow buttons
    this.circle(ctx, x+80, y-248, 8, '#FFD700');
    this.circle(ctx, x+80, y-208, 8, '#FFD700');
    this.circle(ctx, x+176, y-248, 8, '#FFD700');
    this.circle(ctx, x+176, y-208, 8, '#FFD700');
    
    // BARE CHEST (muscular)
    this.px(ctx, x+108, y-276, 40, 100, '#f5c6a5');
    this.px(ctx, x+120, y-240, 16, 8, '#d4a574'); // abs
    this.px(ctx, x+120, y-216, 16, 8, '#d4a574');
    
    // X SCAR on chest
    this.px(ctx, x+116, y-232, 32, 8, '#ff6b6b');
    this.px(ctx, x+124, y-224, 16, 8, '#ff6b6b');
    
    // YELLOW SASH
    this.px(ctx, x+80, y-176, 100, 32, '#FFD700');
    
    // ARMS
    this.px(ctx, x+40, y-260, 32, 128, '#f5c6a5');
    this.px(ctx, x+184, y-260, 32, 128, '#f5c6a5');
    
    // BIG MEAT LEG in left hand
    this.px(ctx, x+16, y-192, 40, 72, '#ff9999');
    this.px(ctx, x+24, y-200, 24, 12, '#8b4513'); // bone
    this.px(ctx, x+20, y-180, 32, 48, '#ff6b6b'); // bite marks
    
    // HANDS
    this.px(ctx, x+36, y-132, 40, 32, '#f5c6a5');
    this.px(ctx, x+180, y-132, 40, 32, '#f5c6a5');
    
    // BLUE SHORTS
    this.px(ctx, x+80, y-144, 48, 72, '#0000CD');
    this.px(ctx, x+128, y-144, 48, 72, '#0000CD');
    
    // BROWN SANDALS
    this.px(ctx, x+72, y-72, 56, 20, '#8b4513');
    this.px(ctx, x+128, y-72, 56, 20, '#8b4513');
  }
  
  // ZORO - ICONIC GREEN HAIR, 3 KATANAS, holding HAPPY BIRTHDAY JOY sign (4X SIZE)
  private drawZoroWithPlacard(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // ICONIC GREEN SPIKY HAIR
    this.px(ctx, x+88, y-520, 48, 40, '#32CD32');
    this.px(ctx, x+60, y-480, 40, 48, '#228B22');
    this.px(ctx, x+152, y-480, 40, 48, '#228B22');
    this.px(ctx, x+72, y-432, 112, 40, '#2f8b45');
    
    // HEAD/FACE (tanned)
    this.circle(ctx, x+128, y-352, 64, '#d4a574');
    
    // SIGNATURE SCAR over left eye
    this.px(ctx, x+88, y-380, 8, 12, '#8b0000');
    this.px(ctx, x+96, y-368, 40, 8, '#8b0000');
    this.px(ctx, x+88, y-356, 8, 12, '#8b0000');
    // Left eye CLOSED (under scar)
    this.px(ctx, x+96, y-364, 32, 8, '#000');
    
    // Right eye OPEN
    this.circle(ctx, x+152, y-360, 12, '#000');
    
    // SERIOUS SCOWL
    this.px(ctx, x+104, y-320, 48, 12, '#000');
    
    // NECK
    this.px(ctx, x+108, y-288, 40, 32, '#d4a574');
    
    // DARK GREEN COAT/HARAMAKI
    this.px(ctx, x+48, y-256, 160, 160, '#006400');
    // White shirt visible
    this.px(ctx, x+104, y-240, 48, 60, '#fff');
    // Belt/sash
    this.px(ctx, x+60, y-180, 136, 32, '#8b4513');
    
    // THREE KATANAS (on left side - LARGE)
    // Sword 1
    this.px(ctx, x+20, y-220, 12, 180, '#C0C0C0');
    this.px(ctx, x+16, y-228, 20, 12, '#dcdcdc'); // tip
    this.px(ctx, x+20, y-40, 12, 32, '#FFD700'); // gold handle
    // Sword 2
    this.px(ctx, x+36, y-200, 12, 160, '#C0C0C0');
    this.px(ctx, x+32, y-208, 20, 12, '#dcdcdc');
    this.px(ctx, x+36, y-40, 12, 32, '#000'); // black handle
    // Sword 3 (Wado Ichimonji)
    this.px(ctx, x+52, y-180, 12, 140, '#C0C0C0');
    this.px(ctx, x+48, y-188, 20, 12, '#dcdcdc');
    this.px(ctx, x+52, y-40, 12, 32, '#fff'); // white handle
    
    // ARMS HOLDING SIGN
    this.px(ctx, x+200, y-240, 40, 112, '#d4a574'); // right arm
    this.px(ctx, x+400, y-240, 40, 112, '#d4a574'); // left arm
    
    // BIG SIGN/PLACARD
    // White border
    this.px(ctx, x+240, y-320, 200, 240, '#fff');
    // Yellow background
    this.px(ctx, x+252, y-308, 176, 216, '#FFEB3B');
    
    // TEXT: "HAPPY BIRTHDAY JOY!" using actual font (BIGGER)
    ctx.save();
    ctx.fillStyle = '#FF1493';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HAPPY', x+340, y-248);
    ctx.fillText('BIRTHDAY', x+340, y-192);
    ctx.fillStyle = '#00BFFF';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('JOY!', x+340, y-128);
    ctx.restore();
    
    // BLACK PANTS
    this.px(ctx, x+72, y-96, 48, 80, '#000');
    this.px(ctx, x+136, y-96, 48, 80, '#000');
    
    // BLACK BOOTS
    this.px(ctx, x+68, y-16, 56, 20, '#000');
    this.px(ctx, x+132, y-16, 56, 20, '#000');
  }
  
  // TANJIRO - Checkered haori, water effects (4X SIZE)
  private drawTanjiro(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Burgundy hair
    this.px(ctx, x+32, y-512, 48, 48, '#8b0000');
    this.px(ctx, x+24, y-464, 80, 32, '#8b0000');
    // Face
    this.circle(ctx, x+64, y-400, 56, '#f5c6a5');
    // Scar on forehead
    this.px(ctx, x+48, y-432, 32, 16, '#ff6b6b');
    // Determined eyes
    this.circle(ctx, x+40, y-408, 12, '#8b0000');
    this.circle(ctx, x+88, y-408, 12, '#8b0000');
    // Hanafuda earrings (ICONIC)
    this.px(ctx, x+24, y-408, 8, 32, '#ff6b6b');
    this.px(ctx, x+26, y-400, 4, 12, '#fff');
    this.px(ctx, x+100, y-408, 8, 32, '#ff6b6b');
    this.px(ctx, x+102, y-400, 4, 12, '#fff');
    // NECK
    this.px(ctx, x+52, y-344, 24, 24, '#f5c6a5');
    // Green/black checkered haori (4x4 blocks)
    this.px(ctx, x+16, y-320, 32, 32, '#2f4f2f');
    this.px(ctx, x+48, y-320, 32, 32, '#000');
    this.px(ctx, x+80, y-320, 32, 32, '#2f4f2f');
    this.px(ctx, x+112, y-320, 32, 32, '#000');
    this.px(ctx, x+16, y-288, 32, 32, '#000');
    this.px(ctx, x+48, y-288, 32, 32, '#2f4f2f');
    this.px(ctx, x+80, y-288, 32, 32, '#000');
    this.px(ctx, x+112, y-288, 32, 32, '#2f4f2f');
    this.px(ctx, x+16, y-256, 32, 32, '#2f4f2f');
    this.px(ctx, x+48, y-256, 32, 32, '#000');
    this.px(ctx, x+80, y-256, 32, 32, '#2f4f2f');
    this.px(ctx, x+112, y-256, 32, 32, '#000');
    // Sword (BLUE - Nichirin)
    this.px(ctx, x+144, y-480, 8, 256, '#4169e1');
    this.px(ctx, x+142, y-488, 12, 12, '#4169e1');
    this.px(ctx, x+140, y-232, 12, 16, '#8b4513'); // handle
    // Water breathing effect
    this.circle(ctx, x+160, y-440, 12, '#00bfff');
    this.circle(ctx, x+168, y-400, 8, '#87ceeb');
    this.circle(ctx, x+156, y-360, 12, '#00bfff');
    // Legs
    this.px(ctx, x+32, y-224, 32, 64, '#000');
    this.px(ctx, x+80, y-224, 32, 64, '#000');
    // Leg wraps
    this.px(ctx, x+32, y-168, 32, 16, '#fff');
    this.px(ctx, x+80, y-168, 32, 16, '#fff');
    // Sandals
    this.px(ctx, x+28, y-160, 40, 12, '#8b4513');
    this.px(ctx, x+76, y-160, 40, 12, '#8b4513');
  }
  
  // NEZUKO - Pink kimono, bamboo muzzle, sitting (4X SIZE)
  private drawNezuko(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Black hair with pink tips
    this.px(ctx, x+24, y-480, 64, 64, '#000');
    this.px(ctx, x+16, y-416, 16, 32, '#ffb6c1');
    this.px(ctx, x+80, y-416, 16, 32, '#ffb6c1');
    // Hair ribbon
    this.px(ctx, x+40, y-488, 32, 16, '#ff69b4');
    // Face
    this.circle(ctx, x+56, y-360, 48, '#f5c6a5');
    // Pink demon eyes
    this.circle(ctx, x+36, y-376, 16, '#ff69b4');
    this.circle(ctx, x+76, y-376, 16, '#ff69b4');
    this.circle(ctx, x+36, y-376, 6, '#000'); // pupils
    this.circle(ctx, x+76, y-376, 6, '#000');
    // Bamboo muzzle (ICONIC)
    this.px(ctx, x+28, y-360, 64, 32, '#228b22');
    this.px(ctx, x+32, y-352, 8, 16, '#1a5c1a');
    this.px(ctx, x+68, y-352, 8, 16, '#1a5c1a');
    // Pink kimono with asanoha pattern
    this.px(ctx, x+16, y-312, 80, 96, '#ffb6c1');
    this.px(ctx, x+24, y-296, 16, 16, '#fff');
    this.px(ctx, x+48, y-296, 16, 16, '#fff');
    this.px(ctx, x+72, y-296, 16, 16, '#fff');
    this.px(ctx, x+36, y-264, 16, 16, '#fff');
    this.px(ctx, x+60, y-264, 16, 16, '#fff');
    // Sitting pose (folded legs)
    this.px(ctx, x+16, y-216, 80, 64, '#ffb6c1');
    // Wooden box peeking
    this.px(ctx, x-16, y-280, 32, 128, '#8b4513');
    this.px(ctx, x-12, y-276, 24, 8, '#6b4226');
  }
  
  // KIRITO - Black coat, dual wielding (4X SIZE)
  private drawKirito(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Black spiky hair
    this.px(ctx, x+32, y-544, 48, 32, '#1a1a1a');
    this.px(ctx, x+24, y-512, 80, 48, '#1a1a1a');
    // Face
    this.circle(ctx, x+56, y-416, 56, '#f5c6a5');
    // Black intense eyes
    this.circle(ctx, x+36, y-424, 12, '#000');
    this.circle(ctx, x+76, y-424, 12, '#000');
    this.circle(ctx, x+36, y-424, 4, '#333'); // shine
    this.circle(ctx, x+76, y-424, 4, '#333');
    // Determined expression
    this.px(ctx, x+44, y-392, 24, 4, '#8b4513');
    // Long black coat (ICONIC)
    this.px(ctx, x+16, y-368, 96, 224, '#1a1a1a');
    // Grey inner lining
    this.px(ctx, x+32, y-352, 64, 64, '#444');
    // Belt
    this.px(ctx, x+20, y-260, 88, 16, '#333');
    // Coat bottom flare
    this.px(ctx, x+8, y-180, 48, 80, '#1a1a1a');
    this.px(ctx, x+72, y-180, 48, 80, '#1a1a1a');
    // Dual swords crossed (SIGNATURE)
    // Elucidator (dark)
    this.px(ctx, x-8, y-520, 16, 288, '#2f4f4f');
    this.px(ctx, x-8, y-232, 16, 16, '#1a1a1a'); // guard
    // Dark Repulser (light blue)
    this.px(ctx, x+104, y-520, 16, 288, '#87ceeb');
    this.px(ctx, x+104, y-232, 16, 16, '#5f9ea0'); // guard
    // Boots
    this.px(ctx, x+24, y-100, 32, 100, '#1a1a1a');
    this.px(ctx, x+64, y-100, 32, 100, '#1a1a1a');
  }
  
  // ASUNA - White/red Knight outfit, rapier (4X SIZE)
  private drawAsuna(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Long orange-brown hair
    this.px(ctx, x+32, y-544, 48, 32, '#cd853f');
    this.px(ctx, x+16, y-512, 96, 128, '#cd853f');
    // Hair braids on sides
    this.px(ctx, x+8, y-480, 16, 80, '#cd853f');
    this.px(ctx, x+96, y-480, 16, 80, '#cd853f');
    // Braid accessory (white ribbon)
    this.px(ctx, x+24, y-528, 16, 32, '#fff');
    // Face
    this.circle(ctx, x+56, y-432, 56, '#f5c6a5');
    // Hazel eyes with sparkle
    this.circle(ctx, x+36, y-440, 12, '#8b4513');
    this.circle(ctx, x+76, y-440, 12, '#8b4513');
    this.circle(ctx, x+32, y-444, 4, '#fff'); // shine
    this.circle(ctx, x+72, y-444, 4, '#fff');
    // Warm smile
    this.px(ctx, x+40, y-408, 32, 8, '#ffb6c1');
    // White and red KoB uniform top
    this.px(ctx, x+24, y-376, 80, 128, '#fff');
    // Red stripes (KoB colors)
    this.px(ctx, x+24, y-376, 16, 128, '#ff0000');
    this.px(ctx, x+88, y-376, 16, 128, '#ff0000');
    // Belt
    this.px(ctx, x+24, y-264, 80, 16, '#8b0000');
    // White skirt
    this.px(ctx, x+16, y-248, 96, 64, '#fff');
    this.px(ctx, x+16, y-232, 24, 16, '#ff0000');
    this.px(ctx, x+88, y-232, 24, 16, '#ff0000');
    // Rapier (Lambent Light) - SIGNATURE
    this.px(ctx, x+112, y-480, 12, 224, '#e0ffff');
    this.px(ctx, x+106, y-256, 24, 16, '#c0c0c0'); // guard
    this.px(ctx, x+110, y-240, 16, 32, '#8b0000'); // handle
    // Legs
    this.px(ctx, x+32, y-184, 24, 80, '#fff');
    this.px(ctx, x+64, y-184, 24, 80, '#fff');
    // Boots
    this.px(ctx, x+28, y-104, 32, 104, '#8b0000');
    this.px(ctx, x+60, y-104, 32, 104, '#8b0000');
  }
  
  // LEVI - Cleaning with cloth, short, cravat (4X SIZE)
  private drawLevi(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Black undercut hair
    this.px(ctx, x+32, y-464, 48, 32, '#1a1a1a');
    this.px(ctx, x+24, y-432, 80, 32, '#1a1a1a');
    // Face (humanity's strongest)
    this.circle(ctx, x+56, y-360, 48, '#f5c6a5');
    // Tired/annoyed narrow eyes
    this.px(ctx, x+32, y-368, 16, 8, '#808080');
    this.px(ctx, x+64, y-368, 16, 8, '#808080');
    this.px(ctx, x+36, y-368, 8, 4, '#000'); // pupils
    this.px(ctx, x+68, y-368, 8, 4, '#000');
    // Frown
    this.px(ctx, x+44, y-344, 24, 4, '#8b4513');
    // White cravat (SIGNATURE)
    this.px(ctx, x+40, y-312, 32, 32, '#fff');
    this.px(ctx, x+44, y-288, 24, 24, '#f0f0f0');
    // Survey Corps jacket
    this.px(ctx, x+24, y-280, 80, 128, '#4a3728');
    // Wings of Freedom emblem
    this.px(ctx, x+44, y-256, 24, 16, '#fff');
    this.px(ctx, x+56, y-256, 12, 16, '#0044cc');
    // Holding cleaning cloth (Levi's OCD)
    this.px(ctx, x+104, y-280, 48, 48, '#fff');
    this.px(ctx, x+112, y-264, 32, 32, '#f0f0f0');
    // Hand holding cloth
    this.px(ctx, x+100, y-256, 24, 24, '#f5c6a5');
    // White pants
    this.px(ctx, x+32, y-152, 32, 80, '#fff');
    this.px(ctx, x+64, y-152, 32, 80, '#fff');
    // Boots
    this.px(ctx, x+32, y-72, 32, 72, '#4a3728');
    this.px(ctx, x+64, y-72, 32, 72, '#4a3728');
  }
  
  // MIKASA - Red scarf, short hair (4X SIZE)
  private drawMikasa(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Short black hair
    this.px(ctx, x+32, y-496, 48, 32, '#1a1a1a');
    this.px(ctx, x+24, y-464, 80, 64, '#1a1a1a');
    // Face
    this.circle(ctx, x+56, y-384, 52, '#f5c6a5');
    // Dark determined eyes
    this.circle(ctx, x+36, y-392, 10, '#1a1a1a');
    this.circle(ctx, x+76, y-392, 10, '#1a1a1a');
    // Neutral/determined expression
    this.px(ctx, x+44, y-360, 24, 4, '#8b4513');
    // RED SCARF (SIGNATURE - most iconic part!)
    this.px(ctx, x+16, y-336, 96, 48, '#dc143c');
    this.px(ctx, x+8, y-288, 32, 128, '#dc143c');
    this.px(ctx, x+88, y-288, 32, 128, '#dc143c');
    // Survey Corps uniform
    this.px(ctx, x+32, y-296, 64, 128, '#4a3728');
    // Wings of Freedom on back
    this.px(ctx, x+48, y-264, 24, 16, '#fff');
    this.px(ctx, x+60, y-264, 12, 16, '#0044cc');
    // ODM gear on sides
    this.px(ctx, x+96, y-256, 16, 96, '#808080');
    this.px(ctx, x+16, y-256, 16, 96, '#808080');
    // Blades
    this.px(ctx, x+108, y-320, 8, 160, '#c0c0c0');
    this.px(ctx, x+4, y-320, 8, 160, '#c0c0c0');
    // White pants
    this.px(ctx, x+36, y-168, 28, 80, '#fff');
    this.px(ctx, x+64, y-168, 28, 80, '#fff');
    // Boots
    this.px(ctx, x+32, y-88, 32, 88, '#4a3728');
    this.px(ctx, x+64, y-88, 32, 88, '#4a3728');
  }
  
  // SAKURA - Pink hair, punching pose (4X SIZE)
  private drawSakura(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Pink short hair
    this.px(ctx, x+24, y-496, 80, 64, '#ffb6c1');
    // Headband with Konoha emblem
    this.px(ctx, x+24, y-464, 80, 16, '#ff0000');
    this.px(ctx, x+48, y-464, 32, 16, '#c0c0c0');
    // Konoha symbol
    this.px(ctx, x+56, y-460, 12, 8, '#333');
    // Face
    this.circle(ctx, x+56, y-400, 52, '#f5c6a5');
    // Green eyes
    this.circle(ctx, x+40, y-408, 12, '#228b22');
    this.circle(ctx, x+72, y-408, 12, '#228b22');
    this.circle(ctx, x+40, y-408, 4, '#000'); // pupils
    this.circle(ctx, x+72, y-408, 4, '#000');
    // Diamond seal on forehead (Byakugou)
    this.px(ctx, x+48, y-432, 16, 16, '#9370db');
    // Determined smile
    this.px(ctx, x+44, y-376, 24, 8, '#ff6b6b');
    // Red/pink outfit
    this.px(ctx, x+24, y-352, 80, 96, '#ff69b4');
    // Zipper
    this.px(ctx, x+56, y-352, 8, 80, '#333');
    // Punching arm extended (SIGNATURE STRENGTH)
    this.px(ctx, x+104, y-336, 64, 32, '#f5c6a5');
    // Glowing fist (chakra enhanced)
    this.circle(ctx, x+168, y-320, 32, '#00ff00');
    this.circle(ctx, x+168, y-320, 24, '#7fff00');
    // Black shorts
    this.px(ctx, x+32, y-256, 64, 48, '#1a1a1a');
    // Legs
    this.px(ctx, x+36, y-208, 24, 112, '#f5c6a5');
    this.px(ctx, x+68, y-208, 24, 112, '#f5c6a5');
    // Boots
    this.px(ctx, x+32, y-96, 32, 96, '#1a1a1a');
    this.px(ctx, x+64, y-96, 32, 96, '#1a1a1a');
  }
  
  // SASUKE - Chidori lightning, dark outfit (4X SIZE)
  private drawSasuke(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Black spiky hair (duck-butt style)
    this.px(ctx, x+32, y-560, 48, 16, '#1a1a1a');
    this.px(ctx, x+24, y-544, 80, 64, '#1a1a1a');
    // Signature spikes at back
    this.px(ctx, x+80, y-520, 32, 24, '#1a1a1a');
    this.px(ctx, x+96, y-504, 24, 16, '#1a1a1a');
    // Face
    this.circle(ctx, x+56, y-432, 52, '#f5c6a5');
    // Sharingan eyes (SIGNATURE)
    this.circle(ctx, x+36, y-440, 12, '#ff0000');
    this.circle(ctx, x+76, y-440, 12, '#ff0000');
    this.circle(ctx, x+36, y-440, 4, '#000'); // tomoe center
    this.circle(ctx, x+76, y-440, 4, '#000');
    // Cold expression
    this.px(ctx, x+44, y-408, 24, 4, '#8b4513');
    // Dark blue high-collar shirt
    this.px(ctx, x+24, y-380, 80, 128, '#191970');
    // High collar
    this.px(ctx, x+16, y-380, 16, 48, '#191970');
    this.px(ctx, x+88, y-380, 16, 48, '#191970');
    // Uchiha crest on back (fan shape)
    this.px(ctx, x+48, y-320, 24, 32, '#fff');
    this.px(ctx, x+48, y-296, 24, 16, '#ff0000');
    // Arm extended with CHIDORI
    this.px(ctx, x+96, y-336, 64, 48, '#f5c6a5');
    // CHIDORI LIGHTNING (SIGNATURE MOVE)
    this.circle(ctx, x+160, y-312, 40, '#00bfff');
    this.circle(ctx, x+160, y-312, 28, '#fff');
    // Lightning bolts
    this.px(ctx, x+140, y-360, 8, 48, '#00bfff');
    this.px(ctx, x+172, y-368, 8, 40, '#87ceeb');
    this.px(ctx, x+152, y-344, 12, 8, '#fff');
    this.px(ctx, x+168, y-328, 8, 12, '#00bfff');
    // White shorts
    this.px(ctx, x+32, y-252, 64, 64, '#fff');
    // Legs
    this.px(ctx, x+36, y-188, 24, 96, '#f5c6a5');
    this.px(ctx, x+68, y-188, 24, 96, '#f5c6a5');
    // Blue sandals
    this.px(ctx, x+32, y-92, 32, 92, '#000080');
    this.px(ctx, x+64, y-92, 32, 92, '#000080');
  }
  
  // ZENITSU - Sleeping on ground, yellow hair (4X SIZE)
  private drawZenitsu(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Lying down - bright yellow hair (SIGNATURE)
    this.px(ctx, x, y-128, 64, 48, '#ffd700');
    this.px(ctx, x-8, y-112, 24, 32, '#ffd700');
    // Sleeping face
    this.circle(ctx, x+48, y-88, 40, '#f5c6a5');
    // Closed eyes (sleeping - comedic fear)
    this.px(ctx, x+32, y-96, 16, 4, '#000');
    this.px(ctx, x+64, y-96, 16, 4, '#000');
    // Tears (scared even sleeping)
    this.px(ctx, x+24, y-88, 8, 24, '#87ceeb');
    this.px(ctx, x+80, y-88, 8, 24, '#87ceeb');
    // ZZZ (sleeping)
    this.px(ctx, x+96, y-160, 16, 16, '#87ceeb');
    this.px(ctx, x+112, y-192, 24, 16, '#87ceeb');
    this.px(ctx, x+136, y-224, 32, 16, '#87ceeb');
    // Yellow/orange haori with triangle pattern (lying flat)
    this.px(ctx, x+64, y-80, 160, 64, '#ff8c00');
    // White triangle pattern
    this.px(ctx, x+80, y-72, 24, 24, '#fff');
    this.px(ctx, x+120, y-72, 24, 24, '#fff');
    this.px(ctx, x+160, y-72, 24, 24, '#fff');
    // Black inner
    this.px(ctx, x+88, y-64, 8, 8, '#000');
    this.px(ctx, x+128, y-64, 8, 8, '#000');
    // Legs
    this.px(ctx, x+224, y-64, 64, 32, '#000');
    // Nichirin sword beside him (yellow thunder)
    this.px(ctx, x+16, y-32, 192, 16, '#ffd700');
    this.px(ctx, x+16, y-24, 32, 8, '#8b4513'); // handle
  }
  
  // INOSUKE - Boar mask, shirtless, dual swords (4X SIZE)
  private drawInosuke(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Blue-ish fluffy hair peeking (SIGNATURE)
    this.px(ctx, x+32, y-560, 64, 32, '#4169e1');
    // Boar mask (SIGNATURE - grey/brown)
    this.px(ctx, x+24, y-528, 80, 80, '#808080');
    // Snout
    this.px(ctx, x+40, y-480, 48, 32, '#696969');
    // Tusks (white)
    this.px(ctx, x+16, y-480, 16, 32, '#fff');
    this.px(ctx, x+96, y-480, 16, 32, '#fff');
    // Eye holes (dark/angry)
    this.circle(ctx, x+40, y-504, 12, '#1a1a1a');
    this.circle(ctx, x+88, y-504, 12, '#1a1a1a');
    // Eyes peeking through
    this.circle(ctx, x+40, y-504, 6, '#228b22');
    this.circle(ctx, x+88, y-504, 6, '#228b22');
    // Bare muscular chest (SIGNATURE)
    this.px(ctx, x+24, y-448, 80, 160, '#f5c6a5');
    // Muscle definition (abs)
    this.px(ctx, x+40, y-400, 8, 64, '#e0c0a0');
    this.px(ctx, x+80, y-400, 8, 64, '#e0c0a0');
    // Pecs
    this.px(ctx, x+32, y-432, 24, 24, '#ecc0a0');
    this.px(ctx, x+72, y-432, 24, 24, '#ecc0a0');
    // Fluffy fur pants
    this.px(ctx, x+24, y-288, 96, 96, '#d2b48c');
    // Fur texture
    this.px(ctx, x+24, y-272, 16, 16, '#c0a080');
    this.px(ctx, x+56, y-264, 16, 16, '#c0a080');
    this.px(ctx, x+88, y-272, 16, 16, '#c0a080');
    // Legs
    this.px(ctx, x+32, y-192, 28, 96, '#f5c6a5');
    this.px(ctx, x+72, y-192, 28, 96, '#f5c6a5');
    // Feet wraps
    this.px(ctx, x+28, y-96, 36, 96, '#8b4513');
    this.px(ctx, x+68, y-96, 36, 96, '#8b4513');
    // DUAL JAGGED SWORDS (SIGNATURE)
    this.px(ctx, x-16, y-528, 16, 256, '#2f4f4f');
    this.px(ctx, x+128, y-528, 16, 256, '#2f4f4f');
    // Sword serrations
    this.px(ctx, x-32, y-480, 16, 16, '#2f4f4f');
    this.px(ctx, x-32, y-416, 16, 16, '#2f4f4f');
    this.px(ctx, x-32, y-352, 16, 16, '#2f4f4f');
    this.px(ctx, x+144, y-480, 16, 16, '#2f4f4f');
    this.px(ctx, x+144, y-416, 16, 16, '#2f4f4f');
    this.px(ctx, x+144, y-352, 16, 16, '#2f4f4f');
  }
  
  // NAMI - Orange hair, map, bikini top (4X SIZE)
  private drawNami(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Orange long hair (SIGNATURE)
    this.px(ctx, x+32, y-496, 48, 32, '#ff8c00');
    this.px(ctx, x+16, y-464, 96, 96, '#ff8c00');
    // Hair flowing down
    this.px(ctx, x+8, y-384, 32, 64, '#ff8c00');
    this.px(ctx, x+88, y-384, 32, 64, '#ff8c00');
    // Face
    this.circle(ctx, x+56, y-400, 52, '#f5c6a5');
    // Brown eyes with sparkle
    this.circle(ctx, x+40, y-408, 12, '#8b4513');
    this.circle(ctx, x+72, y-408, 12, '#8b4513');
    this.circle(ctx, x+36, y-412, 4, '#fff'); // shine
    this.circle(ctx, x+68, y-412, 4, '#fff');
    // Pretty smile
    this.px(ctx, x+40, y-376, 32, 8, '#ff6b6b');
    // Blue bikini top (SIGNATURE post-timeskip)
    this.px(ctx, x+32, y-352, 64, 32, '#1e90ff');
    // Tangerine tattoo on shoulder
    this.circle(ctx, x+96, y-344, 16, '#ff8c00');
    this.px(ctx, x+92, y-360, 8, 16, '#228b22'); // leaf
    // Midriff
    this.px(ctx, x+40, y-320, 48, 32, '#f5c6a5');
    // Jeans
    this.px(ctx, x+24, y-288, 80, 160, '#1e3a5f');
    // Belt
    this.px(ctx, x+24, y-288, 80, 16, '#8b4513');
    // Holding map (SIGNATURE - navigator)
    this.px(ctx, x+104, y-368, 96, 80, '#f5deb3');
    // Map details
    this.px(ctx, x+112, y-352, 16, 16, '#4169e1');
    this.px(ctx, x+136, y-344, 24, 8, '#228b22');
    this.px(ctx, x+120, y-320, 32, 16, '#8b4513');
    // Legs
    this.px(ctx, x+36, y-128, 24, 64, '#f5c6a5');
    this.px(ctx, x+68, y-128, 24, 64, '#f5c6a5');
    // Sandals
    this.px(ctx, x+32, y-64, 32, 64, '#8b4513');
    this.px(ctx, x+64, y-64, 32, 64, '#8b4513');
  }
  
  // SANJI - Blonde, suit, cooking with kick pose (4X SIZE)
  private drawSanji(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Blonde hair covering one eye (SIGNATURE)
    this.px(ctx, x+24, y-528, 80, 64, '#ffd700');
    // Hair swirl (SIGNATURE)
    this.px(ctx, x+16, y-512, 32, 32, '#ffd700');
    this.circle(ctx, x+32, y-496, 16, '#ffd700');
    // Face
    this.circle(ctx, x+64, y-432, 52, '#f5c6a5');
    // Visible eye only (hair covers left)
    this.circle(ctx, x+80, y-440, 10, '#000');
    // Curly eyebrow (SIGNATURE - Vinsmoke trait)
    this.px(ctx, x+72, y-456, 24, 8, '#ffd700');
    this.px(ctx, x+88, y-464, 8, 8, '#ffd700'); // curl
    // Hair covering other eye
    this.px(ctx, x+32, y-464, 32, 48, '#ffd700');
    // Cigarette (SIGNATURE)
    this.px(ctx, x+48, y-400, 48, 8, '#fff');
    this.px(ctx, x+40, y-404, 16, 16, '#ff4500'); // lit end
    // Smoke
    this.circle(ctx, x+32, y-424, 12, '#ddd');
    this.circle(ctx, x+24, y-448, 8, '#eee');
    // Black suit (SIGNATURE - gentleman)
    this.px(ctx, x+32, y-368, 80, 160, '#1a1a1a');
    // Blue tie
    this.px(ctx, x+56, y-368, 24, 64, '#1e90ff');
    // White shirt visible
    this.px(ctx, x+48, y-368, 8, 48, '#fff');
    this.px(ctx, x+80, y-368, 8, 48, '#fff');
    // DIABLE JAMBE - Kick leg up with fire (SIGNATURE)
    this.px(ctx, x+96, y-320, 32, 128, '#1a1a1a');
    this.px(ctx, x+128, y-288, 48, 32, '#1a1a1a');
    // Fire on foot!
    this.circle(ctx, x+176, y-272, 32, '#ff4500');
    this.circle(ctx, x+168, y-288, 24, '#ffd700');
    this.circle(ctx, x+184, y-264, 20, '#ff6600');
    // Standing leg
    this.px(ctx, x+48, y-208, 32, 128, '#1a1a1a');
    // Shoe
    this.px(ctx, x+44, y-80, 40, 80, '#1a1a1a');
  }
  
  // RUKIA - Black shihakusho, ice sword (4X SIZE)
  private drawRukia(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Short black hair
    this.px(ctx, x+32, y-464, 64, 64, '#1a1a1a');
    // Strand of hair in front
    this.px(ctx, x+40, y-480, 16, 32, '#1a1a1a');
    // Face
    this.circle(ctx, x+56, y-376, 48, '#f5c6a5');
    // Purple eyes (SIGNATURE)
    this.circle(ctx, x+40, y-384, 10, '#9370db');
    this.circle(ctx, x+72, y-384, 10, '#9370db');
    this.circle(ctx, x+40, y-384, 4, '#000'); // pupils
    this.circle(ctx, x+72, y-384, 4, '#000');
    // Small smile
    this.px(ctx, x+44, y-360, 24, 4, '#ffb6c1');
    // Black shihakusho (Soul Reaper uniform)
    this.px(ctx, x+24, y-328, 80, 192, '#000');
    // White inner robe
    this.px(ctx, x+40, y-328, 32, 48, '#fff');
    // Lieutenant armband
    this.px(ctx, x+96, y-296, 16, 48, '#fff');
    // ICE SWORD - Sode no Shirayuki (SIGNATURE - most beautiful zanpakuto)
    this.px(ctx, x+112, y-464, 16, 256, '#e0ffff');
    // Pure white ribbon
    this.px(ctx, x+128, y-400, 48, 8, '#fff');
    this.px(ctx, x+168, y-392, 32, 8, '#fff');
    this.px(ctx, x+192, y-384, 24, 8, '#fff');
    // Ice crystals forming
    this.circle(ctx, x+120, y-432, 16, '#87ceeb');
    this.circle(ctx, x+116, y-368, 12, '#e0ffff');
    this.circle(ctx, x+124, y-304, 20, '#b0e0e6');
    // Snowflake effect
    this.px(ctx, x+136, y-448, 8, 8, '#fff');
    this.px(ctx, x+100, y-400, 8, 8, '#fff');
    // Legs
    this.px(ctx, x+36, y-136, 24, 64, '#000');
    this.px(ctx, x+60, y-136, 24, 64, '#000');
    // Sandals (waraji)
    this.px(ctx, x+32, y-72, 32, 72, '#8b4513');
    this.px(ctx, x+60, y-72, 32, 72, '#8b4513');
  }
  
  // GOKU - Orange gi, Kamehameha pose
  private drawGoku(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // SUPER SPIKY BLACK HAIR (4X)
    this.px(ctx, x+108, y-540, 40, 60, '#1a1a1a');
    this.px(ctx, x+72, y-512, 48, 60, '#1a1a1a');
    this.px(ctx, x+136, y-512, 48, 60, '#1a1a1a');
    this.px(ctx, x+60, y-452, 140, 60, '#1a1a1a');
    
    // HEAD/FACE
    this.circle(ctx, x+128, y-352, 68, '#f5c6a5');
    
    // DETERMINED EYES
    this.circle(ctx, x+100, y-360, 16, '#000');
    this.circle(ctx, x+156, y-360, 16, '#000');
    this.circle(ctx, x+96, y-364, 8, '#fff'); // shine
    this.circle(ctx, x+152, y-364, 8, '#fff');
    
    // CONFIDENT GRIN
    this.px(ctx, x+96, y-320, 64, 16, '#000');
    this.px(ctx, x+112, y-308, 32, 8, '#fff'); // teeth
    
    // NECK
    this.px(ctx, x+108, y-284, 40, 32, '#f5c6a5');
    
    // ORANGE GI TOP
    this.px(ctx, x+60, y-252, 136, 140, '#ff6600');
    // Blue undershirt collar
    this.px(ctx, x+96, y-252, 64, 32, '#4169e1');
    // Blue belt/sash
    this.px(ctx, x+72, y-160, 112, 32, '#4169e1');
    
    // TURTLE SCHOOL SYMBOL
    this.circle(ctx, x+112, y-200, 32, '#fff');
    ctx.save();
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('亀', x+112, y-188);
    ctx.restore();
    
    // KAMEHAMEHA POSE - arms at side charging
    this.px(ctx, x+40, y-232, 32, 100, '#ff6600');
    this.px(ctx, x+184, y-232, 32, 100, '#ff6600');
    // Hands at hips
    this.px(ctx, x+36, y-132, 40, 32, '#f5c6a5');
    this.px(ctx, x+180, y-132, 40, 32, '#f5c6a5');
    
    // ENERGY BALL forming between hands
    this.circle(ctx, x+128, y-120, 48, '#87ceeb');
    this.circle(ctx, x+128, y-120, 32, '#add8e6');
    this.circle(ctx, x+128, y-120, 16, '#fff');
    // Energy sparks
    this.circle(ctx, x+100, y-140, 12, '#fff');
    this.circle(ctx, x+156, y-140, 12, '#fff');
    this.circle(ctx, x+112, y-100, 8, '#87ceeb');
    this.circle(ctx, x+144, y-100, 8, '#87ceeb');
    
    // ORANGE PANTS
    this.px(ctx, x+72, y-128, 48, 112, '#ff6600');
    this.px(ctx, x+136, y-128, 48, 112, '#ff6600');
    
    // BLUE BOOTS with yellow trim
    this.px(ctx, x+68, y-16, 52, 24, '#4169e1');
    this.px(ctx, x+136, y-16, 52, 24, '#4169e1');
    this.px(ctx, x+68, y-24, 52, 8, '#FFD700');
    this.px(ctx, x+136, y-24, 52, 8, '#FFD700');
  }
  
  // VEGETA - Arms crossed, widow's peak, Saiyan armor (4X SIZE)
  private drawVegeta(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Widow's peak FLAME-LIKE spiky hair (SIGNATURE)
    this.px(ctx, x+48, y-592, 16, 32, '#1a1a1a');
    this.px(ctx, x+32, y-560, 64, 32, '#1a1a1a');
    this.px(ctx, x+16, y-528, 96, 64, '#1a1a1a');
    // Extra spikes
    this.px(ctx, x+8, y-496, 24, 24, '#1a1a1a');
    this.px(ctx, x+96, y-496, 24, 24, '#1a1a1a');
    // Face (permanent scowl - SIGNATURE)
    this.circle(ctx, x+56, y-416, 52, '#f5c6a5');
    // Angry narrow eyes
    this.px(ctx, x+32, y-424, 16, 8, '#1a1a1a');
    this.px(ctx, x+72, y-424, 16, 8, '#1a1a1a');
    // Angry eyebrows
    this.px(ctx, x+28, y-440, 24, 8, '#1a1a1a');
    this.px(ctx, x+68, y-440, 24, 8, '#1a1a1a');
    // Permanent frown
    this.px(ctx, x+44, y-392, 24, 4, '#8b4513');
    // Proud Saiyan stance - ARMS CROSSED (SIGNATURE)
    // White/gold Saiyan armor
    this.px(ctx, x+16, y-368, 96, 160, '#fff');
    // Gold trim
    this.px(ctx, x+24, y-352, 64, 16, '#ffd700');
    this.px(ctx, x+24, y-304, 64, 16, '#ffd700');
    // Shoulder pads
    this.px(ctx, x+8, y-368, 24, 48, '#fff');
    this.px(ctx, x+96, y-368, 24, 48, '#fff');
    // CROSSED ARMS
    this.px(ctx, x+24, y-304, 80, 48, '#f5c6a5');
    // White gloves
    this.px(ctx, x+8, y-288, 32, 32, '#fff');
    this.px(ctx, x+88, y-288, 32, 32, '#fff');
    // Blue spandex bodysuit
    this.px(ctx, x+24, y-208, 80, 96, '#191970');
    // Legs
    this.px(ctx, x+32, y-112, 28, 48, '#191970');
    this.px(ctx, x+68, y-112, 28, 48, '#191970');
    // White boots with gold tips
    this.px(ctx, x+28, y-64, 36, 64, '#fff');
    this.px(ctx, x+64, y-64, 36, 64, '#fff');
    // Gold boot tips
    this.px(ctx, x+28, y-16, 36, 16, '#ffd700');
    this.px(ctx, x+64, y-16, 36, 16, '#ffd700');
  }
}

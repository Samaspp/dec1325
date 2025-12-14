/**
 * BALLOON MODEL
 * 
 * LLD: Core data structure for balloon entities in the birthday celebration platform
 * 
 * Purpose:
 * - Define balloon properties including position, velocity, and visual attributes
 * - Support physics-based animations and collision detection
 * - Enable state management for balloon lifecycle (active, popping, popped)
 * 
 * Reusability: Can be extended for other animated entities in future features
 */

/**
 * Position Interface
 * Represents 2D coordinates on the canvas
 */
export interface Position {
  x: number; // Horizontal position in pixels
  y: number; // Vertical position in pixels
}

/**
 * Velocity Interface
 * Represents movement speed and direction in 2D space
 */
export interface Velocity {
  vx: number; // Horizontal velocity (pixels per frame)
  vy: number; // Vertical velocity (pixels per frame)
}

/**
 * Balloon State Enum
 * Defines possible states in the balloon lifecycle
 */
export enum BalloonState {
  ACTIVE = 'active',       // Balloon is floating and interactive
  POPPING = 'popping',     // Balloon pop animation in progress
  POPPED = 'popped'        // Balloon has been destroyed
}

/**
 * Balloon Color Enum
 * Predefined pixelated balloon colors
 */
export enum BalloonColor {
  RED = '#FF4444',
  BLUE = '#4444FF',
  GREEN = '#44FF44',
  YELLOW = '#FFFF44',
  PURPLE = '#FF44FF',
  ORANGE = '#FF8844',
  PINK = '#FF88CC',
  CYAN = '#44FFFF'
}

/**
 * Balloon Model
 * Complete representation of a balloon entity
 */
export interface Balloon {
  id: string;                    // Unique identifier for tracking
  number: number;                // Display number (1-29 for Joy's age)
  position: Position;            // Current position on screen
  velocity: Velocity;            // Current movement vector
  radius: number;                // Balloon radius for collision detection
  color: BalloonColor;           // Visual color (pixelated palette)
  state: BalloonState;           // Current lifecycle state
  mass: number;                  // Mass for physics calculations (affects impact)
  elasticity: number;            // Bounce coefficient (0-1)
  createdAt: number;             // Timestamp for age-based behaviors
}

/**
 * Collision Result Interface
 * Data structure returned from collision detection
 */
export interface CollisionResult {
  hasCollision: boolean;         // Whether collision occurred
  balloon1Id: string;            // First balloon involved
  balloon2Id: string;            // Second balloon involved
  impactForce: number;           // Magnitude of collision force
}

/**
 * Impact Effect Interface
 * Describes how nearby balloons react to a pop event
 */
export interface ImpactEffect {
  balloonId: string;             // Affected balloon ID
  velocityChange: Velocity;      // Delta velocity to apply
  distance: number;              // Distance from pop epicenter
}

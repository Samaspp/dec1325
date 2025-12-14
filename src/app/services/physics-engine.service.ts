import { Injectable } from '@angular/core';
import { 
  Balloon, 
  Position, 
  Velocity, 
  CollisionResult, 
  ImpactEffect,
  BalloonState 
} from '../models/balloon.model';

/**
 * PHYSICS ENGINE SERVICE
 * 
 * LLD: Centralized service for all physics calculations and collision detection
 * 
 * Responsibilities:
 * 1. Collision Detection: Check if two balloons overlap using circle collision algorithm
 * 2. Collision Response: Calculate new velocities after collision using conservation of momentum
 * 3. Boundary Collision: Handle collisions with screen edges (bounce effect)
 * 4. Impact Propagation: Calculate shockwave effects when a balloon pops
 * 5. Physics Updates: Apply velocity, gravity, and friction to balloon positions
 * 
 * Physics Principles Applied:
 * - Conservation of momentum for elastic collisions
 * - Inverse square law for impact force distribution
 * - Damping for realistic deceleration
 * 
 * Reusability: Injectable service can be used across multiple components
 * Future Extension: Can be extended for particle effects, wind forces, etc.
 */

@Injectable({
  providedIn: 'root'
})
export class PhysicsEngineService {
  
  // Physics constants for realistic behavior
  private readonly GRAVITY = 0.0; // No gravity for floating balloons
  private readonly FRICTION = 0.99; // Air resistance damping factor
  private readonly BOUNCE_DAMPING = 0.8; // Energy loss on wall collision
  private readonly MIN_VELOCITY = 0.1; // Minimum velocity threshold
  private readonly POP_IMPACT_RADIUS = 150; // Pixels - range of pop shockwave (reduced for realism)
  private readonly POP_IMPACT_FORCE = 8; // Base force magnitude for pop effect (reduced for natural movement)

  constructor() {}

  /**
   * LLD: COLLISION DETECTION
   * 
   * Algorithm: Circle-Circle Intersection
   * - Calculate distance between balloon centers
   * - Compare with sum of radii
   * - If distance < sum of radii → collision detected
   * 
   * @param balloon1 First balloon to check
   * @param balloon2 Second balloon to check
   * @returns CollisionResult with collision status and impact data
   */
  detectCollision(balloon1: Balloon, balloon2: Balloon): CollisionResult {
    // Only check active balloons
    if (balloon1.state !== BalloonState.ACTIVE || balloon2.state !== BalloonState.ACTIVE) {
      return {
        hasCollision: false,
        balloon1Id: balloon1.id,
        balloon2Id: balloon2.id,
        impactForce: 0
      };
    }

    // Calculate distance between centers
    const dx = balloon2.position.x - balloon1.position.x;
    const dy = balloon2.position.y - balloon1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check for overlap
    const minDistance = balloon1.radius + balloon2.radius;
    const hasCollision = distance < minDistance;
    
    // Calculate impact force based on velocity difference
    let impactForce = 0;
    if (hasCollision) {
      const relativeVelocity = Math.sqrt(
        Math.pow(balloon1.velocity.vx - balloon2.velocity.vx, 2) +
        Math.pow(balloon1.velocity.vy - balloon2.velocity.vy, 2)
      );
      impactForce = relativeVelocity * Math.min(balloon1.mass, balloon2.mass);
    }

    return {
      hasCollision,
      balloon1Id: balloon1.id,
      balloon2Id: balloon2.id,
      impactForce
    };
  }

  /**
   * LLD: COLLISION RESPONSE
   * 
   * Algorithm: Elastic Collision with Conservation of Momentum
   * 
   * Physics Formula:
   * v1' = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
   * v2' = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
   * 
   * Steps:
   * 1. Calculate collision normal (line between centers)
   * 2. Project velocities onto collision normal
   * 3. Apply conservation of momentum formula
   * 4. Update velocities with elasticity factor
   * 5. Separate overlapping balloons to prevent sticking
   * 
   * @param balloon1 First balloon in collision
   * @param balloon2 Second balloon in collision
   */
  resolveCollision(balloon1: Balloon, balloon2: Balloon): void {
    // Calculate collision normal (unit vector from b1 to b2)
    const dx = balloon2.position.x - balloon1.position.x;
    const dy = balloon2.position.y - balloon1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Avoid division by zero
    if (distance === 0) return;
    
    const nx = dx / distance; // Normal x component
    const ny = dy / distance; // Normal y component
    
    // Calculate relative velocity
    const dvx = balloon1.velocity.vx - balloon2.velocity.vx;
    const dvy = balloon1.velocity.vy - balloon2.velocity.vy;
    
    // Calculate relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;
    
    // Balloons are moving apart, no need to resolve
    if (dvn > 0) return;
    
    // Calculate impulse scalar using conservation of momentum
    const elasticity = (balloon1.elasticity + balloon2.elasticity) / 2;
    const impulse = (2 * dvn) / (balloon1.mass + balloon2.mass);
    
    // Apply impulse to velocities
    balloon1.velocity.vx -= impulse * balloon2.mass * nx * elasticity;
    balloon1.velocity.vy -= impulse * balloon2.mass * ny * elasticity;
    balloon2.velocity.vx += impulse * balloon1.mass * nx * elasticity;
    balloon2.velocity.vy += impulse * balloon1.mass * ny * elasticity;
    
    // Separate overlapping balloons to prevent sticking
    const overlap = balloon1.radius + balloon2.radius - distance;
    if (overlap > 0) {
      const separationRatio = overlap / 2;
      balloon1.position.x -= nx * separationRatio;
      balloon1.position.y -= ny * separationRatio;
      balloon2.position.x += nx * separationRatio;
      balloon2.position.y += ny * separationRatio;
    }
  }

  /**
   * LLD: BOUNDARY COLLISION DETECTION & RESPONSE
   * 
   * Algorithm: Check screen boundaries and reverse velocity component
   * 
   * Logic:
   * - Left boundary: x < radius → reverse vx, apply damping
   * - Right boundary: x > width - radius → reverse vx, apply damping
   * - Top boundary: y < radius → reverse vy, apply damping
   * - Bottom boundary: y > height - radius → reverse vy, apply damping
   * 
   * @param balloon Balloon to check
   * @param canvasWidth Screen width
   * @param canvasHeight Screen height
   */
  checkBoundaryCollision(balloon: Balloon, canvasWidth: number, canvasHeight: number): void {
    if (balloon.state !== BalloonState.ACTIVE) return;

    // Left boundary
    if (balloon.position.x - balloon.radius < 0) {
      balloon.position.x = balloon.radius;
      balloon.velocity.vx = Math.abs(balloon.velocity.vx) * this.BOUNCE_DAMPING;
    }
    
    // Right boundary
    if (balloon.position.x + balloon.radius > canvasWidth) {
      balloon.position.x = canvasWidth - balloon.radius;
      balloon.velocity.vx = -Math.abs(balloon.velocity.vx) * this.BOUNCE_DAMPING;
    }
    
    // Top boundary
    if (balloon.position.y - balloon.radius < 0) {
      balloon.position.y = balloon.radius;
      balloon.velocity.vy = Math.abs(balloon.velocity.vy) * this.BOUNCE_DAMPING;
    }
    
    // Bottom boundary
    if (balloon.position.y + balloon.radius > canvasHeight) {
      balloon.position.y = canvasHeight - balloon.radius;
      balloon.velocity.vy = -Math.abs(balloon.velocity.vy) * this.BOUNCE_DAMPING;
    }
  }

  /**
   * LLD: IMPACT EFFECT CALCULATION
   * 
   * Algorithm: Inverse Square Law for Shockwave Propagation
   * 
   * Physics:
   * - When a balloon pops, it creates a radial force
   * - Force decreases with distance (inverse square law)
   * - Closer balloons experience stronger push
   * 
   * Formula:
   * force = BASE_FORCE * (1 - distance / MAX_RADIUS)²
   * 
   * Steps:
   * 1. Find all balloons within impact radius
   * 2. Calculate distance from pop epicenter
   * 3. Compute force magnitude using inverse square
   * 4. Calculate force direction (away from epicenter)
   * 5. Convert force to velocity change
   * 
   * @param poppedPosition Position where balloon popped
   * @param activeBalloons List of active balloons to affect
   * @returns Array of impact effects to apply
   */
  calculatePopImpact(poppedPosition: Position, activeBalloons: Balloon[]): ImpactEffect[] {
    const impacts: ImpactEffect[] = [];

    activeBalloons.forEach(balloon => {
      // Calculate distance from pop epicenter
      const dx = balloon.position.x - poppedPosition.x;
      const dy = balloon.position.y - poppedPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only affect balloons within impact radius
      if (distance < this.POP_IMPACT_RADIUS && distance > 0) {
        // Calculate force using inverse cubic law for more realistic falloff
        // Nearby balloons get strong push, distant ones barely affected
        const normalizedDistance = distance / this.POP_IMPACT_RADIUS;
        const forceMagnitude = this.POP_IMPACT_FORCE * Math.pow(1 - normalizedDistance, 3);
        
        // Calculate force direction (unit vector away from epicenter)
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        // Convert force to velocity change (F = ma, a = F/m, Δv = a * Δt)
        // Assuming Δt = 1 frame for simplicity
        const velocityChangeX = forceX / balloon.mass;
        const velocityChangeY = forceY / balloon.mass;
        
        impacts.push({
          balloonId: balloon.id,
          velocityChange: {
            vx: velocityChangeX,
            vy: velocityChangeY
          },
          distance
        });
      }
    });

    return impacts;
  }

  /**
   * LLD: PHYSICS UPDATE
   * 
   * Algorithm: Euler Integration for Position Update
   * 
   * Steps:
   * 1. Apply gravity (if any) to vertical velocity
   * 2. Apply friction/air resistance to all velocities
   * 3. Update position based on velocity (p' = p + v * dt)
   * 4. Stop balloons with velocity below threshold
   * 
   * @param balloon Balloon to update
   * @param deltaTime Time elapsed since last frame (for frame-rate independence)
   */
  updatePhysics(balloon: Balloon, deltaTime: number = 1): void {
    if (balloon.state !== BalloonState.ACTIVE) return;

    // Apply gravity (currently disabled for floating effect)
    balloon.velocity.vy += this.GRAVITY * deltaTime;
    
    // Apply friction/air resistance
    balloon.velocity.vx *= this.FRICTION;
    balloon.velocity.vy *= this.FRICTION;
    
    // Update position using Euler integration
    balloon.position.x += balloon.velocity.vx * deltaTime;
    balloon.position.y += balloon.velocity.vy * deltaTime;
    
    // Stop nearly stationary balloons to save computation
    if (Math.abs(balloon.velocity.vx) < this.MIN_VELOCITY) {
      balloon.velocity.vx = 0;
    }
    if (Math.abs(balloon.velocity.vy) < this.MIN_VELOCITY) {
      balloon.velocity.vy = 0;
    }
  }

  /**
   * LLD: RANDOM VELOCITY GENERATOR
   * 
   * Utility: Generate random velocity for balloon initialization
   * 
   * @param minSpeed Minimum speed magnitude
   * @param maxSpeed Maximum speed magnitude
   * @returns Random velocity vector
   */
  generateRandomVelocity(minSpeed: number = 0.5, maxSpeed: number = 2): Velocity {
    const angle = Math.random() * 2 * Math.PI; // Random direction
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
  }

  /**
   * LLD: DISTANCE CALCULATOR
   * 
   * Utility: Calculate Euclidean distance between two positions
   * 
   * @param pos1 First position
   * @param pos2 Second position
   * @returns Distance in pixels
   */
  calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

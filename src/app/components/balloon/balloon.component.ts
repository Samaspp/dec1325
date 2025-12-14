import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Balloon, BalloonState } from '../../models/balloon.model';

/**
 * BALLOON COMPONENT
 * 
 * LLD: Reusable balloon visual component with pixelated art style
 * 
 * Responsibilities:
 * 1. Render balloon using CSS pixelated art
 * 2. Handle click events for popping interaction
 * 3. Animate balloon pop effect
 * 4. Emit events for parent component coordination
 * 
 * Component Architecture:
 * - Input: Balloon data model (position, color, state)
 * - Output: Click events for pop interaction
 * - Standalone: Uses CommonModule for *ngIf, *ngClass
 * 
 * Reusability:
 * - Can be used in any container component
 * - Self-contained styling with pixelated theme
 * - Event-driven communication pattern
 * 
 * Animation Flow:
 * 1. Active state: Normal floating balloon
 * 2. Popping state: Scale up + fade out (300ms)
 * 3. Popped state: Removed from DOM
 */

@Component({
  selector: 'app-balloon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balloon.component.html',
  styleUrls: ['./balloon.component.css']
})
export class BalloonComponent implements OnInit, OnDestroy {
  
  /**
   * INPUT: Balloon data model
   * Contains all properties needed for rendering and physics
   */
  @Input() balloon!: Balloon;
  
  /**
   * OUTPUT: Click event emitter
   * Emits balloon ID when clicked for pop handling
   */
  @Output() balloonClicked = new EventEmitter<string>();
  
  /**
   * Local state for animation control
   */
  isPopping = false;
  
  // Expose enum for template usage
  BalloonState = BalloonState;

  constructor() {}

  ngOnInit(): void {
    // Component initialization
    // Future: Add particle effect initialization here
  }

  /**
   * LLD: CLICK HANDLER
   * 
   * Algorithm: Pop Interaction Logic
   * 
   * Flow:
   * 1. Check if balloon is in ACTIVE state (prevent double-click)
   * 2. Set local popping flag for animation trigger
   * 3. Emit click event to parent component
   * 4. Parent handles physics and state updates
   * 
   * @param event Mouse click event
   */
  onBalloonClick(event: MouseEvent): void {
    // Prevent click propagation to parent elements
    event.stopPropagation();
    
    // Only allow clicking active balloons
    if (this.balloon.state === BalloonState.ACTIVE) {
      this.isPopping = true;
      this.balloonClicked.emit(this.balloon.id);
    }
  }

  /**
   * LLD: STYLE GETTER
   * 
   * Purpose: Generate dynamic inline styles for balloon positioning
   * 
   * Returns:
   * - Position: Absolute positioning based on balloon.position
   * - Transform: Center balloon on its position coordinates
   * - Z-index: Stack order (optional, can be based on y-position)
   * 
   * @returns Style object for [ngStyle] binding
   */
  getBalloonStyles(): { [key: string]: string } {
    return {
      'left': `${this.balloon.position.x}px`,
      'top': `${this.balloon.position.y}px`,
      'transform': `translate(-50%, -50%)` // Center balloon on position
    };
  }

  /**
   * LLD: CLASS GETTER
   * 
   * Purpose: Generate dynamic CSS classes for state-based styling
   * 
   * Returns class map:
   * - balloon-active: Normal state
   * - balloon-popping: Pop animation
   * - Color-specific classes: For different balloon colors
   * 
   * @returns Class object for [ngClass] binding
   */
  getBalloonClasses(): { [key: string]: boolean } {
    return {
      'balloon-active': this.balloon.state === BalloonState.ACTIVE && !this.isPopping,
      'balloon-popping': this.balloon.state === BalloonState.POPPING || this.isPopping
    };
  }

  ngOnDestroy(): void {
    // Cleanup if needed
    // Future: Cleanup particle effects or subscriptions
  }
}

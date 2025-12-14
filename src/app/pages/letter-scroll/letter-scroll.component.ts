import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LETTER_CONTENT, LetterConfig } from '../../config/letter.config';

/**
 * LETTER SCROLL COMPONENT
 * 
 * LLD: Minecraft-style pixelated scroll with personal letter
 * 
 * Responsibilities:
 * 1. Display old-style parchment scroll with pixelated design
 * 2. Show personal letter content (externalized for privacy)
 * 3. Animate pixelated character at bottom
 * 4. Provide heart button for navigation
 * 
 * Design Theme:
 * - Minecraft-inspired pixelated aesthetic
 * - Old parchment scroll appearance
 * - Retro game-style character sprite
 * - Interactive pixel art elements
 * 
 * Privacy:
 * - Letter content is externalized in config file
 * - Config can be gitignored for private deployment
 * - Easy to swap content without code changes
 * 
 * Reusability:
 * - Can be used for any letter/message display
 * - Character and heart are customizable
 * - Scroll design can be adapted for other content
 */

@Component({
  selector: 'app-letter-scroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-scroll.component.html',
  styleUrls: ['./letter-scroll.component.css']
})
export class LetterScrollComponent implements OnInit {
  
  // Letter content from config
  letterContent: LetterConfig = LETTER_CONTENT;
  
  // Character animation state
  characterAnimating = false;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Start character idle animation
    this.startCharacterAnimation();
  }

  /**
   * LLD: CHARACTER ANIMATION
   * 
   * Purpose: Animate the pixelated character
   * Simple breathing/idle animation loop
   */
  private startCharacterAnimation(): void {
    setInterval(() => {
      this.characterAnimating = !this.characterAnimating;
    }, 1000); // Toggle every second for breathing effect
  }

  /**
   * LLD: HEART CLICK HANDLER
   * 
   * Purpose: Navigate to next page when heart is clicked
   * Adds a little scale animation before navigation
   */
  onHeartClick(): void {
    // Add a small delay for animation feedback
    setTimeout(() => {
      this.router.navigate(['/final-page']);
    }, 300);
  }

  /**
   * LLD: SCROLL TO TOP
   * 
   * Purpose: Smooth scroll to top of letter
   * Useful for long letters
   */
  scrollToTop(): void {
    const scrollContainer = document.querySelector('.scroll-content');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

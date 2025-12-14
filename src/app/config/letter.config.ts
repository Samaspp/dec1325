/**
 * LETTER CONFIGURATION
 * 
 * LLD: Externalized letter content for privacy
 * 
 * Purpose:
 * - Store personal letter content separately
 * - Allow content to be gitignored for privacy
 * - Easy to update without touching component code
 * 
 * Usage:
 * - Import this file in letter-scroll component
 * - Replace content with your personal message
 * - Add to .gitignore to keep private
 */

export interface LetterConfig {
  greeting: string;
  paragraphs: string[];
  signature: string;
}

/**
 * Default letter content
 * Replace with your personal message!
 */
export const LETTER_CONTENT: LetterConfig = {
  greeting: "Dear Joy,",
  paragraphs: [
    "Happy 29th Birthday! Sorry to your eyes for the previous screen. Blink a few times before you proceed.",

    "Her we are! Another year of adventures, growth, and amazing memories. You've accomplished so much this year, and I'm so proud and in awe of everything you've achieved.",
    
    "The past year must have been quite a rollercoaster ride for you. A year of hardwork, accomplishments, travels, changing environments, good food and conversations. You were put into a lot of new scenarios, a lot of unfamiliar landscapes, yet you stayed strong and continue to march through it all. Each moment has been a treasure, and I'm grateful for every single one.",
    
    "As you step into this new year of your life, I hope it brings you endless joy, success in all your endeavors, and the courage to chase every dream that sets your heart on fire.",
    
    "You deserve all the happiness in the world, and I know this year will be extraordinary for you. You wonderous soul, keep being the incredible person you are!",
    
    "Here's to 29 years of being awesome, and to many more years of friendship, laughter, and unforgettable moments."
  ],
  signature: "With love and best wishes,\nSami"
};

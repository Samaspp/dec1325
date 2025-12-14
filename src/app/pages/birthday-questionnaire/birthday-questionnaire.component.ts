/**
 * BIRTHDAY QUESTIONNAIRE COMPONENT
 * 
 * Chinese Donghua themed questionnaire
 * Saves answers to localStorage
 * Exports as downloadable report
 */

import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface QuestionnaireData {
  name: string;
  age: string;
  currentLocation: string;
  currentAttire: string;
  birthdayDescription: string;
  favouriteSong: string;
  favouriteColour: string;
  favouriteMovie: string;
  favouriteThingAboutYourself: string;
  plansForThisYear: string;
  peopleLastYear: string;
  randomMemory: string;
}

@Component({
  selector: 'app-birthday-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './birthday-questionnaire.component.html',
  styleUrl: './birthday-questionnaire.component.css'
})
export class BirthdayQuestionnaireComponent implements OnInit {
  formData: QuestionnaireData = {
    name: '',
    age: '',
    currentLocation: '',
    currentAttire: '',
    birthdayDescription: '',
    favouriteSong: '',
    favouriteColour: '',
    favouriteMovie: '',
    favouriteThingAboutYourself: '',
    plansForThisYear: '',
    peopleLastYear: '',
    randomMemory: ''
  };

  showConfetti = false;
  isSubmitted = false;
  currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  private isBrowser: boolean;
  
  // Confetti arrays for massive celebration
  confettiArray1 = Array(80).fill(0);
  confettiArray2 = Array(80).fill(0);
  confettiArray3 = Array(80).fill(0);

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  
  /**
   * Get random position for confetti
   */
  getRandomPosition(): number {
    return Math.random() * 100;
  }
  
  /**
   * Get random delay for confetti
   */
  getRandomDelay(): number {
    return Math.random() * 3;
  }

  ngOnInit(): void {
    // Load from localStorage if exists
    if (this.isBrowser) {
      const saved = localStorage.getItem('birthdayQuestionnaire');
      if (saved) {
        this.formData = JSON.parse(saved);
      }
    }
  }

  /**
   * Save to localStorage on every change
   */
  saveToLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('birthdayQuestionnaire', JSON.stringify(this.formData));
    }
  }

  /**
   * Check if form is complete
   */
  get isFormComplete(): boolean {
    return Object.values(this.formData).every(val => val.trim().length > 0);
  }

  /**
   * Submit questionnaire
   */
  submitQuestionnaire(): void {
    if (!this.isFormComplete) return;

    this.saveToLocalStorage();
    this.isSubmitted = true;
  }

  /**
   * Send via Gmail web interface
   */
  sendViaGmail(): void {
    const subject = encodeURIComponent('Birthday Questionnaire - Joy');
    const htmlBody = this.formatQuestionnaireHTML();
    const body = encodeURIComponent(htmlBody);
    
    // Use Gmail web compose URL to avoid opening Thunderbird
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    
    if (this.isBrowser) {
      window.open(gmailUrl, '_blank');
    }
  }

  /**
   * Download as text file
   */
  downloadQuestionnaire(): void {
    const text = this.formatQuestionnaireText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday-questionnaire-joy.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format questionnaire as HTML for email (shortened for URL compatibility)
   */
  private formatQuestionnaireHTML(): string {
    return `BIRTHDAY QUESTIONNAIRE 

Name: ${this.formData.name}
Age: ${this.formData.age}

Birthday: ${this.formData.birthdayDescription}
Favorite Song: ${this.formData.favouriteSong}
Favorite Color: ${this.formData.favouriteColour}
Favorite Movie: ${this.formData.favouriteMovie}
Plans This Year: ${this.formData.plansForThisYear}

Date: ${new Date().toLocaleDateString()}`;
  }

  /**
   * Format questionnaire as text for download (full version)
   */
  private formatQuestionnaireText(): string {
    return `
BIRTHDAY QUESTIONNAIRE 
━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${this.formData.name}
Age: ${this.formData.age}
Current Location: ${this.formData.currentLocation}
Current Attire: ${this.formData.currentAttire}

━━━━━━━━━━━━━━━━━━━━━━━━━━

BIRTHDAY DESCRIPTION:
${this.formData.birthdayDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━

Favourite Song: ${this.formData.favouriteSong}
Favourite Colour: ${this.formData.favouriteColour}
Favourite Movie: ${this.formData.favouriteMovie}
Favourite Thing About Yourself: ${this.formData.favouriteThingAboutYourself}

━━━━━━━━━━━━━━━━━━━━━━━━━━

Plans for This Year: ${this.formData.plansForThisYear}
People You've Been With Last Year: ${this.formData.peopleLastYear}

━━━━━━━━━━━━━━━━━━━━━━━━━━

RANDOM MEMORY OF THE PAST YEAR:
${this.formData.randomMemory}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Filled on: ${new Date().toLocaleDateString()}
    `.trim();
  }

  /**
   * Show final confetti celebration
   */
  showFinalCelebration(): void {
    this.showConfetti = true;
    
    // Play trumpet sound and create confetti effect
    if (this.isBrowser) {
      this.playTrumpetSound();
    }
  }
  
  /**
   * Play trumpet/celebration sound
   */
  private playTrumpetSound(): void {
    try {
      // Create audio context for trumpet fanfare
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.2 },  // E5
        { freq: 783.99, time: 0.4 },  // G5
        { freq: 1046.50, time: 0.6 }, // C6 (trumpet fanfare)
      ];
      
      notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + 0.5);
        
        oscillator.start(audioContext.currentTime + note.time);
        oscillator.stop(audioContext.currentTime + note.time + 0.5);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }

  /**
   * Trigger confetti animation
   */
  private triggerConfetti(): void {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Create confetti particles manually
      for (let i = 0; i < particleCount; i++) {
        this.createConfettiParticle(randomInRange(0, 1), randomInRange(0.1, 0.3));
      }
    }, 250);
  }

  /**
   * Create a single confetti particle
   */
  private createConfettiParticle(x: number, y: number): void {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = `${x * 100}%`;
    particle.style.top = `${y * 100}%`;
    particle.style.backgroundColor = this.getRandomColor();
    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 5000);
  }

  /**
   * Get random confetti color
   */
  private getRandomColor(): string {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Navigate back to home
   */
  goHome(): void {
    this.router.navigate(['/birthday-home']);
  }
}

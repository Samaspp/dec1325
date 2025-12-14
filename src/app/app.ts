import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * ROOT APP COMPONENT
 * 
 * LLD: Main application shell component
 * 
 * Responsibilities:
 * - Host router outlet for page navigation
 * - Provide consistent layout structure
 * - Manage global application state (if needed)
 * 
 * Architecture:
 * - Standalone component using RouterOutlet
 * - Minimal logic - acts as container for routed pages
 * - Global styles applied at app level
 * 
 * Reusability:
 * - Standard Angular application structure
 * - Easy to extend with global services/state
 */

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Joy\'s 29th Birthday Celebration';
}

import { Routes } from '@angular/router';

/**
 * APPLICATION ROUTES
 * 
 * LLD: Route configuration for birthday celebration platform
 * 
 * Route Structure:
 * - '' (root): Redirects to birthday-home
 * - 'birthday-home': Main celebration page with balloons
 * - 'next-page': Placeholder for next celebration feature
 * 
 * Architecture:
 * - Lazy loading components for performance
 * - Standalone components (no modules needed)
 * 
 * Future Extensions:
 * - Add route guards for sequential navigation
 * - Add route animations/transitions
 * - Add route resolvers for data pre-loading
 */

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'birthday-home',
    pathMatch: 'full'
  },
  {
    path: 'birthday-home',
    loadComponent: () => import('./pages/birthday-home/birthday-home.component')
      .then(m => m.BirthdayHomeComponent),
    title: 'Happy Birthday Joy! '
  },
  {
    path: 'next-page',
    loadComponent: () => import('./pages/letter-scroll/letter-scroll.component')
      .then(m => m.LetterScrollComponent),
    title: 'A Letter for Joy '
  },
  {
    path: 'final-page',
    loadComponent: () => import('./pages/csgo-weapons/csgo-weapons.component')
      .then(m => m.CsgoWeaponsComponent),
    title: 'Face the opponent'
  },
  {
    path: 'hogwarts-flying',
    loadComponent: () => import('./pages/hogwarts-flying/hogwarts-flying.component')
      .then(m => m.HogwartsFlyingComponent),
    title: 'Hogwarts Flying Adventure'
  },
  {
    path: 'questionnaire',
    loadComponent: () => import('./pages/birthday-questionnaire/birthday-questionnaire.component')
      .then(m => m.BirthdayQuestionnaireComponent),
    title: 'Birthday Questionnaire'
  },
  {
    path: '**',
    redirectTo: 'birthday-home'
  }
];

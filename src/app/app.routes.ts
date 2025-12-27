import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Preferences } from './pages/preferences/preferences';
import { Game } from './pages/game/game';
import { Records } from './pages/records/records';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Logout } from './pages/logout/logout';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Sin slash; ruta relativa
  { path: 'home', component: Home },
  { path: 'preferences', component: Preferences },
  { path: 'game', component: Game },
  { path: 'records', component: Records },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'logout', component: Logout },

  // Comodín: siempre al final (Angular lee por orden, como en CSS)
  { path: '**', redirectTo: '/home' },
];

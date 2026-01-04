import { Routes } from '@angular/router';

import { Home } from './pages/home/home.component';
import { Preferences } from './pages/preferences/preferences.component';
import { Game } from './pages/game/game.component';
import { Records } from './pages/records/records.component';

import { Register } from './pages/register/register.component';
import { Login } from './pages/login/login.component';
import { Logout } from './pages/logout/logout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Sin slash; ruta relativa
  { path: 'home', component: Home },
  { path: 'preferences', component: Preferences },
  { path: 'play', component: Game },
  { path: 'records', component: Records },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'logout', component: Logout },

  // Comodín: siempre al final (Angular lee por orden, como en CSS)
  { path: '**', redirectTo: '/home' },
];

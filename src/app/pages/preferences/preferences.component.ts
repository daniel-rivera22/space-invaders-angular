import { Component, inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  private gameService = inject(GameService);
  private router = inject(Router);

  preferencesForm = new FormGroup({
    numberOfUfos: new FormControl(''),
    time: new FormControl(''),
    doubleSpeed: new FormControl(''),
  });
}

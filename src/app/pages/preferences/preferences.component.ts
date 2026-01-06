import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GamePreferences, DEFAULT_GAME_PREFERENCES } from '../../models/gameModels';

@Component({
  selector: 'app-preferences',
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  private readonly router = inject(Router);
  private readonly GameService = inject(GameService);

  preferencesForm = new FormGroup({
    numberOfUfos: new FormControl(
      DEFAULT_GAME_PREFERENCES.UFOS_TO_DEPLOY,
      { validators: [Validators.min(1), Validators.max(9)] }
    ),
    time: new FormControl(
      DEFAULT_GAME_PREFERENCES.GAME_TIME,
      { validators: [Validators.min(60), Validators.max(180)] }
    ),
    doubleSpeed: new FormControl(DEFAULT_GAME_PREFERENCES.DOUBLE_SPEED),
  });

  onSubmit() {
    if (this.preferencesForm.invalid) {
      alert('Formulario no válido. Revise los campos y vuelva a enviar.');
      this.preferencesForm.markAllAsTouched();
      return;
    }

    const preferences: GamePreferences = {
      // Spread operators -> desempaqueta los operadores para completar por defecto
      ...DEFAULT_GAME_PREFERENCES,

      // Después, se sobreescribe con los valores que SI haya introducido el usuario
      GAME_TIME: Number(this.preferencesForm.value.time),
      UFOS_TO_DEPLOY: Number(this.preferencesForm.value.numberOfUfos),
      DOUBLE_SPEED: Boolean(this.preferencesForm.value.doubleSpeed),
    };

    this.GameService.setGamePreferences(preferences);
    this.router.navigate(['/play']);
  }
}

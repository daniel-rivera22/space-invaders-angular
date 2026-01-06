import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  preferencesForm = new FormGroup({
    numberOfUfos: new FormControl(Validators.min(1), Validators.max(9)),
    time: new FormControl(Validators.min(60), Validators.max(180)),
    doubleSpeed: new FormControl(),
  });

  //TODO: Implementar validador personalizado para simular `step` del formulario HTML
}

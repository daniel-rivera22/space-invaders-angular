import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-preferences',
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  preferencesForm = new FormGroup({
    numberOfUfos: new FormControl(''),
    time: new FormControl(''),
    doubleSpeed: new FormControl(''),
  });
}

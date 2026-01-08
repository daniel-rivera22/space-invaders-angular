import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService, MAX_USERNAME_LENGTH } from '../../services/auth.service';
import { createNonNullableFormControl } from '../../utils/formFactories';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  public readonly authService = inject(AuthService);

  loginForm = new FormGroup({
    username: createNonNullableFormControl('user1', {validators: Validators.maxLength(MAX_USERNAME_LENGTH)}),
    password: createNonNullableFormControl('user1'),
  });

  onSubmit(){
    if(this.loginForm.invalid) this.loginForm.markAllAsTouched();
    else{
      const { username, password } = this.loginForm.getRawValue();
      this.authService.login(username, password);
    }
  }
}

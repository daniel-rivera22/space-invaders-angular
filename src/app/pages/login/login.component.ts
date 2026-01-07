import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { createNonNullableFormControl } from '../../utils/formFactories';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  public readonly authServer = inject(AuthService);

  loginForm = new FormGroup({
    username: createNonNullableFormControl('user1'),
    password: createNonNullableFormControl('user1'),
  });

  onSubmit(){
    if(this.loginForm.invalid){
      alert("Formulario incorrecto. Faltan parámetros");
      this.loginForm.markAllAsTouched();
    }
    else{
      const { username, password } = this.loginForm.getRawValue();
      this.authServer.login(username, password);
    }
  }
}

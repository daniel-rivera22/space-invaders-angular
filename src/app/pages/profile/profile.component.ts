import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordRequest, UserService } from '../../services/user.service';
import { isSamePassword } from '../register/register.component';
import { FormGroup } from '@angular/forms';
import { createNonNullableFormControl } from '../../utils/formFactories';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  profileForm = new FormGroup(
    {
      password: createNonNullableFormControl(''),
      confirmPassword: createNonNullableFormControl(''),
    },
    { validators: isSamePassword },
  );

  onSubmit(): void {
    // Por si acaso no hubiese [disabled] en el botón o se eliminase dicha propiedad editando el HTML
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const username = this.authService.getCurrentUser();
    const { password } = this.profileForm.getRawValue();

    if(username){
      const changePasswordData: ChangePasswordRequest = { username, password };
      this.userService.changePassword(changePasswordData);
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../core/services/User/user.service';
import { DialogService } from '../../core/services/dialog.service';
import { ConfirmOtp } from '../confirm-otp/confirm-otp';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ConfirmOtp],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email: string = '';
  password: string = '';
  togglePass = false;

  dialogService = inject(DialogService);

  constructor(private userService: UserService) {}
  onRegister() {
    this.userService
      .register({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          localStorage.setItem('email', this.email);
          alert('Registered successfully');
          this.close();
          this.dialogService.openDialog('confirmOtp');
          (window as any).startOtpTimerR?.();
        },
        error: (err) => {
          alert('Register failed');
          console.error(err);
        },
      });
  }

  showPass() {
    this.togglePass = !this.togglePass;
  }

  close() {
    this.dialogService.closeDialog();
  }
}

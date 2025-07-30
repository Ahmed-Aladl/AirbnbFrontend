import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../core/services/User/user.service';
import { DialogService } from '../../core/services/dialog.service';
import { HandleImgService } from '../../core/services/handleImg.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  handleImgService = inject(HandleImgService);
  @Input() user: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.firstName ?? '' : '';
  })();

  ifImg: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.profilePictureURL ?? '' : '';
  })();

  @Input() img: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return this.handleImgService.handleImage(
      storedUser ? JSON.parse(storedUser)?.profilePictureURL ?? '' : ''
    );
  })();

  @Input() lastLoginEmail: string = localStorage.getItem('email') || '';
  togglePass = false;
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');

    if (!username || !domain) return email;

    const visibleStart = username.slice(0, 2);
    const visibleEnd = username.slice(-2);

    const maskedMiddle = '•'.repeat(Math.max(username.length - 4, 0));

    return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
  }

  email: string = localStorage.getItem('email') || '';
  password: string = '';

  dialogService = inject(DialogService);

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    this.userService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          alert('Logged in successfully');
          this.close();
          this.userService.getProfile(res.userId).subscribe({
            next: (res) => {
              console.log(res);
              localStorage.setItem('email', res.email);
              localStorage.setItem('user', JSON.stringify(res));
              (window as any).Logging?.();

              if (res.firstName === null) {
                this.router.navigate(['/take-info/' + this.authService.userId]);
              } else {
                this.router.navigate(['/']);
              }
            },
            error: (err) => {
              console.error(err);
            },
          });
        },
        error: (err) => {
          alert('Login failed');
          console.error(err);
        },
      });
  }

  close() {
    this.dialogService.closeDialog();
  }

  switchToRegister() {
    this.dialogService.openDialog('register');
  }

  switchToForgot() {
    let email = localStorage.getItem('email');

    if (this.email && this.email.trim() !== '') {
      email = this.email.trim();
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    this.userService.resendOtp({ email: email as string }).subscribe({
      next: () => {
        alert('OTP sent successfully');
        this.dialogService.openDialog('resetPassword');
        (window as any).startOtpTimer?.();
      },
      error: (err) => {
        alert('OTP sending failed');
        console.error(err);
      },
    });
  }

  showPass() {
    this.togglePass = !this.togglePass;
  }
}

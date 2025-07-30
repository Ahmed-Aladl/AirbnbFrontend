import { Component, inject } from '@angular/core';
import { UserService } from '../../core/services/User/user.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-profile',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css',
})
export class UpdateProfile {
  authService = inject(AuthService);
  constructor(private userService: UserService, private router: Router) {}

  userId = this.authService.userId || '';
  firstName: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.firstName ?? '' : '';
  })();
  lastName: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.lastName ?? '' : '';
  })();
  phoneNumber: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.phoneNumber ?? '' : '';
  })();
  country: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.country ?? '' : '';
  })();

  birthDate: any = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.birthDate ?? '' : '';
  };
  bio: string | null = (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.bio ?? '' : '';
  })();

  onUpdateProfile() {
    const updatedUser = {
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      country: this.country,
      birthDate: this.birthDate,
      bio: this.bio,
    };

    this.userService.updateProfile(this.userId, updatedUser).subscribe({
      next: (res) => {
        alert('Profile updated successfully');
        this.userService.getProfile(this.userId).subscribe({
            next: (res) => {
              console.log(res);
              localStorage.setItem('email', res.email);
              localStorage.setItem('user', JSON.stringify(res));
              this.router.navigate(['/profile/'+this.userId]);
            },
            error: (err) => {
              console.error(err);
            },
          });
      },
      error: (err) => {
        alert('Profile update failed');
        console.error(err);
      },
    });
  }
}

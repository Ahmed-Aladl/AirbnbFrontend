import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.baseUrl}/User`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  login(payload: { email: string; password: string }): Observable<any> {
    console.log(payload);
    return this.http.post(`${this.baseUrl}/login`, payload,{withCredentials:true}).pipe(
      tap((response: any) => {
        this.authService.setAccessToken(response.accessToken);
        this.authService.setRefreshToken(response.refreshToken);
        this.authService.setUserId(response.userId);
        this.authService.setRole(response.roles);
      })
    );
  }

  register(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }

  logout(): void {
    this.authService.clear();
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.authService.refreshToken;
    return this.http
      .post(`${this.baseUrl}/refresh-token`, {
        refreshToken: refreshToken,
      })
      .pipe(
        tap((response: any) => {
          this.authService.setAccessToken(response.accessToken);
          this.authService.setRefreshToken(response.refreshToken);
        })
      );
  }

  confirmOtp(payload: { email: string; code: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, payload).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }
  resendOtp(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-reset-otp`, payload).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }

  resetPass(payload: {
    email: string;
    newPassword: string;
    code: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, payload).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }

  getProfile(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile/${id}`).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }
  updateProfile(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile/${id}`, payload).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }
  Logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap((response: any) => {
        console.log(response);
      })
    );
  }
}
